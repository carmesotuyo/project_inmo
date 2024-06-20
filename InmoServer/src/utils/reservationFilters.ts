import { Op } from 'sequelize';
import { Reservation } from '../data-access/reservation'; // Asegúrate de importar el modelo correcto

export interface ReservationFilterOptions {
  startDate?: string;
  endDate?: string;
  propertyCode?: string;
  tenantEmail?: string;
  tenantName?: string;
  reservationStatus?: 'Pending Approval' | 'Approved' | 'Rejected' | 'Cancelled by Tenant';
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

    if (this.filters.reservationStatus) {
      whereClause.status = this.filters.reservationStatus;
    }

    return whereClause;
  }
}
