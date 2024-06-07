import { ReservationRequest } from '../../dtos/reservationRequest';
import { Reservation } from '../../data-access/reservation';

export interface ReservationService {
    createReservation(reservationData: ReservationRequest): Promise<InstanceType<typeof Reservation>>;
  }

