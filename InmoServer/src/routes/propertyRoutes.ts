import { Router } from 'express';
import { propertyController } from '../controllers';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.post('/properties', authMiddleware(['Propietario']), propertyController.createProperty); // propietario
router.get('/properties/search', authMiddleware(), (req, res) => propertyController.searchProperties(req, res)); //todos
router.get('/properties', authMiddleware(['Administrador']), (req, res) => propertyController.getAllProperties(req, res)); // admin
router.post('/properties/:id/payment', authMiddleware(['Propietario']), (req, res) => propertyController.payProperty(req, res)); //propietario

export default router;
