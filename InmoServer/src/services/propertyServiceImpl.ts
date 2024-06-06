import { PropertyRequest } from '../dtos/propertyRequest';
import { Property } from '../data-access/property';
import { PropertyService } from '../interfaces/services/propertyService';

export class PropertyServiceImpl implements PropertyService {
  async createProperty(data: PropertyRequest): Promise<InstanceType<typeof Property>> {
    
    const propertyData = {
      name: data.name,
      numberOfAdults: data.numberOfAdults,
      numberOfKids: data.numberOfKids,
      numberOfDoubleBeds: data.numberOfDoubleBeds,
      numberOfSingleBeds: data.numberOfSingleBeds,
      airConditioning: data.airConditioning,
      wifi: data.wifi,
      garage: data.garage,
      houseOrApartment: data.houseOrApartment,
      mtsToTheBeach: data.mtsToTheBeach,
      countryId: data.countryId,
      stateOrProvince: data.stateOrProvince,
      district: data.district,
      neighborhood: data.neighborhood,
      images: data.images,
      status: data.status,
    };

    const property = await Property.create(propertyData as any);
    return property;
  }
}

