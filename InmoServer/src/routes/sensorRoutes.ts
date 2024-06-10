import { Router } from 'express';
import { sensorController } from '../controllers';

const router = Router();

router.post('/sensors', (req, res) => sensorController.createSensor(req, res));
router.put('/sensors/:id', (req, res) => sensorController.assignToProperty(req, res));

export default router;
