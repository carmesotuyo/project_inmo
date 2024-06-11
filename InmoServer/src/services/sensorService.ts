import { SensorRequest } from '../dtos/sensorRequest';
import { Sensor } from '../data-access/sensor';
import { SensorService } from '../interfaces/services/sensorService';
import { ServiceTypeService } from '../interfaces/services/sensorServiceType';

export class SensorServiceImpl implements SensorService {
  constructor(private serviceTypeService: ServiceTypeService) {}

  async createSensor(data: SensorRequest): Promise<InstanceType<typeof Sensor>> {
    if (!data) throw Error('Data incorrecta, DTO vacio');

    const { serviceTypeId } = data;
    const serviceType = await this.serviceTypeService.getServiceType(serviceTypeId as number);
    if (!serviceType) throw new Error('Invalid service type');

    return await Sensor.create({ ...data });
  }

  async assignToProperty(sensorId: string, propertyId: number): Promise<void> {
    const sensor = await Sensor.findByPk(sensorId);
    if (!sensor) throw new Error('Sensor not found');
    if (sensor.get('propertyId') != null) throw new Error('Sensor already assigned to another property');

    sensor.set('propertyId', propertyId);
    await sensor.save();
  }
}
