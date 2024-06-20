import { Router } from 'express';
import { countryController } from '../controllers';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.post('/countries',authMiddleware(['Administrador']), countryController.createCountry);
router.put('/countries/:name', authMiddleware(['Administrador']), countryController.updateCountry);

export default router;
