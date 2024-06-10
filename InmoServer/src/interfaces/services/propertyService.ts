import { PropertyRequest } from '../../dtos/propertyRequest';
import { Property } from '../../data-access/property';
import { Reservation } from '../../data-access/reservation';
export interface PropertyService {
  createProperty(data: PropertyRequest): Promise<InstanceType<typeof Property>>;
  getPropertyByID(id: number): Promise<InstanceType<typeof Property>>;
}
