import { Op } from 'sequelize';

export interface ReservationFilterOptions {
  startDate?: string;
  endDate?: string;
  propertyCode?: string;
  tenantEmail?: string;
  tenantName?: string;
  reservationStatus?: 'Pending Approval' | 'Approved' | 'Rejected' | 'Cancelled by Tenant';
  limit?: number;
  offset?: number;
}

export class ReservationFilter {
  private filters: ReservationFilterOptions;

  constructor(filters: ReservationFilterOptions) {
    this.filters = filters;
  }

  async buildWhereClause(): Promise<any> {
    const whereClause: any = {};

    if (this.filters.startDate && this.filters.endDate) {
      whereClause.startDate = {
        [Op.between]: [new Date(this.filters.startDate), new Date(this.filters.endDate)],
      };
    }

    if (this.filters.propertyCode) {
      whereClause.propertyId = this.filters.propertyCode;
    }

    if (this.filters.tenantEmail) {
      whereClause['inquilino.email'] = { [Op.like]: `%${this.filters.tenantEmail}%` };
    }

    if (this.filters.tenantName) {
      whereClause['inquilino.name'] = { [Op.like]: `%${this.filters.tenantName}%` };
    }

    if (this.filters.reservationStatus) {
      whereClause.status = this.filters.reservationStatus;
    }

    return whereClause;
  }
}
