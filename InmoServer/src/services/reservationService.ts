import { ReservationRequest } from '../dtos/reservationRequest';
import { Reservation } from '../data-access/reservation';
import { Property } from '../data-access/property';
import { ReservationService } from '../interfaces/services/reservationService';

// Importamos el DTO
import { Op } from 'sequelize';

export class ReservationServiceImpl implements ReservationService {
  async createReservation(data: ReservationRequest): Promise<InstanceType<typeof Reservation>> {
    if (!data) throw Error('Data incorrecta, DTO vacio');
    const { propertyId, adults, children, startDate, endDate, inquilino } = data;

    // Obtener la propiedad de la base de datos
    const property = await Property.findByPk(propertyId);
    if (!property) {
      throw new Error('Propiedad no encontrada');
    }
    const numberOfAdults = Number(property.get('numberOfAdults')); //Cantidad maxima de Adultos de la propiedad
    const numberOfKids = Number(property.get('numberOfKids')); //Cantidad maxima de Menores de la propiedad

    // Validar cantidad de personas
    const totalCapacity = numberOfAdults + numberOfKids;
    if (adults + children > totalCapacity) {
      throw new Error('La cantidad de personas excede la capacidad del inmueble');
    }

    // Validar disponibilidad del inmueble
    const isAvailable = await this.checkAvailability(propertyId, startDate, endDate);
    if (!isAvailable) {
      throw new Error('El inmueble no está disponible para el período solicitado');
    }

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
    return await Reservation.create(reservationObject);
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

  async cancelReservation(email: string, reservationCode: string): Promise<InstanceType<typeof Reservation> | null> {
    const reservation = await this.getReservationByEmailAndCode(email, reservationCode);

    if (!reservation) {
      throw new Error('Reserva no encontrada');
    }

    // Calcular los días de anticipación y el porcentaje de reembolso según el país
    // const startDate = reservation.get('startDate') as Date;
    // const daysBeforeStart = Math.ceil((startDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    // const { refundDays, refundPercentage } = await this.getRefundPolicyByCountry(country);
    reservation.set('status', 4);
    // if (daysBeforeStart > refundDays) {
    //   // Cancelación completa
    //   reservation.set('status', 'Cancelled by Tenant');
    //   // Lógica para reembolso completo
    // } else {
    //   // Cancelación parcial
    //   reservation.set('status', 'Cancelled by Tenant');
    //   // Lógica para reembolso parcial
    // }

    await reservation.save();
    return reservation;
  }
  //   private async getRefundPolicyByCountry(country: string): Promise<{ refundDays: number, refundPercentage: number }> {
  //   // Obtener la política de reembolso según el país desde la base de datos o una configuración
  //   // Ejemplo:
  //   return { refundDays: 30, refundPercentage: 50 }; // Valores predeterminados
  // }

  private async checkAvailability(propertyId: number, startDate: string, endDate: string): Promise<boolean> {
    const reservations = await Reservation.findAll({
      where: {
        propertyId: propertyId,
        [Op.or]: [
          {
            startDate: {
              [Op.between]: [startDate, endDate],
            },
          },
          {
            endDate: {
              [Op.between]: [startDate, endDate],
            },
          },
        ],
      },
    });

    return reservations.length === 0;
  }
}
