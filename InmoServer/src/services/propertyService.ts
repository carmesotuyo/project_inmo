import { PropertyRequest } from '../dtos/propertyRequest';
import { Property } from '../data-access/property';
import { PropertyService } from '../interfaces/services/propertyService';

export class PropertyServiceImpl implements PropertyService {
  async createProperty(data: PropertyRequest): Promise<InstanceType<typeof Property>> {
    if (!data) throw Error("Data incorrecta, DTO vacio");
    const propertyObject = {...data};
    return await Property.create(propertyObject);
  }
}
