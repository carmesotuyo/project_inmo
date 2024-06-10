import { ServiceTypeRequest } from '../dtos/sensorServiceTypeRequest';
import { ServiceTypeService } from '../interfaces/services/sensorServiceType';
import { SensorServiceType } from '../data-access/sensorServiceType';

export class ServiceTypeServiceImpl implements ServiceTypeService {
  async createServiceType(data: ServiceTypeRequest): Promise<InstanceType<typeof SensorServiceType>> {
    if (!data) throw Error('Data incorrecta, DTO vacio');
    return await SensorServiceType.create({ data });
  }
}