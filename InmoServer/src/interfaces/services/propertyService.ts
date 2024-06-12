import { PropertyRequest } from '../../dtos/propertyRequest';
import { Property } from '../../data-access/property';

export interface PropertyService {
  createProperty(data: PropertyRequest): Promise<InstanceType<typeof Property>>;
  existsProperty(id: number): Promise<boolean>;
}
