import { Request, Response } from 'express';
import { PropertyService } from '../interfaces/services/propertyService';
import { QueueService } from '../interfaces/services/queueService';
import { getErrorMessage } from '../utils/handleError';
import { PropertyFilterOptions } from '../utils/propertyFilters';
import logger from '../config/logger';

export class PropertyController {
  constructor(
    private propertyService: PropertyService,
    private queueService: QueueService,
  ) {}

  public createProperty = async (req: Request, res: Response) => {
    try {
      const property: any = await this.propertyService.createProperty(req.body); //propertyRequest
      this.queueService.addJobToQueue(property.toJSON());
      logger.info(`Property created - name: ${property.name}`);
      res.status(201).json(property);
    } catch (error: any) {
      logger.error('Error creating property', { error: getErrorMessage(error) });
      res.status(400).json({
        message: 'Error creating property',
        error: getErrorMessage(error),
      });
    }
  };
  async searchProperties(req: Request, res: Response): Promise<void> {
    try {
      const filters: PropertyFilterOptions = req.query as unknown as PropertyFilterOptions;
      const result = await this.propertyService.searchProperties(filters);
      logger.info(`Properties fetched - filters: ${JSON.stringify(filters)}`);
      res.status(200).json(result);
    } catch (error: any) {
      logger.error('Error searching property', { error: getErrorMessage(error) });
      res.status(400).json({
        message: 'Error searching property',
        error: getErrorMessage(error),
      });
    }
  }
}
