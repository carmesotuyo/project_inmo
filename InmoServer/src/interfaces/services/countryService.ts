import { CountryRequest } from '../../dtos/countryRequest';
import { Country } from '../../data-access/country';

export interface CountryService {
  createCountry(data: CountryRequest): Promise<InstanceType<typeof Country>>;
  updateCountry(name: string, data: Partial<{ cancellationDays: number; returnPercentage: number }>): Promise<InstanceType<typeof Country> | null>;
  getRefundPolicyByCountry(country: string): Promise<{ refundDays: number; refundPercentage: number }>;
}
