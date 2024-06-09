import { Router } from 'express';
import { propertyAvailabilityController } from '../controllers';

const router = Router();

router.post('/availabilities', propertyAvailabilityController.createAvailability);
router.put('/availabilities/:id', propertyAvailabilityController.updateAvailability);
router.get('/properties/:propertyId/availabilities', propertyAvailabilityController.getAvailabilities);

export default router;
