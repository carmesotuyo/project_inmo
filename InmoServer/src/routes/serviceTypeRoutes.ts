import { Router } from 'express';
import { serviceTypeController } from '../controllers';

const router = Router();

router.post('/service-types', (req, res) => serviceTypeController.createServiceType(req, res));

export default router;
