import { Request, Response } from 'express';
import { SensorService } from '../interfaces/services/sensorService';
import { QueueService } from '../interfaces/services/queueService';
import { getErrorMessage } from '../utils/handleError';
import logger from '../config/logger';
import { log } from 'console';

export class SensorController {
  constructor(
    private sensorService: SensorService,
    private queueService: QueueService,
  ) {}

  async createSensor(req: Request, res: Response): Promise<void> {
    try {
      const sensor = await this.sensorService.createSensor(req.body);
      // TODO sacar esto
      //this.queueService.addJobToQueue(sensor.toJSON());
      logger.info(`Sensor created - name: ${sensor.get('name')}`);
      res.status(201).json(sensor);
    } catch (error) {
      logger.error('Error creating sensor', { error: getErrorMessage(error) });
      res.status(400).json({
        message: 'Error creating sensor',
        error: getErrorMessage(error),
      });
    }
  }

  async assignToProperty(req: Request, res: Response): Promise<void> {
    try {
      const { sensorId, propertyId } = req.body;
      const propertySensor = await this.sensorService.assignToProperty(sensorId, propertyId);
      // TODO sacar esto
      //this.queueService.addJobToQueue(propertySensor.toJSON());
      logger.info(`Sensor assigned to property - sensor: ${sensorId} - property: ${propertyId}`);
      res.status(200).json({ message: 'Sensor assigned to property successfully' });
    } catch (error) {
      logger.error('Error assigning sensor', { error: getErrorMessage(error) });
      res.status(400).json({
        message: 'Error assigning sensor',
        error: getErrorMessage(error),
      });
    }
  }

  async getObservableProperties(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const observableProperties = await this.sensorService.getObservableProperties(id);
      // TODO sacar esto
      //this.queueService.addJobToQueue(observableProperties);
      res.status(200).json({ message: observableProperties });
    } catch (error) {
      res.status(400).json({
        message: 'Error updating sensor',
        error: getErrorMessage(error),
      });
    }
  }

  async updateSensor(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updatedSensor = await this.sensorService.updateSensor(id, req.body);
      // TODO sacar esto
      //this.queueService.addJobToQueue(updatedSensor.toJSON());
      logger.info(`Sensor updated - id: ${id}`);
      res.status(200).json({ message: updatedSensor });
    } catch (error) {
      logger.error('Error updating sensor', { error: getErrorMessage(error) });
      res.status(400).json({
        message: 'Error updating sensor',
        error: getErrorMessage(error),
      });
    }
  }
}
