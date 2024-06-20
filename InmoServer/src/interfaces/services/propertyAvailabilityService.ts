import { PropertyAvailabilityRequest } from '../../dtos/propertyAvailabilityRequest';
import { PropertyAvailability } from '../../data-access/propertyAvailability';

export interface PropertyAvailabilityService {
  createAvailability(data: PropertyAvailabilityRequest): Promise<InstanceType<typeof PropertyAvailability>>;
  updateAvailability(id: number, data: PropertyAvailabilityRequest): Promise<InstanceType<typeof PropertyAvailability> | null>;
  getAllAvailabilities(propertyId: number): Promise<InstanceType<typeof PropertyAvailability>[]>;
  checkAvailability(propertyId: number, startDate: string, endDate: string): Promise<boolean>;
  adjustPropertyAvailabilityFromReservationDates(propertyId: number, startDate: string, endDate: string): Promise<void>;
  updateAvailabilityCancel(propertyId: number, startDate: string, endDate: string, reservationId: number): Promise<void>;
}
