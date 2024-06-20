import { Router } from 'express';
import { reservationController } from '../controllers';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.post('/reservations', authMiddleware(), reservationController.createReservation); //todos
router.get('/reservations/adm', authMiddleware(['Administrador']), reservationController.getReservationsAdmin); // Get de admin
router.post('/reservations/cancel', reservationController.cancelReservation); // todos
router.post('/reservations/payment', authMiddleware(), reservationController.paymentCorrect); //todos
router.post('/reservations/aprove/:id', authMiddleware(['Administrador']), reservationController.aproveReservation); // Get de admin
router.get('/reservations/:id', authMiddleware(), reservationController.getReservation); //todos
export default router;
