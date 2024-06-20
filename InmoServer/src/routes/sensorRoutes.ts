import { Router } from 'express';
import { sensorController } from '../controllers';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.post('/sensors',authMiddleware(['Administrador']), (req, res) => sensorController.createSensor(req, res));
router.post('/sensors/assign',authMiddleware(['Administrador']), (req, res) => sensorController.assignToProperty(req, res));
router.get('/sensors/:id/properties',authMiddleware(['Administrador']), (req, res) => sensorController.getObservableProperties(req, res));
router.put('/sensors/:id',authMiddleware(['Administrador']), (req, res) => sensorController.updateSensor(req, res));

export default router;
