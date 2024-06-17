import mongoose, { Document, Schema } from 'mongoose';

export interface IProperty extends Document {
  id: number;
  name: string;
  numberOfAdults: number;
  numberOfKids: number;
  numberOfDoubleBeds: number;
  numberOfSingleBeds: number;
  airConditioning: boolean;
  wifi: boolean;
  garage: boolean;
  houseOrApartment: string;
  mtsToTheBeach: number;
  countryId: string;
  stateOrProvince: string;
  district: string;
  neighborhood: string;
  images: string;
  pricePerNight: number;
  status: string;
}

const PropertySchema: Schema = new Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  numberOfAdults: { type: Number, required: true },
  numberOfKids: { type: Number, required: true },
  numberOfDoubleBeds: { type: Number, required: true },
  numberOfSingleBeds: { type: Number, required: true },
  airConditioning: { type: Boolean, required: true },
  wifi: { type: Boolean, required: true },
  garage: { type: Boolean, required: true },
  houseOrApartment: { type: String, required: true },
  mtsToTheBeach: { type: Number, required: true },
  countryId: { type: String, required: true },
  stateOrProvince: { type: String, required: true },
  district: { type: String, required: true },
  neighborhood: { type: String, required: true },
  images: { type: String, required: true },
  pricePerNight: { type: Number, required: true },
  status: { type: String, required: true }
});

export default mongoose.model<IProperty>('Property', PropertySchema);
