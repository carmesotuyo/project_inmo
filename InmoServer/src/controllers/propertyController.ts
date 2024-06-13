import { Request, Response } from 'express';
import { PropertyService } from '../interfaces/services/propertyService';
import { QueueService } from '../interfaces/services/queueService';
import { getErrorMessage } from '../utils/handleError';
import { PropertyFilterOptions } from '../utils/propertyFilters';

export class PropertyController {
  constructor(
    private propertyService: PropertyService,
    private queueService: QueueService,
  ) {}

  public createProperty = async (req: Request, res: Response) => {
    try {
      const property = await this.propertyService.createProperty(req.body); //propertyRequest
      this.queueService.addJobToQueue(property.toJSON());
      res.status(201).json(property);
    } catch (error: any) {
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

      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({
        message: 'Error searching property',
        error: getErrorMessage(error),
      });
    }
  }
}
