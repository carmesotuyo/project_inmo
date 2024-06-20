import { Router } from 'express';
import { reservationController } from '../controllers';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.post('/reservations', authMiddleware(), reservationController.createReservation);
router.get('/reservations/adm', authMiddleware(['Administrador']), reservationController.getReservationsAdmin);
router.post('/reservations/cancel', reservationController.cancelReservation);
router.post('/reservations/payment/:id', authMiddleware(), reservationController.paymentCorrect);
router.post('/reservations/aprove/:id', authMiddleware(['Administrador']), reservationController.aproveReservation);
router.get('/reservations/:id', authMiddleware(), reservationController.getReservation);
export default router;
