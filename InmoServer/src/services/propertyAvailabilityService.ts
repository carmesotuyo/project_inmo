import { PropertyAvailabilityRequest } from '../dtos/propertyAvailabilityRequest';
import { PropertyAvailability } from '../data-access/propertyAvailability';
import { PropertyAvailabilityService } from '../interfaces/services/propertyAvailabilityService';
import { Op } from 'sequelize';
import { checkDateOverlap } from '../utils/dateUtils';
import { Reservation } from '../data-access/reservation';

export class PropertyAvailabilityServiceImpl implements PropertyAvailabilityService {
  async createAvailability(data: PropertyAvailabilityRequest): Promise<InstanceType<typeof PropertyAvailability>> {
    if (!data) throw Error('Data incorrecta, DTO vacio');
    const { propertyId, startDate, endDate } = data;

    const hasOverlappingReservations = await checkDateOverlap(Reservation, propertyId, startDate, endDate);
    if (hasOverlappingReservations) throw new Error('Cannot create availability because there are existing reservations in the requested dates');

    const existingAvailability = await this.handleOverlappingAvailabilities(propertyId, startDate, endDate);
    if (existingAvailability) return existingAvailability;

    return await PropertyAvailability.create({ ...data });
  }

  async updateAvailability(id: number, data: PropertyAvailabilityRequest): Promise<InstanceType<typeof PropertyAvailability>> {
    if (!data) throw Error('Data incorrecta, DTO vacio');
    const availability = await PropertyAvailability.findByPk(id);
    if (!availability) throw new Error('Availability not found');

    const { propertyId, startDate, endDate } = data;

    const hasOverlappingReservations = await checkDateOverlap(Reservation, propertyId, startDate, endDate);
    if (hasOverlappingReservations) throw new Error('Cannot update availability because there are existing reservations in the requested dates');

    const overlappingAvailability = await this.handleOverlappingAvailabilities(propertyId, startDate, endDate);
    if (overlappingAvailability) return overlappingAvailability;

    return await availability.update({ ...data });
  }

  async getAllAvailabilities(propertyId: number): Promise<InstanceType<typeof PropertyAvailability>[]> {
    return await PropertyAvailability.findAll({
      where: { propertyId },
      order: [['startDate', 'ASC']],
    });
  }

  private async handleOverlappingAvailabilities(propertyId: number, startDate: string, endDate: string): Promise<InstanceType<typeof PropertyAvailability> | null> {
    const overlappingAvailabilities = await this.findAvailabilities(propertyId, startDate, endDate);

    const requestedStartDate = new Date(startDate);
    const requestedEndDate = new Date(endDate);

    if (overlappingAvailabilities.length > 0) {
      for (const availability of overlappingAvailabilities) {
        const availabilityStartDate = new Date(availability.get('startDate') as string);
        const availabilityEndDate = new Date(availability.get('endDate') as string);

        if (requestedStartDate >= availabilityStartDate && requestedEndDate <= availabilityEndDate) {
          // las fechas ya estan disponibles, no hay que hacer nada
          return availability;
        } else if (requestedStartDate < availabilityStartDate && requestedEndDate > availabilityEndDate) {
          // se agranda una disponibilidad existente porque la nueva la abarca completamente
          await availability.update({
            startDate: startDate,
            endDate: endDate,
          });
          return availability;
        } else if (requestedStartDate <= availabilityStartDate && requestedEndDate >= availabilityStartDate) {
          // se agranda la disponibilidad al principio de una disponibilidad existente
          await availability.update({ startDate: startDate });
          return availability;
        } else if (requestedEndDate >= availabilityEndDate && requestedStartDate <= availabilityEndDate) {
          // se agranda la disponibilidad al final de una disponibilidad existente
          await availability.update({ endDate: endDate });
          return availability;
        }
      }
    }
    return null;
  }

  private async findAvailabilities(propertyId: number, startDate: string, endDate: string): Promise<InstanceType<typeof PropertyAvailability>[]> {
    return await PropertyAvailability.findAll({
      where: {
        propertyId: propertyId,
        [Op.and]: [
          {
            startDate: {
              [Op.lte]: new Date(endDate),
            },
          },
          {
            endDate: {
              [Op.gte]: new Date(startDate),
            },
          },
        ],
      },
    });
  }

  async checkAvailability(propertyId: number, startDate: string, endDate: string): Promise<boolean> {
    const overlappingAvailabilities = await PropertyAvailability.findAll({
      where: {
        propertyId: propertyId,
        startDate: {
          [Op.lte]: endDate,
        },
        endDate: {
          [Op.gte]: startDate,
        },
      },
    });

    return overlappingAvailabilities.length > 0;
  }

  async adjustPropertyAvailabilityFromReservationDates(propertyId: number, startDate: string, endDate: string): Promise<void> {
    const availabilities = await this.findAvailabilities(propertyId, startDate, endDate);
    const requestedStartDate = new Date(startDate);
    const requestedEndDate = new Date(endDate);

    for (const availability of availabilities) {
      const availabilityStartDate = new Date(availability.get('startDate') as string);
      const availabilityEndDate = new Date(availability.get('endDate') as string);

      if (requestedStartDate > availabilityStartDate && requestedEndDate < availabilityEndDate) {
        // La disponilidad se parte en dos nuevas
        await PropertyAvailability.create({
          propertyId,
          startDate: availability.get('startDate'),
          endDate: startDate,
        });
        await PropertyAvailability.create({
          propertyId,
          startDate: endDate,
          endDate: availability.get('endDate'),
        });
        await availability.destroy();
      } else if (requestedStartDate <= availabilityStartDate && requestedEndDate >= availabilityEndDate) {
        // La disponibilidad se ocupa toda, se elimina
        await availability.destroy();
      } else if (requestedStartDate > availabilityStartDate && requestedStartDate < availabilityEndDate) {
        // Se ajusta la fecha final de la disponibilidad
        await availability.update({ endDate: startDate });
      } else if (requestedEndDate > availabilityStartDate && requestedEndDate < availabilityEndDate) {
        // Se ajusta la fecha inicial de la disponibilidad
        await availability.update({ startDate: endDate });
      }
    }
  }
}
