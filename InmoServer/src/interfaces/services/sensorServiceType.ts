import { ServiceTypeRequest } from '../../dtos/sensorServiceTypeRequest';
// import { ServiceType } from '../data-access/sens';
import { SensorServiceType } from '../../data-access/sensorServiceType';

export interface ServiceTypeService {
  createServiceType(data: ServiceTypeRequest): Promise<InstanceType<typeof SensorServiceType>>;
}
