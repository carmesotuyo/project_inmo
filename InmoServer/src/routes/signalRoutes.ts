import { Router } from 'express';
import { signalController } from '../controllers/';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const { getSignals, getRecentSignalsForProperty } = signalController;


router.get('/signals',authMiddleware(['Administrador']), getSignals);
router.get('/signals/:propertyId',authMiddleware(['Administrador']), getRecentSignalsForProperty);

export default router;
