import { Router } from 'express';
import { propertyController } from '../controllers';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.post('/properties', authMiddleware(['Propietario']), propertyController.createProperty);
router.get('/properties/search', (req, res) => propertyController.searchProperties(req, res));
router.get('/properties', authMiddleware(['Administrador']), (req, res) => propertyController.getAllProperties(req, res));
router.post('/properties/:id/payment', authMiddleware(['Propietario']), (req, res) => propertyController.payProperty(req, res));

export default router;
