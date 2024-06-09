import { Request, Response } from 'express';
import { PropertyAvailabilityService } from '../interfaces/services/propertyAvailabilityService';
import { QueueService } from '../interfaces/services/queueService';
import { getErrorMessage } from '../utils/handleError';

export class PropertyAvailabilityController {
  constructor(
    private propertyAvailabilityService: PropertyAvailabilityService,
    private queueService: QueueService,
  ) {}

  public createAvailability = async (req: Request, res: Response) => {
    try {
      const availability = await this.propertyAvailabilityService.createAvailability(req.body);
      this.queueService.addJobToQueue(availability.toJSON());
      res.status(201).json(availability);
    } catch (error: any) {
      res.status(400).json({
        message: 'Error creating availability',
        error: getErrorMessage(error),
      });
    }
  };

  public updateAvailability = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const availability = await this.propertyAvailabilityService.updateAvailability(Number.parseInt(id), req.body);
      if (!availability) {
        return res.status(404).json({ message: 'Availability not found' });
      }

      this.queueService.addJobToQueue(availability.toJSON());
      res.status(200).json(availability);
    } catch (error: any) {
      res.status(400).json({
        message: 'Error updating availability',
        error: getErrorMessage(error),
      });
    }
  };

  public getAvailabilities = async (req: Request, res: Response) => {
    try {
      const { propertyId } = req.params;
      const availabilities = await this.propertyAvailabilityService.getAllAvailabilities(Number.parseInt(propertyId));
      res.status(200).json(availabilities);
    } catch (error: any) {
      res.status(400).json({
        message: 'Error fetching availabilities',
        error: getErrorMessage(error),
      });
    }
  };
}
