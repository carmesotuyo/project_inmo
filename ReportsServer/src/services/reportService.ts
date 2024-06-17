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

export const getOccupancyRate = async (startDate: Date, endDate: Date, district: string, countryId: string) => {
  try {
    const properties = await Property.find({ district, countryId });
    const propertyIds = properties.map(p => p.id);

    const reservations = await Reservation.find({
      propertyId: { $in: propertyIds },
      startDate: { $gte: startDate },
      endDate: { $lte: endDate }
    });

    const groupedByNeighborhood = properties.reduce<Record<string, NeighborhoodStats>>((acc, property) => {
      const neighborhood = property.neighborhood;
      if (!acc[neighborhood]) {
        acc[neighborhood] = { count: 0, rentedCount: 0 };
      }
      acc[neighborhood].count += 1;
      acc[neighborhood].rentedCount += reservations.filter(r => r.propertyId === property.id).length;
      return acc;
    }, {});

    const occupancyRates = Object.keys(groupedByNeighborhood).map(neighborhood => ({
      neighborhood,
      totalProperties: groupedByNeighborhood[neighborhood].count,
      rentedProperties: groupedByNeighborhood[neighborhood].rentedCount,
      occupancyRate: groupedByNeighborhood[neighborhood].rentedCount / groupedByNeighborhood[neighborhood].count
    }));

    return occupancyRates.sort((a, b) => b.occupancyRate - a.occupancyRate);
  } catch (error) {
    console.error('Error fetching occupancy rates:', error);
    throw error;
  }
};



