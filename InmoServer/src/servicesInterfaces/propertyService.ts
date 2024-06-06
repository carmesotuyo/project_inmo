// src/servicesInterfaces/propertyService.ts
import { PropertyRequest } from '../dtos/propertyRequest';
import { Property } from '../data-access/property'; //TODO check o ../models/property

export interface PropertyService {
  createProperty(propertyDto: PropertyRequest): Promise<typeof Property>;
}
