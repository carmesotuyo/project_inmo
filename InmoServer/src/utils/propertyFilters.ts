import { Op } from 'sequelize';

export interface PropertyFilterOptions {
  startDate?: string;
  endDate?: string;
  adults?: number;
  children?: number;
  doubleBeds?: number;
  singleBeds?: number;
  airConditioning?: boolean;
  wifi?: boolean;
  garage?: boolean;
  propertyType?: 'house' | 'apartment';
  distanceToBeach?: number;
  state?: string;
  resort?: string;
  neighborhood?: string;
  limit?: number;
  offset?: number;
}

export class PropertyFilter {
  private filters: PropertyFilterOptions;

  constructor(filters: PropertyFilterOptions) {
    this.validateFilters(filters);
    this.filters = filters;
  }

  private validateFilters(filters: PropertyFilterOptions): void {
    const numericFields: (keyof PropertyFilterOptions)[] = ['adults', 'children', 'doubleBeds', 'singleBeds', 'distanceToBeach'];
    for (const field of numericFields) {
      const value = filters[field];
      if (value !== undefined && (typeof value !== 'number' || value < 0 || value > 99)) {
        throw new Error(`${field} debe estar entre 0 y 99`);
      }
    }
  }

  async buildWhereClause(): Promise<any> {
    const whereClause: any = {};

    if (this.filters.startDate && this.filters.endDate) {
      whereClause.available = {
        [Op.notBetween]: [new Date(this.filters.startDate), new Date(this.filters.endDate)],
      };
    }

    if (this.filters.adults !== undefined) {
      whereClause.adults = { [Op.gte]: this.filters.adults };
    }

    if (this.filters.children !== undefined) {
      whereClause.children = { [Op.gte]: this.filters.children };
    }

    if (this.filters.doubleBeds !== undefined) {
      whereClause.doubleBeds = { [Op.gte]: this.filters.doubleBeds };
    }

    if (this.filters.singleBeds !== undefined) {
      whereClause.singleBeds = { [Op.gte]: this.filters.singleBeds };
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

    if (this.filters.propertyType) {
      whereClause.propertyType = this.filters.propertyType;
    }

    if (this.filters.distanceToBeach !== undefined) {
      whereClause.distanceToBeach = { [Op.lte]: this.filters.distanceToBeach };
    }

    if (this.filters.state) {
      whereClause.state = this.filters.state;
    }

    if (this.filters.resort) {
      whereClause.resort = { [Op.like]: `%${this.filters.resort}%` };
    }

    if (this.filters.neighborhood) {
      whereClause.neighborhood = { [Op.like]: `%${this.filters.neighborhood}%` };
    }

    return whereClause;
  }
}
