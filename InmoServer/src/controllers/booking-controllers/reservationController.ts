import { Request, Response } from 'express';
import { ReservationService } from '../../interfaces/services/reservationService';
import { QueueService } from '../../interfaces/services/queueService';
import { getErrorMessage } from '../../utils/handleError';
import logger from '../../config/logger';

export class ReservationController {
  constructor(
    private reservationService: ReservationService,
    private queueService: QueueService,
  ) {}

  public createReservation = async (req: any, res: Response) => {
    try {
      const reservation = await this.reservationService.createReservation(req.body, req.user.email); //Reservation request
      this.queueService.addJobToQueue('reservation', reservation.toJSON());
      logger.info(`Reservation created - code: ${reservation.get('reservationCode')}`);
      res.status(201).json(reservation);
    } catch (error: any) {
      logger.error('Error creating reservation', { error: getErrorMessage(error) });
      res.status(400).json({
        message: 'Error creating reservation',
        error: getErrorMessage(error),
      });
    }
  };

  public getReservation = async (req: any, res: Response) => {
    try {
      const reservationCode = req.params.id;
      const email = req.user.email;
      if (!email || !reservationCode) {
        res.status(400).json({ message: 'Email y código de reserva son requeridos' });
        return;
      }

      const reservation = await this.reservationService.getReservationByEmailAndCode(email as string, reservationCode as string);

      if (!reservation) {
        res.status(404).json({ message: 'Reserva no encontrada' });
        return;
      }
      logger.info(`Reservation fetched - code: ${reservation.get('reservationCode')}`);
      res.status(200).json(reservation);
    } catch (error: any) {
      logger.error('Error fetching reservation', { error: getErrorMessage(error) });
      res.status(500).json({
        message: 'Error consultando la reserva',
        error: getErrorMessage(error),
      });
    }
  };

  public cancelReservation = async (req: Request, res: Response) => {
    try {
      const { email, reservationCode } = req.body;

      if (!email || !reservationCode) {
        res.status(400).json({ message: 'Email y código de reserva son requeridos' });
        return;
      }

      const reservation = await this.reservationService.cancelReservation(email, reservationCode);
      logger.info(`Reservation canceled - code: ${reservation?.get('reservationCode')}`);
      res.status(200).json(reservation);
    } catch (error: any) {
      logger.error('Error canceling reservation', { error: getErrorMessage(error) });
      res.status(400).json({
        message: 'Error cancelando la reserva',
        error: getErrorMessage(error),
      });
    }
  };

  public getReservationsAdmin = async (req: Request, res: Response) => {
    try {
      const filters = req.query;
      console.log('filters de controller: =======');
      console.log(filters);
      const reservations = await this.reservationService.getReservationsAdmin(filters);
      logger.info(`Reservations fetched - filters: ${JSON.stringify(filters)}`);
      res.status(200).json(reservations);
    } catch (error: any) {
      logger.error('Error fetching reservations', { error: getErrorMessage(error) });
      res.status(500).json({
        message: 'Error consultando las reservas',
        error: getErrorMessage(error),
      });
    }
  };

  public paymentCorrect = async (req: Request, res: Response) => {
    try {
      const { reservationId, email, totalPaid } = req.body;

      if (!reservationId || !email || totalPaid == null) {
        res.status(400).json({ message: 'Reservation ID, email y total pagado son requeridos' });
        return;
      }

      await this.reservationService.paymentCorrect(reservationId, email, totalPaid);
      logger.info(`Payment processed - reservationId: ${reservationId}`);
      res.status(200).json({ message: 'Pago procesado correctamente' });
    } catch (error: any) {
      logger.error('Error processing payment', { error: getErrorMessage(error) });
      res.status(400).json({
        message: 'Error procesando el pago',
        error: getErrorMessage(error),
      });
    }
  };

  public aproveReservation = async (req: Request, res: Response) => {
    try {
      const reservationId = Number(req.params.id); // Convert the reservationId to a number
      const aprove = req.query.aprove;

      if (!reservationId) {
        res.status(400).json({ message: 'Reservation ID es requerido' });
        return;
      }

      const aproveRes = await this.reservationService.aproveReservation(reservationId, aprove as string);
      logger.info(`Reservation aprobada - reservationId: ${reservationId}`);
      res.status(200).json(aproveRes);
    } catch (error: any) {
      logger.error('Error aprobando la reserva', { error: getErrorMessage(error) });
      res.status(400).json({
        message: 'Error aprobando la reserva',
        error: getErrorMessage(error),
      });
    }
  };
}
