import { PropertyRequest } from '../../dtos/propertyRequest';
import { PropertyResponse } from '../../dtos/propertyResponse';
import { Property } from '../../data-access/property';
import { PropertyFilterOptions } from '../../utils/propertyFilters';

export interface PropertyService {
  createProperty(data: PropertyRequest): Promise<InstanceType<typeof Property>>;
  getPropertyByID(id: number): Promise<InstanceType<typeof Property>>;
  searchProperties(filters: PropertyFilterOptions): Promise<{ properties: PropertyResponse[]; total: number }>;
  existsProperty(id: number): Promise<boolean>;
  getAllProperties(): Promise<InstanceType<typeof Property>[]>;
  processPayment(propertyId: number, email: string): Promise<void>;
}
