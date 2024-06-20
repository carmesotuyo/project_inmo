import { ReservationRequest, Inquilino } from '../../dtos/reservationRequest';
import { Reservation } from '../../data-access/reservation';
import { Property } from '../../data-access/property';
import { ReservationService } from '../../interfaces/services/reservationService';
import { PropertyAvailabilityService } from '../../interfaces/services/propertyAvailabilityService';
import { checkDateOverlap } from '../../utils/dateUtils';
import { CountryService } from '../../interfaces/services/countryService';
import { PropertyService } from '../../interfaces/services/propertyService';
import { ReservationFilterOptions } from '../../utils/reservationFilters';
import { ReservationFilter } from '../../utils/reservationFilters';
import { PaymentService } from '../../interfaces/services/paymentService';
import { User } from '../../data-access/user';
import { NotificationService } from '../../interfaces/services/notificationService';
import { NotificationRequest, NotificationPriority, NotificationType } from '../../dtos/notificationRequest';

export class ReservationServiceImpl implements ReservationService {
  constructor(
    private propertyAvailabilityService: PropertyAvailabilityService,
    private countryService: CountryService,
    private propertyService: PropertyService,
    private paymentService: PaymentService,
    private notificationService: NotificationService,
  ) {}
  async createReservation(data: ReservationRequest, email: string): Promise<InstanceType<typeof Reservation>> {
    if (!data) throw Error('Data incorrecta, DTO vacio');
    const { propertyId, adults, children, startDate, endDate, address, nationality, country } = data;
    const user: any = await User.findByPk(email);
    if (!user) throw new Error('Usuario no encontrado');
    const inquilino: Inquilino = {
      document: user.document as string,
      first_name: user.get('first_name') as string,
      last_name: user.get('last_name') as string,
      email: user.get('email') as string,
      phone_number: user.get('phone_number') as string,
      address,
      nationality,
      country,
    };

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
    const reservation = await Reservation.create(reservationObject);
    this.propertyAvailabilityService.adjustPropertyAvailabilityFromReservationDates(propertyId, startDate, endDate);
    
    let notificationResult;
    const propertyKey = 'Booking';
    const propertyValue = `Se ha creado una nueva reserva en el innmueble ${propertyId} con el código ${reservation.get('id')}`;

    const notifRequest: NotificationRequest = { type: NotificationType.Booking, propertyId: propertyId, priority: NotificationPriority.Medium, message: propertyKey + '#' + propertyValue };
    notificationResult = await this.notificationService.notify(notifRequest);
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
  async getReservationsAdmin(filters: ReservationFilterOptions): Promise<any[]> {
    const reservationFilter = new ReservationFilter(filters);
    const whereClause = await reservationFilter.buildWhereClause();
    const reservations = await Reservation.findAll({ where: whereClause });
    return await this.filterReservationsByInquilino(reservations, filters);
  }

  async filterReservationsByInquilino(reservations: any[], filters: ReservationFilterOptions): Promise<any[]> {
    return reservations.filter((reservation) => {
      const inquilino = reservation.inquilino;

      if (filters.tenantEmail && !inquilino.email.includes(filters.tenantEmail)) {
        return false;
      }

      if (filters.tenantName && !(inquilino.first_name.includes(filters.tenantName) || inquilino.last_name.includes(filters.tenantName))) {
        return false;
      }

      return true;
    });
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
    const availability: any = {
      propertyId,
      startDate: reservation.get('startDate') as string,
      endDate: reservation.get('endDate') as string,
    };

    let refundAmount = 0;
    if (daysBeforeStart > refundDays) {
      reservation.set('status', 'Cancelled by Tenant');
      const paid = reservation.get('amountPaid') as number;
      refundAmount = paid;
    } else {
      const paid = reservation.get('amountPaid') as number;
      reservation.set('status', 'Cancelled by Tenant');
      refundAmount = paid * (refundPercentage / 100);
    }
    await this.processRefund(reservation.get('inquilino.email') as string, refundAmount);
    await reservation.save();
    await this.propertyAvailabilityService.createAvailability(availability);

    return reservation;
  }

  // Emulador para procesar el reembolso a través del sistema de pagos
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

  async processPayment(reservationId: number): Promise<void> {
    const reservation: any = await Reservation.findByPk(reservationId);
    if (!reservation) {
      throw new Error('Reserva no encontrada');
    }
    const status = reservation.get('status') as string;
    if (status === 'Pending Approval') {
      throw new Error('El pago no se ha realizado, la reserva está pendiente de aprobación por un administrador.');
    }
    const propertyId = reservation.get('propertyId') as number;
    const amountPaid = reservation.get('amountPaid') as number;
    const email = reservation.get('inquilino.email') as string;
    const success = await this.paymentService.processPayment(email, amountPaid);
    if (success) {
      await Reservation.update({ status: 'Paid' }, { where: { id: reservationId } });
      let notificationResult;
      const propertyKey = 'Payment';
      const propertyValue = `Se ha procesado el pago de la reserva ${reservationId} del inmueble ${propertyId} por un monto de ${amountPaid}`;

      const notifRequest: NotificationRequest = { type: NotificationType.Payment, propertyId: propertyId, priority: NotificationPriority.Medium, message: propertyKey + '#' + propertyValue };
      await this.notificationService.notify(notifRequest);
    } else {
      throw new Error('No se pudo procesar el pago correctamente vuelva a intentar');
    }
  }

  async aproveReservation(reservationId: number, aprove: string): Promise<InstanceType<typeof String>> {
    const reservation = await Reservation.findByPk(reservationId);
    if (!reservation) {
      throw new Error('Reserva no encontrada');
    }
    const status = reservation.get('status') as string;
    const aproveBool = JSON.parse(aprove.toLowerCase());
    if (status === 'Pending Approval') {
      if (aproveBool) {
        reservation.set('status', 'Approved');
      } else {
        reservation.set('status', 'Rejected');
      }
      await reservation.save();
      return aproveBool ? 'La reserva ha sido aprobada correctamente' : 'La reserva ha sido rechazada correctamente';
    } else {
      throw new Error('La reserva no está pendiente de aprobación');
    }
  }
}
