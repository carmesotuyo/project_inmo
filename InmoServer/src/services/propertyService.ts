import { PropertyRequest } from '../dtos/propertyRequest';
import { Property } from '../data-access/property';
import { PropertyService } from '../interfaces/services/propertyService';
import { Model } from 'sequelize';

export class PropertyServiceImpl implements PropertyService {
  async getPropertyByID(id: number): Promise<InstanceType<typeof Property>> {
    const property = await Property.findByPk(id);
    if (!property) throw new Error('Propiedad no encontrada');
    return property;
  }
  async createProperty(data: PropertyRequest): Promise<InstanceType<typeof Property>> {
    if (!data) throw Error('Data incorrecta, DTO vacio');
    const propertyObject = { ...data, status: 'Pendiente de pago' };
    return await Property.create(propertyObject);
  }
}
