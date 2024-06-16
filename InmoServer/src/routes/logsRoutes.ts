import { Router } from 'express';
import { logController } from '../controllers/';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();
const { getLogs } = logController;

router.get('/logs', authenticateJWT(["Administrador"]), getLogs);

export default router;
