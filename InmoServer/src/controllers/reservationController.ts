import { Request, Response } from 'express';
import { ReservationService } from '../interfaces/services/reservationService';
import { QueueService } from '../interfaces/services/queueService';
import { getErrorMessage } from '../utils/handleError';

export class ReservationController {
    constructor(
      private reservationService: ReservationService,
      private queueService: QueueService,
    ) {}
  
    public createReservation = async (req: Request, res: Response) => {
        try {
          const reservation = await this.reservationService.createReservation(req.body); //Reservation request
          this.queueService.addJobToQueue(reservation.toJSON());
          res.status(201).json(reservation);
        } catch (error: any) {
          res.status(400).json({
            message: 'Error creating reservation',
            error: getErrorMessage(error),
          });
        }
      };
}