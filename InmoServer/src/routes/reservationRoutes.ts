import { Router } from 'express';
import { reservationController } from '../controllers';

const router = Router();

router.post('/reservations', reservationController.createReservation);
router.get('/reservations', reservationController.getReservation);
router.post('/reservations/cancel', reservationController.cancelReservation);
export default router;
