import { PropertyAvailabilityRequest } from '../dtos/propertyAvailabilityRequest';
import { PropertyAvailability } from '../data-access/propertyAvailability';
import { PropertyAvailabilityService } from '../interfaces/services/propertyAvailabilityService';
import { Op } from 'sequelize';

export class PropertyAvailabilityServiceImpl implements PropertyAvailabilityService {
  async createAvailability(data: PropertyAvailabilityRequest): Promise<InstanceType<typeof PropertyAvailability>> {
    if (!data) throw Error('Data incorrecta, DTO vacio');
    const { propertyId, startDate, endDate } = data;
    // Check if there's an existing availability that includes the dates of the requested one
    const existingAvailability = await PropertyAvailability.findOne({
      where: {
        propertyId: propertyId,
        startDate: {
          [Op.lte]: startDate,
        },
        endDate: {
          [Op.gte]: endDate,
        },
      },
    });

    if (existingAvailability) {
      // If there's an existing availability that fully includes the requested one, ignore the request
      return existingAvailability;
    }

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
        } else if (new Date(endDate) > availabilityEndDate && new Date(startDate) <= availabilityEndDate) {
          // Requested dates overlap with the end of an existing availability, adjust the end date of the existing availability
          await availability.update({ endDate: startDate });
        }
      }
    }

    // If no existing availability fully includes the requested one and there are no overlapping availabilities, create a new availability
    const availabilityObject = { ...data };
    return await PropertyAvailability.create(availabilityObject);
  }

  async updateAvailability(id: number, data: PropertyAvailabilityRequest): Promise<InstanceType<typeof PropertyAvailability>> {
    if (!data) throw Error('Data incorrecta, DTO vacio');
    const availability = await PropertyAvailability.findByPk(id);
    if (!availability) throw new Error('Availability not found');
    return await availability.update(data);
  }

  async getAllAvailabilities(propertyId: number): Promise<InstanceType<typeof PropertyAvailability>[]> {
    const availabilities = await PropertyAvailability.findAll({ where: { propertyId } });
    return availabilities;
  }

  async findAvailabilities(propertyId: number, startDate: string, endDate: string): Promise<InstanceType<typeof PropertyAvailability>[]> {
    return await PropertyAvailability.findAll({
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
