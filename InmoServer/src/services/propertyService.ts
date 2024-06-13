import { PropertyRequest } from '../dtos/propertyRequest';
import { Property } from '../data-access/property';
import { PropertyService } from '../interfaces/services/propertyService';
import { Model } from 'sequelize';
import { Reservation } from '../data-access/reservation';
import { PropertyAvailability } from '../data-access/propertyAvailability';
import { PropertyFilterOptions } from '../utils/propertyFilters';
import { PropertyFilter } from '../utils/propertyFilters';

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

      console.log('Generated Where Clause:', whereClause); // Agrega este mensaje de depuración

      const { limit = 10, offset = 0, startDate, endDate } = filters;

      const { count, rows } = await Property.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        include: [{ model: PropertyAvailability, as: 'availabilities' }],
      });

      console.log('Number of Properties Found:', count); // Agrega este mensaje de depuración

      const properties = rows.map((property) => {
        const propertyData = property.toJSON();

        if (!startDate || !endDate) {
          // Si no se ingresa rango de fechas, se debe calcular disponibilidad para los próximos 30 días
          const today = new Date();
          const next30Days = Array.from({ length: 30 }, (_, i) => {
            const date = new Date();
            date.setDate(today.getDate() + i);
            return date.toISOString().split('T')[0];
          });

          const unavailableDates = propertyData.availabilities
            .map((availability: any) => {
              const dates = [];
              let currentDate = new Date(availability.startDate);
              while (currentDate <= new Date(availability.endDate)) {
                dates.push(currentDate.toISOString().split('T')[0]);
                currentDate.setDate(currentDate.getDate() + 1);
              }
              return dates;
            })
            .flat();

          propertyData.availabilityCalendar = next30Days.map((date) => ({
            date,
            available: !unavailableDates.includes(date),
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

  async createProperty(data: PropertyRequest): Promise<InstanceType<typeof Property>> {
    if (!data) throw Error('Data incorrecta, DTO vacio');
    const propertyObject = { ...data, status: 'Pendiente de pago' };
    return await Property.create(propertyObject);
  }
  async existsProperty(id: number): Promise<boolean> {
    return (await Property.findByPk(id)) != null;
  }
}
