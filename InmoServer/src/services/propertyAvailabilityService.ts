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

    // If no existing availability fully includes the requested one and there are no overlapping availabilities, create a new availability
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
    if (overlappingAvailability) {
      await availability.destroy();
      return overlappingAvailability;
    }

    return await availability.update({ ...data });
  }

  async getAllAvailabilities(propertyId: number): Promise<InstanceType<typeof PropertyAvailability>[]> {
    return await PropertyAvailability.findAll({ where: { propertyId } });
  }

  private async handleOverlappingAvailabilities(propertyId: number, startDate: string, endDate: string): Promise<InstanceType<typeof PropertyAvailability> | null> {
    const overlappingAvailabilities = await this.findAvailabilities(propertyId, startDate, endDate);

    if (overlappingAvailabilities.length > 0) {
      for (const availability of overlappingAvailabilities) {
        const availabilityStartDate = availability.get('startDate') as Date;
        const availabilityEndDate = availability.get('endDate') as Date;

        if (new Date(startDate) >= availabilityStartDate && new Date(endDate) <= availabilityEndDate) {
          // Requested dates are fully included in an existing availability, no need to create new availability
          return availability;
        } else if (new Date(startDate) < availabilityStartDate && new Date(endDate) > availabilityEndDate) {
          // Requested dates fully overlap with an existing availability, adjust the existing availability
          await availability.update({
            startDate: startDate,
            endDate: endDate,
          });
          return availability;
        } else if (new Date(startDate) < availabilityStartDate && new Date(endDate) >= availabilityStartDate) {
          // Requested dates overlap with the start of an existing availability, adjust the start date of the existing availability
          await availability.update({ startDate: endDate });
          return availability;
        } else if (new Date(endDate) > availabilityEndDate && new Date(startDate) <= availabilityEndDate) {
          // Requested dates overlap with the end of an existing availability, adjust the end date of the existing availability
          await availability.update({ endDate: startDate });
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
              [Op.lte]: new Date(endDate), // Check if the start date is before or on the requested end date
            },
          },
          {
            endDate: {
              [Op.gte]: new Date(startDate), // Check if the end date is after or on the requested start date
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

    for (const availability of availabilities) {
      const availabilityStartDate = availability.get('startDate') as Date;
      const availabilityEndDate = availability.get('endDate') as Date;

      if (new Date(startDate) > availabilityStartDate && new Date(endDate) < availabilityEndDate) {
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
      } else if (new Date(startDate) <= availabilityStartDate && new Date(endDate) >= availabilityEndDate) {
        // La disponibilidad se ocupa toda, se elimina
        await availability.destroy();
      } else if (new Date(startDate) > availabilityStartDate && new Date(startDate) < availabilityEndDate) {
        // Se ajusta la fecha final de la disponibilidad
        await availability.update({ endDate: startDate });
      } else if (new Date(endDate) > availabilityStartDate && new Date(endDate) < availabilityEndDate) {
        // Se ajusta la fecha inicial de la disponibilidad
        await availability.update({ startDate: endDate });
      }
    }
  }
}
