import { Schema, Document } from 'mongoose';

interface Log {
  message: string;
  level: string;
  timestamp: Date;
}

export const logSchema = new Schema<LogDocument>({
  message: { type: String, required: true },
  level: { type: String, required: true },
  timestamp: { type: Date, required: true },
});

export interface LogDocument extends Log, Document {}
