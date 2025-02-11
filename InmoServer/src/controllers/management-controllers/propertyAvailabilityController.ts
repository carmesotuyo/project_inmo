import { Request, Response } from 'express';
import { PropertyAvailabilityService } from '../../interfaces/services/propertyAvailabilityService';
import { getErrorMessage } from '../../utils/handleError';
import logger from '../../config/logger';

export class PropertyAvailabilityController {
  constructor(private propertyAvailabilityService: PropertyAvailabilityService) {}

  public createAvailability = async (req: Request, res: Response) => {
    try {
      const availability = await this.propertyAvailabilityService.createAvailability(req.body);
      logger.info(`Availability created - property: ${availability.get('propertyId')}`);
      res.status(201).json(availability);
    } catch (error: any) {
      logger.error(`Error creating availability: ${getErrorMessage(error)}`);
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
      logger.info(`Availability updated - id: ${id}`);
      res.status(200).json(availability);
    } catch (error: any) {
      logger.error(`Error updating availability: ${getErrorMessage(error)}`);
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
      logger.info(`Availabilities fetched - property: ${propertyId}`);
      res.status(200).json(availabilities);
    } catch (error: any) {
      logger.error(`Error fetching availabilities: ${getErrorMessage(error)}`);
      res.status(400).json({
        message: 'Error fetching availabilities',
        error: getErrorMessage(error),
      });
    }
  };
}
