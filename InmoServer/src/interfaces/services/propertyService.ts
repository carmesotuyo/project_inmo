import { PropertyRequest } from '../../dtos/propertyRequest';
import { Property } from '../../data-access/property';
import { PropertyFilterOptions } from '../../utils/propertyFilters';
export interface PropertyService {
  createProperty(data: PropertyRequest): Promise<InstanceType<typeof Property>>;
  getPropertyByID(id: number): Promise<InstanceType<typeof Property>>;
  searchProperties(filters: PropertyFilterOptions): Promise<{ properties: InstanceType<typeof Property>[]; total: number }>;
}
