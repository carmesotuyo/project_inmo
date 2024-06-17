import { Request, Response } from 'express';
import { getIncomeByProperty, getReservations, getProperties, getOccupancyRate, getPropertiesWithMostProblems } from '../services/reportService';

export const rentalIncomeReport = async (req: Request, res: Response) => {
  const { propertyId, startDate, endDate } = req.body;
  try {
    const report = await getIncomeByProperty(parseInt(propertyId as string), new Date(startDate as string), new Date(endDate as string));
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching rental income report' });
  }
};

export const occupancyRateReport = async (req: Request, res: Response) => {
  const { startDate, endDate, district, countryId } = req.body;
  try {
    const report = await getOccupancyRate(new Date(startDate as string), new Date(endDate as string), district as string, countryId as string);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching occupancy rate report' });
  }
};

export const propertiesWithMostProblemsReport = async (req: Request, res: Response) => {
  const { startDate, endDate, district, countryId } = req.body;
  try {
    const report = await getPropertiesWithMostProblems(new Date(startDate as string), new Date(endDate as string), district as string, countryId as string);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching properties with most problems report' });
  }
};

export const allReservations = async (req: Request, res: Response) => {
  try {
    const reservations = await getReservations();
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching reservations report' });
  }
};

export const allProperties = async (req: Request, res: Response) => {
  try {
    const properties = await getProperties();
    res.json(properties);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching properties report' });
  }
};
