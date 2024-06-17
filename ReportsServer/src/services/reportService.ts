import Reservation from '../models/reservation';
import Property from '../models/property';
import Incident from '../models/incident';
import { NeighborhoodStats } from '../types/NeighborhoodStats';

export const getIncomeByProperty = async (propertyId: number, startDate: Date, endDate: Date) => {
  try {
    const reservations = await Reservation.find({
      propertyId,
      startDate: { $gte: startDate },
      endDate: { $lte: endDate },
    });

    const totalIncome = reservations.reduce((sum, reservation) => sum + reservation.amountPaid, 0);

    return {
      reservations,
      totalIncome,
    };
  } catch (error) {
    console.error('Error fetching rental income:', error);
    throw error;
  }
};

