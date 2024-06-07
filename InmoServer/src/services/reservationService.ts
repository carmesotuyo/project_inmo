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

  private async checkAvailability(propertyId: number, startDate: string, endDate: string): Promise<boolean> {
    const reservations = await Reservation.findAll({
      where: {
        propertyId: propertyId,
        [Op.or]: [
          {
            startDate: {
              [Op.between]: [startDate, endDate]
            },
          },
          {
            endDate: {
              [Op.between]: [startDate, endDate]
            },
          }
        ]
      }
    });

    return reservations.length === 0;
  }
}
