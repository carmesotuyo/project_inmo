import { Schema, Document } from 'mongoose';

interface Signal {
  sensorId: string;
  dateTime: string;
  [key: string]: any;
}

export const signalSchema = new Schema<SignalDocument>(
  {
    sensorId: { type: String, required: true },
    dateTime: { type: String, required: true },
  },
  { strict: false },
);

export interface SignalDocument extends Signal, Document {}
