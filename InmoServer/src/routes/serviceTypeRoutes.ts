import { Router } from 'express';
import { serviceTypeController } from '../controllers';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.post('/service-types',authMiddleware(['Administrador']), (req, res) => serviceTypeController.createServiceType(req, res));

export default router;
