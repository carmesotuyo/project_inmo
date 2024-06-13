import { Router } from 'express';
// import * as propertyController from '../controllers/propertyController';
import { propertyController } from '../controllers';

const router = Router();

router.post('/properties', propertyController.createProperty);
router.get('/properties/search', (req, res) => propertyController.searchProperties(req, res));

export default router;
