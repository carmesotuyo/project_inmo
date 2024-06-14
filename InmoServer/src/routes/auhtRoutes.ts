import { Router } from 'express';
import { auth } from 'express-openid-connect';
import { authController } from '../controllers';
import { authConfig } from '../config/authConfig';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();
const { login, callback } = authController;

router.use(auth(authConfig));
router.post('/login', login);
router.post('/register', authController.register);
router.get('/callback', callback);

export default router;
