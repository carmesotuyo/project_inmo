import { Request, Response } from 'express';
import { SensorService } from '../../interfaces/services/sensorService';
import { getErrorMessage } from '../../utils/handleError';
import logger from '../../config/logger';

export class SensorController {
  constructor(private sensorService: SensorService) {}

  async createSensor(req: Request, res: Response): Promise<void> {
    try {
      const sensor = await this.sensorService.createSensor(req.body);
      logger.info(`Sensor created - name: ${sensor.get('name')}`);
      res.status(201).json(sensor);
    } catch (error) {
      logger.error(`Error creating sensor: ${getErrorMessage(error)}`);
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
      logger.info(`Sensor assigned to property - sensor: ${sensorId} - property: ${propertyId}`);
      res.status(200).json({ message: 'Sensor assigned to property successfully' });
    } catch (error) {
      logger.error(`Error assigning sensor: ${getErrorMessage(error)}`);
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
      res.status(200).json({ observableProperties });
    } catch (error) {
      res.status(400).json({
        message: 'Error getting properties from sensor',
        error: getErrorMessage(error),
      });
    }
  }

  async updateSensor(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updatedSensor = await this.sensorService.updateSensor(id, req.body);
      logger.info(`Sensor updated - id: ${id}`);
      res.status(200).json({ message: updatedSensor });
    } catch (error) {
      logger.error(`Error updating sensor: ${getErrorMessage(error)}`);
      res.status(400).json({
        message: 'Error updating sensor',
        error: getErrorMessage(error),
      });
    }
  }
}
