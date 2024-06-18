import { ServiceTypeService } from '../../../interfaces/services/sensorServiceType';
import { SensorService } from '../../../interfaces/services/sensorService';
import { NotificationService } from '../../../interfaces/services/notificationService';
import { NotificationRequest, NotificationPriority, NotificationType } from '../../../dtos/notificationRequest';
import { PropertyService } from '../../../interfaces/services/propertyService';
import { SensorData, DataToReport } from '../types/sensorData';
import { QueueService } from '../../../interfaces/services/queueService';
import { Signal } from '../../../config/mongoConnections';

export class Filters {
  constructor(
    private sensorService: SensorService,
    private serviceType: ServiceTypeService,
    private notificationService: NotificationService,
    private propertyService: PropertyService,
    private queueService: QueueService,
  ) {}

  public verifyPropertyAndSensorExist = async (input: SensorData): Promise<SensorData> => {
    try {
      const [propertyId, sensorId] = await this.getPropertyAndSensorIds(input);
      const existsProperty = await this.propertyService.existsProperty(propertyId);
      if (!existsProperty) throw new Error('Property does not exist. Verify sensor state.');
      if (sensorId != 'APP') {
        const existsSensor = await this.sensorService.existsSensor(sensorId);
        if (!existsSensor) throw new Error('Sensor is not found in Catalog. Verify sensor state.');
      }
      return input;
    } catch (error: any) {
      throw new Error('Error verifying property and sensor: ' + error.message);
    }
  };

  public saveSignalToDB = async (input: SensorData): Promise<SensorData> => {
    try {
      const signal = new Signal(input);
      return await signal.save();
    } catch (error: any) {
      throw new Error(`Error saving signal: ${error.message}`);
    }
  };

  public validateValuesRange = async (input: SensorData): Promise<SensorData> => {
    try {
      const { propertyKey, propertyValue } = await this.extractKeyValue(input);
      const signalProperty = (await this.getSensorObservableProperties(input)) as any;
      if (signalProperty != null && 'max' in signalProperty && 'min' in signalProperty && ((propertyValue as number) > signalProperty['max'] || (propertyValue as number) < signalProperty['min'])) {
        throw new Error('Values received outside ranges. Check connection or sensor state.');
      }
      return input;
    } catch (error: any) {
      throw new Error('Error validating Values Range for input: ' + error.message);
    }
  };

  public validateAlertRange = async (input: SensorData): Promise<SensorData> => {
    try {
      const { propertyKey, propertyValue } = await this.extractKeyValue(input);
      const signalProperty = (await this.getSensorObservableProperties(input)) as any;
      if (signalProperty != null) {
        const regexPattern = signalProperty.get('Alerta');
        if (regexPattern) {
          const regex = new RegExp(regexPattern);
          if (regex.test(propertyValue)) input.needsAlert = true;
        }
      } else input.needsAlert = true; //significa que es de la APP
      return input;
    } catch (error: any) {
      throw new Error('Error validating Alert Range for input: ' + error.message);
    }
  };

  public notify = async (input: SensorData): Promise<SensorData> => {
    let notificationResult;
    try {
      if (input.needsAlert) {
        const [type, priority] = await this.checkTypeAndPriority(input);
        const { propertyKey, propertyValue } = await this.extractKeyValue(input);
        const [propertyId, sensorId] = await this.getPropertyAndSensorIds(input);
        const notifRequest: NotificationRequest = { type: type, propertyId: propertyId, priority: priority, message: propertyKey + propertyValue }; //check format of notification
        notificationResult = await this.notificationService.notify(notifRequest);

        const dataToReport: DataToReport = { propertyId: propertyId, incident: propertyValue, date: new Date(input.dateTime) };
        this.queueService.addJobToQueue('incident', dataToReport as unknown as JSON);
      }
      return input;
    } catch (error: any) {
      throw new Error('Error on notification filter for input: ' + error.message);
    }
  };

  private extractKeyValue = async (input: SensorData): Promise<any> => {
    const keys = Object.keys(input);
    const propertyKey = keys[2];
    const propertyValue = input[propertyKey]; //this is the measurment
    return { propertyKey, propertyValue };
  };

  private getSensorObservableProperties = async (input: SensorData): Promise<JSON | null> => {
    const { propertyKey, propertyValue } = await this.extractKeyValue(input);
    const [propertyId, sensorCatalogId] = await this.getPropertyAndSensorIds(input);

    if (sensorCatalogId != 'APP') {
      const sensorProperties: { [key: string]: any } = await this.sensorService.getObservableProperties(sensorCatalogId);
      return sensorProperties[propertyKey];
    } else return null;
  };

  private getPropertyAndSensorIds = async (input: SensorData): Promise<[number, string]> => {
    // el input.sensorId en realidad es propertyId + sensorId, osea es un propertySensor
    if (input.sensorId.includes('APP')) {
      // en el caso de la app es APP.propertyId
      const [sensorId, propertyId] = input.sensorId.split('.'); //tomamos APP como sensorId
      const parsedProperty = Number.parseInt(propertyId.trim());
      if (!parsedProperty) throw new Error('Property ID is not a valid number: ' + propertyId);
      return [parsedProperty, sensorId.trim()]; //los retornamos en orden
    } else {
      const [propertyId, sensorId] = input.sensorId.split('.');
      const parsedProperty = Number.parseInt(propertyId.trim());
      if (!parsedProperty) throw new Error('Property ID is not a valid number: ' + propertyId);
      return [parsedProperty, sensorId.trim()];
    }
  };

  // from servicetype associated to the sensor
  private checkTypeAndPriority = async (input: SensorData): Promise<[string, NotificationPriority]> => {
    const [propertyId, sensorCatalogId] = await this.getPropertyAndSensorIds(input);

    let type: string;
    let priority: NotificationPriority;
    if (sensorCatalogId != 'APP') {
      const sensorObj = await this.sensorService.getSensor(sensorCatalogId);
      const serviceType = await this.serviceType.getServiceType(sensorObj.get('serviceTypeId') as number);
      priority = serviceType?.get('priority') as NotificationPriority;
      type = serviceType?.get('type') as string;
    } else {
      const { propertyKey, propertyValue } = await this.extractKeyValue(input);
      type = propertyKey;
      priority = 'High' as NotificationPriority; //asumimos prioridad alta para los incidentes reportados desde la app
    }
    return [type, priority];
  };
}
