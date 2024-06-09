import { ReservationRequest } from '../dtos/reservationRequest';
import { Reservation } from '../data-access/reservation';
import { Property } from '../data-access/property';
import { ReservationService } from '../interfaces/services/reservationService';
import { PropertyAvailabilityService } from '../interfaces/services/propertyAvailabilityService';
import { checkDateOverlap } from '../utils/dateUtils';

export class ReservationServiceImpl implements ReservationService {
  constructor(private propertyAvailabilityService: PropertyAvailabilityService) {}

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

    // Crear reserva pendiente de aprobación
    const reservationObject = {
      propertyId,
      startDate,
      endDate,
      status: 'Pending Approval',
      adults,
      children,
      inquilino,
    };
    //Faltaria agregar que llegue notifiacion al admin para que apruebe la reserva
    const reservation = await Reservation.create(reservationObject);
    await this.adjustPropertyAvailability(propertyId, startDate, endDate);
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

  private async checkAvailability(propertyId: number, startDate: string, endDate: string): Promise<boolean> {
    const hasOverlappingReservations = await checkDateOverlap(Reservation, propertyId, startDate, endDate);
    if (hasOverlappingReservations) return false;

    const hasAvailableDates = await this.propertyAvailabilityService.checkAvailability(propertyId, startDate, endDate);
    return hasAvailableDates;
  }

  private async adjustPropertyAvailability(propertyId: number, startDate: string, endDate: string): Promise<void> {
    this.propertyAvailabilityService.adjustPropertyAvailabilityFromReservationDates(propertyId, startDate, endDate);
  }

  private async validatePropertyCapacity(property: InstanceType<typeof Property>, adults: number, children: number): Promise<boolean> {
    const numberOfAdults = Number(property.get('numberOfAdults')); //Cantidad maxima de Adultos de la propiedad
    const numberOfKids = Number(property.get('numberOfKids')); //Cantidad maxima de Menores de la propiedad

    // Validar cantidad de personas
    const totalCapacity = numberOfAdults + numberOfKids;
    return adults + children <= totalCapacity;
  }
}
