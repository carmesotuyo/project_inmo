import { PropertyAvailabilityRequest } from '../dtos/propertyAvailabilityRequest';
import { PropertyAvailability } from '../data-access/propertyAvailability';
import { PropertyAvailabilityService } from '../interfaces/services/propertyAvailabilityService';

export class PropertyAvailabilityServiceImpl implements PropertyAvailabilityService {
  async createAvailability(data: PropertyAvailabilityRequest): Promise<InstanceType<typeof PropertyAvailability>> {
    if (!data) throw Error('Data incorrecta, DTO vacio');
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
}
