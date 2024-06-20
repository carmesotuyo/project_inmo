import { ReservationRequest } from '../../dtos/reservationRequest';
import { Reservation } from '../../data-access/reservation';
import { ReservationFilterOptions } from '../../utils/reservationFilters';

export interface ReservationService {
  createReservation(reservationData: ReservationRequest, email: string): Promise<InstanceType<typeof Reservation>>;
  getReservationByEmailAndCode(email: string, reservationCode: string): Promise<InstanceType<typeof Reservation> | null>;
  cancelReservation(email: string, reservationCode: string): Promise<InstanceType<typeof Reservation> | null>;
  getReservationsAdmin(filters: ReservationFilterOptions): Promise<InstanceType<typeof Reservation>[]>;
  processPayment(reservationId: number): Promise<void>;
  aproveReservation(reservationId: number, aprove: string): Promise<InstanceType<typeof String>>;
}
