import { Request, Response } from 'express';
import { SensorService } from '../interfaces/services/sensorService';
import { QueueService } from '../interfaces/services/queueService';
import { getErrorMessage } from '../utils/handleError';

export class SensorController {
  constructor(
    private sensorService: SensorService,
    private queueService: QueueService,
  ) {}

  async createSensor(req: Request, res: Response): Promise<void> {
    try {
      const sensor = await this.sensorService.createSensor(req.body);
      this.queueService.addJobToQueue(sensor.toJSON());
      res.status(201).json(sensor);
    } catch (error) {
      res.status(400).json({
        message: 'Error creating sensor',
        error: getErrorMessage(error),
      });
    }
  }

  async assignToProperty(req: Request, res: Response): Promise<void> {
    try {
      const { propertyId } = req.body;
      const { id: sensorId } = req.params;
      await this.sensorService.assignToProperty(sensorId, propertyId);
      res.status(200).json({ message: 'Sensor assigned to property successfully' });
    } catch (error) {
      res.status(400).json({
        message: 'Error assigning sensor',
        error: getErrorMessage(error),
      });
    }
  }
}
