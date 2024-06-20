import { Router } from 'express';
import { propertyAvailabilityController } from '../controllers';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.post('/availabilities',authMiddleware(['Propietario']), propertyAvailabilityController.createAvailability);
router.put('/availabilities/:id',authMiddleware(['Propietario']), propertyAvailabilityController.updateAvailability);
router.get('/properties/:propertyId/availabilities',authMiddleware(['Administrador']), propertyAvailabilityController.getAvailabilities);

export default router;
