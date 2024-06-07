import { Router } from 'express';
import { reservationController } from '../controllers';

const router = Router();

router.post('/reservations', reservationController.createReservation);

export default router;
