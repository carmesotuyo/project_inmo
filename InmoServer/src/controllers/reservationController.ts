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

  public getReservation = async (req: Request, res: Response) => {
    try {
      const { email, reservationCode } = req.query;

      if (!email || !reservationCode) {
        res.status(400).json({ message: 'Email y código de reserva son requeridos' });
        return;
      }

      const reservation = await this.reservationService.getReservationByEmailAndCode(email as string, reservationCode as string);

      if (!reservation) {
        res.status(408).json({ message: 'Reserva no encontrada' });
        return;
      }

      res.status(200).json(reservation);
    } catch (error: any) {
      res.status(500).json({
        message: 'Error consultando la reserva',
        error: getErrorMessage(error),
      });
    }
  };
}
