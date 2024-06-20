import { Request, Response } from 'express';
import { CountryService } from '../../interfaces/services/countryService';
import { getErrorMessage } from '../../utils/handleError';
import logger from '../../config/logger';

export class CountryController {
  constructor(private countryService: CountryService) {}

  public createCountry = async (req: Request, res: Response) => {
    try {
      const country = await this.countryService.createCountry(req.body);
      logger.info(`Country created - name: ${country.get('name')}`);
      res.status(201).json(country);
    } catch (error: any) {
      logger.error(`Error creating country: ${getErrorMessage(error)}`);
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
      logger.info(`Country updated - name: ${name}`);
      res.status(200).json(updatedCountry);
    } catch (error: any) {
      logger.error(`Error updating country: ${getErrorMessage(error)}`);
      res.status(400).json({
        message: 'Error updating country',
        error: getErrorMessage(error),
      });
    }
  };
}
