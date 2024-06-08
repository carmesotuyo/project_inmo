import { Router } from 'express';
import { countryController } from '../controllers';

const router = Router();

router.post('/countries', countryController.createCountry);
router.put('/countries/:name', countryController.updateCountry);

export default router;
