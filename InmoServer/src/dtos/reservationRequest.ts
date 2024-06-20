export interface ReservationRequest {
  address: string;
  nationality: string;
  country: string;
  propertyId: number;
  adults: number;
  children: number;
  startDate: string;
  endDate: string;
}

export interface Inquilino {
  document: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  address: string;
  nationality: string;
  country: string;
}
