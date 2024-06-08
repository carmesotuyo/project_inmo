import { CountryService } from '../interfaces/services/countryService';
import { Country } from '../data-access/country';
import { CountryRequest } from '../dtos/countryRequest';

export class CountryServiceImpl implements CountryService {
  async createCountry(data: CountryRequest): Promise<InstanceType<typeof Country>> {
    if (!data) throw Error('Data incorrecta, DTO vacio');
    const countryObject = { ...data };
    return await Country.create(countryObject);
  }

  async updateCountry(name: string, data: Partial<{ cancellationDays: number; returnPercentage: number }>): Promise<InstanceType<typeof Country> | null> {
    const country = await Country.findByPk(name);
    if (!country) {
      throw new Error('Country not found');
    }

    if (data.cancellationDays !== undefined) {
      country.set('cancellationDays', data.cancellationDays);
    }

    if (data.returnPercentage !== undefined) {
      country.set('returnPercentage', data.returnPercentage);
    }

    await country.save();
    return country;
  }
}
