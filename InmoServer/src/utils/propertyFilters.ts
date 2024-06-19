import { Op } from 'sequelize';

export interface PropertyFilterOptions {
  [key: string]: number | boolean | string | undefined;
  startDate?: string;
  endDate?: string;
  numberOfAdults?: number | string;
  numberOfKids?: number;
  numberOfDoubleBeds?: number;
  numberOfSingleBeds?: number;
  airConditioning?: boolean;
  wifi?: boolean;
  garage?: boolean;
  houseOrApartment?: 'house' | 'apartment';
  mtsToTheBeach?: number;
  stateOrProvince?: string;
  resort?: string;
  neighborhood?: string;
  limit?: number;
  page?: number;
}

export class PropertyFilter {
  private filters: PropertyFilterOptions;

  constructor(filters: PropertyFilterOptions) {
    this.validateFilters(filters);
    this.filters = filters;
  }

  private validateFilters(filters: PropertyFilterOptions): void {
    const numericFields: (keyof PropertyFilterOptions)[] = ['numberOfAdults', 'numberOfKids', 'numberOfDoubleBeds', 'numberOfSingleBeds', 'mtsToTheBeach'];
    for (const field of numericFields) {
      const value = filters[field];
      if (value !== undefined) {
        const valorNum = parseInt(value.toString());
        if (isNaN(valorNum)) {
          throw new Error(`El valor de ${field} debe ser un número.`);
        }
        if (valorNum < 0 || valorNum > 99) {
          throw new Error(`El valor de ${field} debe estar entre 0 y 99.`);
        }
        filters[field] = valorNum; // Convierte el valor a número
      }
    }

    if (filters.startDate && isNaN(Date.parse(filters.startDate))) {
      throw new Error('startDate debe ser una fecha válida.');
    }

    if (filters.endDate && isNaN(Date.parse(filters.endDate))) {
      throw new Error('endDate debe ser una fecha válida.');
    }

    if (filters.startDate && filters.endDate && new Date(filters.startDate) > new Date(filters.endDate)) {
      throw new Error('startDate no puede ser mayor que endDate.');
    }

    // Convertir strings a booleanos para filtros booleanos
    const booleanFields: (keyof PropertyFilterOptions)[] = ['airConditioning', 'wifi', 'garage'];
    for (const field of booleanFields) {
      if (filters[field] !== undefined) {
        filters[field as string] = filters[field] === 'true' || filters[field] === true;
      }
    }
  }

  async buildWhereClause(): Promise<any> {
    const whereClause: any = {};

    if (this.filters.numberOfAdults !== undefined) {
      whereClause.numberOfAdults = { [Op.gte]: this.filters.numberOfAdults };
    }

    if (this.filters.numberOfKids !== undefined) {
      whereClause.numberOfKids = { [Op.gte]: this.filters.numberOfKids };
    }

    if (this.filters.numberOfDoubleBeds !== undefined) {
      whereClause.numberOfDoubleBeds = { [Op.gte]: this.filters.numberOfDoubleBeds };
    }

    if (this.filters.numberOfSingleBeds !== undefined) {
      whereClause.numberOfSingleBeds = { [Op.gte]: this.filters.numberOfSingleBeds };
    }

    if (this.filters.airConditioning !== undefined) {
      whereClause.airConditioning = this.filters.airConditioning;
    }

    if (this.filters.wifi !== undefined) {
      whereClause.wifi = this.filters.wifi;
    }

    if (this.filters.garage !== undefined) {
      whereClause.garage = this.filters.garage;
    }

    if (this.filters.houseOrApartment) {
      whereClause.houseOrApartment = this.filters.houseOrApartment;
    }

    if (this.filters.mtsToTheBeach !== undefined) {
      whereClause.mtsToTheBeach = { [Op.gte]: this.filters.mtsToTheBeach };
    }

    if (this.filters.stateOrProvince) {
      whereClause.stateOrProvince = this.filters.stateOrProvince;
    }

    if (this.filters.resort) {
      whereClause.resort = { [Op.like]: `%${this.filters.resort}%` };
    }

    if (this.filters.neighborhood) {
      whereClause.neighborhood = { [Op.like]: `%${this.filters.neighborhood}%` };
    }

    whereClause.status = 'Activo';

    return whereClause;
  }
}
