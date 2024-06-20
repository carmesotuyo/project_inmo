import { SensorRequest, SensorUpdateRequest } from '../../dtos/sensorRequest';
import { Sensor } from '../../data-access/sensor';
import { PropertySensor } from '../../data-access/propertySensor';

import { SensorService } from '../../interfaces/services/sensorService';
import { ServiceTypeService } from '../../interfaces/services/sensorServiceType';
import { PropertyService } from '../../interfaces/services/propertyService';

import { fetchAndCache, fetchAndCacheExistence, saveToCache } from '../../cache/withCache';
import CacheModule from '../../cache/cacheModule';

const sensorCacheKeyGenerator = (id: string) => `sensor:${id}`;
const ttl = 60; //cache ttl in seconds

export class SensorServiceImpl implements SensorService {
  constructor(
    private serviceTypeService: ServiceTypeService,
    private propertyService: PropertyService,
    private cache: CacheModule,
  ) {}

  async createSensor(data: SensorRequest): Promise<InstanceType<typeof Sensor>> {
    if (!data) throw Error('Data incorrecta, DTO vacio');

    const { serviceTypeId } = data;
    const serviceType = await this.serviceTypeService.getServiceType(serviceTypeId as number);
    if (!serviceType) throw new Error('Invalid service type');

    const sensor = await Sensor.create({ ...data });
    await saveToCache(this.cache, sensorCacheKeyGenerator, ttl, sensor.toJSON(), sensor.get('id'));
    return sensor;
  }

  async assignToProperty(sensorId: string, propertyId: number): Promise<InstanceType<typeof PropertySensor>> {
    await this.getSensor(sensorId);
    if (!(await this.propertyService.existsProperty(propertyId))) throw new Error('Property not found');
    return await PropertySensor.create({ sensorId, propertyId });
  }

  async getObservableProperties(sensorId: string): Promise<JSON> {
    if (!this.existsSensor(sensorId)) throw new Error('Sensor does not exist: ' + sensorId);
    const sensor: any = await this.getSensor(sensorId);
    const observableProperties = sensor.observableProperties;
    if (!observableProperties) throw new Error('Observable properties not defined');
    return observableProperties;
  }

  async updateSensor(sensorId: string, data: SensorUpdateRequest): Promise<InstanceType<typeof Sensor>> {
    const sensor = await Sensor.findByPk(sensorId);
    if (!sensor) throw new Error(`Sensor not found with ID ${sensorId}`);
    const updatedSensor = await sensor.update(data);
    await this.cache.del(sensorCacheKeyGenerator(sensorId)); //eliminamos la version anterior del cache si es que existia
    return updatedSensor;
  }

  async getSensor(sensorId: string): Promise<InstanceType<typeof Sensor>> {
    return fetchAndCache<InstanceType<typeof Sensor>>(this.cache, sensorCacheKeyGenerator, ttl, sensorId, async (id: string) => {
      const DBSensor = await Sensor.findByPk(id);
      return DBSensor ? DBSensor.toJSON() : null;
    });
  }

  async existsSensor(sensorId: string): Promise<boolean> {
    return fetchAndCacheExistence<InstanceType<typeof Sensor>>(this.cache, sensorCacheKeyGenerator, ttl, sensorId, async (id: string) => {
      const DBSensor = await Sensor.findByPk(id);
      return DBSensor ? DBSensor.toJSON() : null;
    });
  }
}
