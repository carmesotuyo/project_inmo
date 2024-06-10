import { SensorRequest } from '../../dtos/sensorRequest';
import { Sensor } from '../../data-access/sensor';

export interface SensorService {
  createSensor(data: SensorRequest): Promise<InstanceType<typeof Sensor>>;
  assignToProperty(sensorId: string, propertyId: number): Promise<void>;
}
