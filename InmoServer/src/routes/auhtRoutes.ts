import { Router } from 'express';
import { auth } from 'express-openid-connect';
import { login, callback } from '../controllers/authController';
import { authConfig } from '../config/authConfig';

const router = Router();

router.use(auth(authConfig));
router.post('/login', login);
router.get('/callback', callback);

export default router;
