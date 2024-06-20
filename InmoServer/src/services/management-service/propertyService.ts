import { PropertyRequest } from '../../dtos/propertyRequest';
import { Property } from '../../data-access/property';
import { PropertyService } from '../../interfaces/services/propertyService';
import { PropertyAvailability } from '../../data-access/propertyAvailability';
import { PropertyFilterOptions } from '../../utils/propertyFilters';
import { PropertyFilter } from '../../utils/propertyFilters';
import { reduceImages } from '../../utils/reducedImageAdapter';
import { PaymentService } from '../../interfaces/services/paymentService';
import { fetchAndCache, fetchAndCacheExistence, saveToCache } from '../../cache/withCache';
import CacheModule from '../../cache/cacheModule';
import dotenv from 'dotenv';

dotenv.config();

const propertyCacheKeyGenerator = (id: string) => `property:${id}`;
const ttl = 60; //cache ttl in seconds

export class PropertyServiceImpl implements PropertyService {
  constructor(
    private paymentService: PaymentService,
    private cache: CacheModule,
  ) {}

  async getPropertyByID(id: number): Promise<InstanceType<typeof Property>> {
    return fetchAndCache<InstanceType<typeof Property>>(this.cache, propertyCacheKeyGenerator, ttl, id, async (id: string) => {
      const DBProperty = await Property.findByPk(id);
      return DBProperty ? DBProperty.toJSON() : null;
    });
  }

  async searchProperties(filters: PropertyFilterOptions): Promise<{ properties: any[]; total: number }> {
    try {
      const propertyFilter = new PropertyFilter(filters);
      const whereClause = await propertyFilter.buildWhereClause();

      let { limit = 10, page = 1, startDate, endDate } = filters;

      // Validación de parámetros de paginación
      limit = Math.max(1, Math.min(limit, 100));
      page = Math.max(1, page);

      const offset = (page - 1) * limit;

      // Consulta para obtener propiedades con disponibilidad en el rango de fechas especificado
      const { rows } = await Property.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        include: [{ model: PropertyAvailability, as: 'availabilities' }],
      });

      // Filtrar propiedades según su disponibilidad dentro del rango de fechas
      const properties = rows
        .filter((property: any) => {
          // Verificar si la propiedad tiene disponibilidad en el rango de fechas
          if (startDate && endDate) {
            return property.availabilities.some((availability: any) => {
              const start = new Date(startDate);
              const end = new Date(endDate);
              const availStart = new Date(availability.startDate);
              const availEnd = new Date(availability.endDate);

              return availStart <= end && availEnd >= start;
            });
          }
          return true; // Si no se especifica rango de fechas, mostrar todas las propiedades
        })
        .map((property) => {
          const propertyData = property.toJSON();

          let availabilityCalendar: string[] = [];
          const unavailableDates = new Set(
            propertyData.availabilities.flatMap((availability: any) => {
              const dates = [];
              let currentDate = new Date(availability.startDate);
              while (currentDate <= new Date(availability.endDate)) {
                dates.push(currentDate.toISOString().split('T')[0]);
                currentDate.setDate(currentDate.getDate() + 1);
              }
              return dates;
            }),
          );

          if (!startDate || !endDate) {
            // Si no se ingresa rango de fechas, calcular disponibilidad para los próximos 30 días
            const today = new Date();
            const next30Days = Array.from({ length: 30 }, (_, i) => {
              const date = new Date();
              date.setDate(today.getDate() + i);
              return date.toISOString().split('T')[0];
            });

            availabilityCalendar = next30Days.filter((date) => unavailableDates.has(date));
          } else {
            // Verificar disponibilidad en el rango de fechas proporcionado
            const start = new Date(startDate);
            const end = new Date(endDate);
            const dateRange = [];
            while (start <= end) {
              dateRange.push(start.toISOString().split('T')[0]);
              start.setDate(start.getDate() + 1);
            }

            availabilityCalendar = dateRange.filter((date) => unavailableDates.has(date));
          }

          return {
            id: propertyData.id,
            name: propertyData.name,
            numberOfAdults: propertyData.numberOfAdults,
            numberOfKids: propertyData.numberOfKids,
            numberOfDoubleBeds: propertyData.numberOfDoubleBeds,
            numberOfSingleBeds: propertyData.numberOfSingleBeds,
            airConditioning: propertyData.airConditioning,
            wifi: propertyData.wifi,
            garage: propertyData.garage,
            houseOrApartment: propertyData.houseOrApartment,
            mtsToTheBeach: propertyData.mtsToTheBeach,
            countryId: propertyData.countryId,
            stateOrProvince: propertyData.stateOrProvince,
            district: propertyData.district,
            neighborhood: propertyData.neighborhood,
            reducedImages: propertyData.reducedImages,
            pricePerNight: propertyData.pricePerNight,
            availabilityCalendar: availabilityCalendar,
          };
        })
        .filter((property) => property.availabilityCalendar.length > 0);

      return {
        properties,
        total: properties.length,
      };
    } catch (error: any) {
      throw new Error(`Error searching property: ${error.message}`);
    }
  }

  async getAllProperties(): Promise<InstanceType<typeof Property>[]> {
    return await Property.findAll();
  }

  async createProperty(data: PropertyRequest): Promise<InstanceType<typeof Property>> {
    if (!data) throw Error('Data incorrecta, DTO vacio');

    const imagesArray = data.images.split(',');

    // Validar que al menos haya 4 imágenes
    if (imagesArray.length < 4) {
      throw new Error('Debe proporcionar al menos 4 imágenes');
    }

    // Simular validación del tamaño de las imágenes
    const maxImageSize = 500 * 1024; // 500 KB
    const isValidSize = imagesArray.every((image) => image.length <= maxImageSize);
    if (!isValidSize) {
      throw new Error('Cada imagen debe ser menor a 500 KB');
    }

    // Llamar al servicio externo para reducir el tamaño de las imágenes
    const reducedImages = await reduceImages(imagesArray);
    const reducedImagesString = reducedImages.join(',');

    const propertyObject = {
      ...data,
      status: 'Pendiente de pago',
      reducedImages: reducedImagesString,
    };

    const property = await Property.create(propertyObject);
    await saveToCache(this.cache, propertyCacheKeyGenerator, ttl, property.toJSON(), property.get('id'));
    return property;
  }

  async existsProperty(id: number): Promise<boolean> {
    return fetchAndCacheExistence<InstanceType<typeof Property>>(this.cache, propertyCacheKeyGenerator, ttl, id, async (id: string) => {
      const DBProperty = await Property.findByPk(id);
      return DBProperty ? DBProperty.toJSON() : null;
    });
  }

  async processPayment(propertyId: number, email: string): Promise<void> {
    const property = await Property.findByPk(propertyId);
    if (!property) throw new Error(`Property not found with ID ${propertyId}`);
    if (property.get('status') === 'Activo') throw new Error(`Property with id ${propertyId} is already Active`);
    const amountToPay = Number(process.env.PRICE_ACTIVATE_PROPERTY);
    const success = await this.paymentService.processPayment(email, amountToPay);
    if (success) {
      await Property.update({ status: 'Activo' }, { where: { id: propertyId } });
      await this.cache.del(propertyCacheKeyGenerator(propertyId.toString())); //eliminamos la version anterior del cache si es que existia
    } else throw new Error('No se pudo procesar el pago correctamente. Vuelva a intentar');
  }
}
