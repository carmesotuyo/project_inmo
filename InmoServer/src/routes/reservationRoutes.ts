import { Router } from 'express';
import { reservationController } from '../controllers';

const router = Router();

router.post('/reservations', reservationController.createReservation);
router.get('/reservations', reservationController.getReservation); //Get de inquilino
router.get('/reservations/adm', reservationController.getReservationsAdmin); // Get de admin
router.post('/reservations/cancel', reservationController.cancelReservation);
export default router;
