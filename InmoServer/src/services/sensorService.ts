import { SensorRequest, SensorUpdateRequest } from '../dtos/sensorRequest';
import { Sensor } from '../data-access/sensor';
import { PropertySensor } from '../data-access/propertySensor';

import { SensorService } from '../interfaces/services/sensorService';
import { ServiceTypeService } from '../interfaces/services/sensorServiceType';
import { PropertyService } from '../interfaces/services/propertyService';

export class SensorServiceImpl implements SensorService {
  constructor(
    private serviceTypeService: ServiceTypeService,
    private propertyService: PropertyService,
  ) {}

  async createSensor(data: SensorRequest): Promise<InstanceType<typeof Sensor>> {
    if (!data) throw Error('Data incorrecta, DTO vacio');

    const { serviceTypeId } = data;
    const serviceType = await this.serviceTypeService.getServiceType(serviceTypeId as number);
    if (!serviceType) throw new Error('Invalid service type');

    return await Sensor.create({ ...data });
  }

  async assignToProperty(sensorId: string, propertyId: number): Promise<InstanceType<typeof PropertySensor>> {
    await this.getSensor(sensorId);
    if (!(await this.propertyService.existsProperty(propertyId))) throw new Error('Property not found');
    return await PropertySensor.create({ sensorId, propertyId });
  }

  async getObservableProperties(sensorId: string): Promise<JSON> {
    const sensor = await this.getSensor(sensorId);
    const observableProperties = sensor.get('observableProperties') as JSON;
    if (!observableProperties) throw new Error('Observable properties not defined');
    return observableProperties;
  }
  async updateSensor(sensorId: string, data: SensorUpdateRequest): Promise<InstanceType<typeof Sensor>> {
    const sensor = await this.getSensor(sensorId);
    return await sensor.update(data);
  }

  async getSensor(sensorId: string): Promise<InstanceType<typeof Sensor>> {
    const sensor = await Sensor.findByPk(sensorId);
    if (!sensor) throw new Error('Sensor not found');
    return sensor;
  }
}
