import { ReservationRequest } from '../../dtos/reservationRequest';
import { Reservation } from '../../data-access/reservation';

export interface ReservationService {
  createReservation(reservationData: ReservationRequest): Promise<InstanceType<typeof Reservation>>;
  getReservationByEmailAndCode(email: string, reservationCode: string): Promise<InstanceType<typeof Reservation> | null>;
  cancelReservation(email: string, reservationCode: string): Promise<InstanceType<typeof Reservation> | null>;
}
