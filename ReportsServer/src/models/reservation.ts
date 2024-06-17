import mongoose, { Document, Schema } from 'mongoose';

interface Inquilino {
  document: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  address: string;
  nationality: string;
  country: string;
}

export interface IReservation extends Document {
  id: number;
  propertyId: number;
  startDate: Date;
  endDate: Date;
  status: string;
  adults: number;
  children: number;
  inquilino: Inquilino;
  amountPaid: number;
}

const InquilinoSchema: Schema = new Schema({
  document: { type: String, required: true },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true },
  phone_number: { type: String, required: true },
  address: { type: String, required: true },
  nationality: { type: String, required: true },
  country: { type: String, required: true }
});

const ReservationSchema: Schema = new Schema({
  id: { type: Number, required: true, unique: true },
  propertyId: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, required: true },
  adults: { type: Number, required: true },
  children: { type: Number, required: true },
  inquilino: { type: InquilinoSchema, required: true },
  amountPaid: { type: Number, required: true }
});

export default mongoose.model<IReservation>('Reservation', ReservationSchema);
