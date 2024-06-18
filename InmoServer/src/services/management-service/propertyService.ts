import { PropertyRequest } from '../../dtos/propertyRequest';
import { PropertyResponse } from '../../dtos/propertyResponse';
import { Property } from '../../data-access/property';
import { PropertyService } from '../../interfaces/services/propertyService';
import { PropertyAvailability } from '../../data-access/propertyAvailability';
import { PropertyFilterOptions } from '../../utils/propertyFilters';
import { PropertyFilter } from '../../utils/propertyFilters';
import { reduceImages } from '../../utils/reducedImageAdapter';

export class PropertyServiceImpl implements PropertyService {
  async getPropertyByID(id: number): Promise<InstanceType<typeof Property>> {
    const property = await Property.findByPk(id);
    if (!property) throw new Error('Propiedad no encontrada');
    return property;
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

      const { count, rows } = await Property.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        include: [{ model: PropertyAvailability, as: 'availabilities' }],
      });

      const properties = rows.map((property) => {
        const propertyData = property.toJSON();

        if (!startDate || !endDate) {
          // Si no se ingresa rango de fechas, calcular disponibilidad para los próximos 30 días
          const today = new Date();
          const next30Days = Array.from({ length: 30 }, (_, i) => {
            const date = new Date();
            date.setDate(today.getDate() + i);
            return date.toISOString().split('T')[0];
          });

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

          propertyData.availabilityCalendar = next30Days.map((date) => ({
            date,
            available: !unavailableDates.has(date),
          }));
        } else {
          // Verificar disponibilidad en el rango de fechas proporcionado
          const available = propertyData.availabilities.some((availability: any) => {
            return new Date(availability.startDate) <= new Date(startDate) && new Date(availability.endDate) >= new Date(endDate);
          });
          propertyData.available = available;
        }

        return propertyData;
      });

      return {
        properties,
        total: count,
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

    return await Property.create(propertyObject);
  }

  async existsProperty(id: number): Promise<boolean> {
    return (await Property.findByPk(id)) != null;
  }
}
