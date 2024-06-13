import { ServiceTypeRequest } from '../../dtos/sensorServiceTypeRequest';
import { SensorServiceType } from '../../data-access/sensorServiceType';

export interface ServiceTypeService {
  createServiceType(data: ServiceTypeRequest): Promise<InstanceType<typeof SensorServiceType>>;
  getServiceType(id: number): Promise<InstanceType<typeof SensorServiceType> | null>;
}
