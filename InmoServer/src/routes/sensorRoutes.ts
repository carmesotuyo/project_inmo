import { Router } from 'express';
import { sensorController } from '../controllers';

const router = Router();

router.post('/sensors', (req, res) => sensorController.createSensor(req, res));
router.post('/sensors/assign', (req, res) => sensorController.assignToProperty(req, res));
router.get('/sensors/:id/properties', (req, res) => sensorController.getObservableProperties(req, res));
router.put('/sensors/:id', (req, res) => sensorController.updateSensor(req, res));

export default router;
