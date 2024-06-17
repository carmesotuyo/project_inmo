import { ReservationRequest } from '../dtos/reservationRequest';
import { Reservation } from '../data-access/reservation';
import { Property } from '../data-access/property';
import { ReservationService } from '../interfaces/services/reservationService';
import { PropertyAvailabilityService } from '../interfaces/services/propertyAvailabilityService';
import { checkDateOverlap } from '../utils/dateUtils';
import { CountryService } from '../interfaces/services/countryService';
import { PropertyService } from '../interfaces/services/propertyService';
import { ReservationFilterOptions } from '../utils/reservationFilters';
import { ReservationFilter } from '../utils/reservationFilters';
import { PaymentService } from '../interfaces/services/paymentService';
// Importamos el DTO
import { Op } from 'sequelize';

export class ReservationServiceImpl implements ReservationService {
  constructor(
    private propertyAvailabilityService: PropertyAvailabilityService,
    private countryService: CountryService,
    private propertyService: PropertyService,
    private paymentService: PaymentService,
  ) {}
  async createReservation(data: ReservationRequest): Promise<InstanceType<typeof Reservation>> {
    if (!data) throw Error('Data incorrecta, DTO vacio');
    const { propertyId, adults, children, startDate, endDate, inquilino } = data;

    // Obtener la propiedad de la base de datos
    const property = await Property.findByPk(propertyId);
    if (!property) throw new Error('Propiedad no encontrada');

    const hasCapacity = this.validatePropertyCapacity(property, adults, children);
    if (!hasCapacity) throw new Error('La cantidad de personas excede la capacidad del inmueble');

    // Validar disponibilidad del inmueble
    const isAvailable = await this.checkAvailability(propertyId, startDate, endDate);
    if (!isAvailable) throw new Error('El inmueble no está disponible para el período solicitado');

    const pricePerNight = property.get('pricePerNight') as number;
    const start = new Date(startDate); // Convertir startDate a Date
    const end = new Date(endDate); // Convertir endDate a Date
    const numberOfNights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    // Crear reserva pendiente de aprobación
    const reservationObject = {
      propertyId,
      startDate,
      endDate,
      status: 'Pending Approval',
      adults,
      children,
      inquilino,
      amountPaid: pricePerNight * numberOfNights,
    };
    //Faltaria agregar que llegue notifiacion al admin para que apruebe la reserva
    const reservation = await Reservation.create(reservationObject);
    this.propertyAvailabilityService.adjustPropertyAvailabilityFromReservationDates(propertyId, startDate, endDate);
    // TODO: llamar al servicio den notificaciones para enviar la notificacion
    return reservation;
  }
  async getReservationByEmailAndCode(email: string, reservationCode: string): Promise<InstanceType<typeof Reservation> | null> {
    const reservation = await Reservation.findOne({
      where: {
        id: reservationCode,
        'inquilino.email': email,
      },
    });
    return reservation;
  }
  async getReservationsAdmin(filters: ReservationFilterOptions): Promise<InstanceType<typeof Reservation>[]> {
    // Validar que sea admin/operario
    const reservationFilter = new ReservationFilter(filters);
    const whereClause = await reservationFilter.buildWhereClause();

    return await Reservation.findAll({ where: whereClause, limit: filters.limit, offset: filters.offset });
  }

  async cancelReservation(email: string, reservationCode: string): Promise<InstanceType<typeof Reservation> | null> {
    const reservation = await this.getReservationByEmailAndCode(email, reservationCode);

    if (!reservation) {
      throw new Error('Reserva no encontrada');
    }

    // Calcular los días de anticipación y el porcentaje de reembolso según el país
    const startDate = reservation.get('startDate') as Date;
    const daysBeforeStart = Math.ceil((startDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const propertyId = reservation.get('propertyId') as number;
    const property = await this.propertyService.getPropertyByID(propertyId);
    const { refundDays, refundPercentage } = await this.countryService.getRefundPolicyByCountry(property.get('countryId') as string);

    let refundAmount = 0;
    if (daysBeforeStart > refundDays) {
      reservation.set('status', 'Cancelled by Tenant');
      const paid = reservation.get('amountPaid') as number;
      refundAmount = paid;
    } else {
      // Cancelación parcial
      const paid = reservation.get('amountPaid') as number;
      reservation.set('status', 'Cancelled by Tenant');
      refundAmount = paid * (refundPercentage / 100);
      // Lógica para reembolso parcial
    }
    await this.processRefund(reservation.get('inquilino.email') as string, refundAmount);
    await reservation.save();
    return reservation;
  }
  // Método ficticio para procesar el reembolso a través del sistema de pagos
  private async processRefund(email: string, amount: number): Promise<void> {
    const success = await this.paymentService.processRefund(email, amount);
    if (!success) {
      throw new Error('No se pudo procesar la devolucion del pago correctamente vuelva a intentar');
    }
  }

  private async checkAvailability(propertyId: number, startDate: string, endDate: string): Promise<boolean> {
    const hasOverlappingReservations = await checkDateOverlap(Reservation, propertyId, startDate, endDate);
    if (hasOverlappingReservations) return false;

    const hasAvailableDates = await this.propertyAvailabilityService.checkAvailability(propertyId, startDate, endDate);
    return hasAvailableDates;
  }

  private async validatePropertyCapacity(property: InstanceType<typeof Property>, adults: number, children: number): Promise<boolean> {
    const numberOfAdults = Number(property.get('numberOfAdults')); //Cantidad maxima de Adultos de la propiedad
    const numberOfKids = Number(property.get('numberOfKids')); //Cantidad maxima de Menores de la propiedad

    // Validar cantidad de personas
    const totalCapacity = numberOfAdults + numberOfKids;
    return adults + children <= totalCapacity;
  }
  async paymentCorrect(reservationId: number, email: string, totalPaid: number): Promise<void> {
    const success = await this.paymentService.processPayment(email, totalPaid);
    if (success) {
      await Reservation.update(
        { status: 'Paid', amountPaid: totalPaid }, // Asumiendo que 1.0 representa el pago completo
        { where: { id: reservationId } },
        //await this.propertyAvailabilityService.updateAvailability(reservationId, false); a chequear
      );
    } else {
      throw new Error('No se pudo procesar el pago correctamente vuelva a intentar');
    }
  }
}
