import { Request, Response } from 'express';
import { PropertyService } from '../../interfaces/services/propertyService';
import { QueueService } from '../../interfaces/services/queueService';
import { getErrorMessage } from '../../utils/handleError';
import { PropertyFilterOptions } from '../../utils/propertyFilters';
import logger from '../../config/logger';

export class PropertyController {
  constructor(
    private propertyService: PropertyService,
    private queueService: QueueService,
  ) {}

  public createProperty = async (req: Request, res: Response) => {
    try {
      const property = await this.propertyService.createProperty(req.body);
      this.queueService.addJobToQueue('property', property.toJSON());
      logger.info(`Property created - name: ${property.get('name')}`);
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

      // Validar y transformar parámetros de paginación
      filters.limit = filters.limit ? parseInt(filters.limit as any, 10) : 10;
      filters.page = filters.page ? parseInt(filters.page as any, 10) : 1;

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

  async getAllProperties(req: Request, res: Response): Promise<void> {
    try {
      const properties = await this.propertyService.getAllProperties();
      logger.info('Properties fetched');
      res.status(200).json(properties);
    } catch (error: any) {
      logger.error('Error fetching properties', { error: getErrorMessage(error) });
      res.status(400).json({
        message: 'Error fetching properties',
        error: getErrorMessage(error),
      });
    }
  }
}
