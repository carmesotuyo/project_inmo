import { Request, Response } from 'express';
import { ServiceTypeService } from '../interfaces/services/sensorServiceType';
import { QueueService } from '../interfaces/services/queueService';
import { getErrorMessage } from '../utils/handleError';

export class ServiceTypeController {
  constructor(
    private serviceTypeService: ServiceTypeService,
    private queueService: QueueService,
  ) {}

  async createServiceType(req: Request, res: Response): Promise<void> {
    try {
      const serviceType = await this.serviceTypeService.createServiceType(req.body);
      this.queueService.addJobToQueue(serviceType.toJSON());
      res.status(201).json(serviceType);
    } catch (error) {
      res.status(400).json({
        message: 'Error creating sensor',
        error: getErrorMessage(error),
      });
    }
  }
}
