import { Router } from 'express';
import { reservationController } from '../controllers';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.post('/reservations',authMiddleware(), reservationController.createReservation); //todos
router.get('/reservations/:id', authMiddleware(), reservationController.getReservation); //todos
router.get('/reservations/adm', authMiddleware(['Administrador']), reservationController.getReservationsAdmin); // Get de admin
router.post('/reservations/cancel', reservationController.cancelReservation); // todos
export default router;
