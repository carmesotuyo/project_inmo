import { Schema, model, Document } from 'mongoose';

export interface Signal {
  sensorId: string;
  dateTime: string;
  [key: string]: any;
}

const signalSchema = new Schema<SignalDocument>({
  sensorId: { type: String, required: true },
  dateTime: { type: String, required: true },
});

export interface SignalDocument extends Signal, Document {}

export default model<SignalDocument>('Signal', signalSchema);
