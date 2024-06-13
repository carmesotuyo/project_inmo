import { Router } from 'express';
import { auth } from 'express-openid-connect';
import { authController } from '../controllers';
import { authConfig } from '../config/authConfig';

const router = Router();
const { login, callback } = authController;

router.use(auth(authConfig));
router.post('/login', login);
router.get('/callback', callback);

export default router;
