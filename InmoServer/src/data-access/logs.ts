import { Schema, model, Document } from 'mongoose';

export interface Log {
  message: string;
  level: string;
  timestamp: Date;
}

const logSchema = new Schema<LogDocument>({
  message: { type: String, required: true },
  level: { type: String, required: true },
  timestamp: { type: Date, required: true },
});

export interface LogDocument extends Log, Document {}

export default model<LogDocument>('Log', logSchema);
