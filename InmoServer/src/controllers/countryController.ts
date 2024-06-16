import { Request, Response } from 'express';
import { CountryService } from '../interfaces/services/countryService';
import { QueueService } from '../interfaces/services/queueService';
import { getErrorMessage } from '../utils/handleError';
import logger from '../config/logger';

export class CountryController {
  constructor(
    private countryService: CountryService,
    private queueService: QueueService,
  ) {}

  public createCountry = async (req: Request, res: Response) => {
    try {
      const country = await this.countryService.createCountry(req.body);
      // TODO sacar esto
      //this.queueService.addJobToQueue("country", country.toJSON());
      logger.info(`Country created - name: ${country.get('name')}`);
      res.status(201).json(country);
    } catch (error: any) {
      logger.error('Error creating country', { error: getErrorMessage(error) });
      res.status(400).json({
        message: 'Error creating country',
        error: getErrorMessage(error),
      });
    }
  };

  public updateCountry = async (req: Request, res: Response) => {
    try {
      const { name } = req.params;
      const { cancellationDays, returnPercentage } = req.body;

      const updatedCountry = await this.countryService.updateCountry(name, { cancellationDays, returnPercentage });
      if (!updatedCountry) {
        return res.status(404).json({ message: 'Country not found' });
      }
      // TODO sacar esto
      //this.queueService.addJobToQueue("country", updatedCountry.toJSON());
      logger.info(`Country updated - name: ${name}`);
      res.status(200).json(updatedCountry);
    } catch (error: any) {
      logger.error('Error updating country', { error: getErrorMessage(error) });
      res.status(400).json({
        message: 'Error updating country',
        error: getErrorMessage(error),
      });
    }
  };
}
