import { Request, Response } from 'express';
import { ServiceTypeService } from '../../interfaces/services/sensorServiceType';
import { getErrorMessage } from '../../utils/handleError';

export class ServiceTypeController {
  constructor(private serviceTypeService: ServiceTypeService) {}

  async createServiceType(req: Request, res: Response): Promise<void> {
    try {
      const serviceType = await this.serviceTypeService.createServiceType(req.body);
      res.status(201).json(serviceType);
    } catch (error) {
      res.status(400).json({
        message: 'Error creating sensor service type',
        error: getErrorMessage(error),
      });
    }
  }
}
