import { SensorRequest, SensorUpdateRequest } from '../../dtos/sensorRequest';
import { Sensor } from '../../data-access/sensor';
import { PropertySensor } from '../../data-access/propertySensor';

export interface SensorService {
  createSensor(data: SensorRequest): Promise<InstanceType<typeof Sensor>>;
  assignToProperty(sensorId: string, propertyId: number): Promise<InstanceType<typeof PropertySensor>>;
  getSensor(sensorId: string): Promise<InstanceType<typeof Sensor>>;
  getObservableProperties(sensorId: string): Promise<JSON>;
  updateSensor(sensorId: string, data: SensorUpdateRequest): Promise<InstanceType<typeof Sensor>>;
  existsSensor(sensorId: string): Promise<boolean>;
}
