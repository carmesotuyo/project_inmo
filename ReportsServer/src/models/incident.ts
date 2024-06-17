import mongoose, { Document, Schema } from 'mongoose';

export interface IIncident extends Document {
  propertyId: number;
  incident: string;
  date: Date;
}

const IncidentSchema: Schema = new Schema({
  propertyId: { type: Number, required: true },
  incident: { type: String, required: true },
  date: { type: Date, required: true },
});

export default mongoose.model<IIncident>('Incident', IncidentSchema);
