import { Router } from 'express';

import { allReservations, allProperties, rentalIncomeReport, occupancyRateReport, propertiesWithMostProblemsReport } from '../controllers/reportController';

const router = Router();

router.get('/reservations', allReservations);
router.get('/properties', allProperties);
router.get('/rentalIncome', rentalIncomeReport);
router.get('/occupancyRate', occupancyRateReport);
router.get('/propertiesWithMostProblems', propertiesWithMostProblemsReport);

export default router;
