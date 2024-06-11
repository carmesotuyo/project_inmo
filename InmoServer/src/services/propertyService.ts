import { PropertyRequest } from '../dtos/propertyRequest';
import { Property } from '../data-access/property';
import { PropertyService } from '../interfaces/services/propertyService';
import { Model } from 'sequelize';
import { Reservation } from '../data-access/reservation';
import { PropertyFilterOptions } from '../utils/propertyFilters';
import { PropertyFilter } from '../utils/propertyFilters';
export class PropertyServiceImpl implements PropertyService {
  async getPropertyByID(id: number): Promise<InstanceType<typeof Property>> {
    const property = await Property.findByPk(id);
    if (!property) throw new Error('Propiedad no encontrada');
    return property;
  }
  async searchProperties(filters: PropertyFilterOptions): Promise<{ properties: InstanceType<typeof Property>[]; total: number }> {
    const propertyFilter = new PropertyFilter(filters);
    const whereClause = await propertyFilter.buildWhereClause();

    const { limit = 10, offset = 0 } = filters;

    const { count, rows } = await Property.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      include: [{ model: Reservation, as: 'reservations' }],
    });

    const properties = rows.map((property) => {
      const propertyData = property.toJSON();
      propertyData.imageLinks = propertyData.images.map((image: any) => image.thumbnailLink);
      delete propertyData.images;
      return propertyData;
    });

    return {
      properties,
      total: count,
    };
  }
  async createProperty(data: PropertyRequest): Promise<InstanceType<typeof Property>> {
    if (!data) throw Error('Data incorrecta, DTO vacio');
    const propertyObject = { ...data, status: 'Pendiente de pago' };
    return await Property.create(propertyObject);
  }
}
