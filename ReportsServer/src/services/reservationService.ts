import Reservation, { IReservation } from '../models/reservation';

export const createReservation = async (data: IReservation): Promise<IReservation> => {
  const reservation = new Reservation(data);
  return await reservation.save();
};