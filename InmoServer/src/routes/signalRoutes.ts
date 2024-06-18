import { Router } from 'express';
import { signalController } from '../controllers/';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();
const { getSignals, getRecentSignalsForProperty } = signalController;

// router.get('/signals', authenticateJWT(['Administrador']), getSignals);
router.get('/signals', getSignals);
router.get('/signals/:propertyId', getRecentSignalsForProperty);

export default router;
