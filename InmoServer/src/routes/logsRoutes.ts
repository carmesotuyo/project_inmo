import { Router } from 'express';
import { logController } from '../controllers/';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const { getLogs } = logController;

router.get('/logs', authMiddleware(['Administrador']), getLogs);

export default router;
