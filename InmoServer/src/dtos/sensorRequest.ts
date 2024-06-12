export interface SensorRequest {
  id: string;
  description: string;
  seriesNumber?: string;
  brand: string;
  serviceAddress: string;
  lastCheckDate: string; // or Date
  serviceTypeId: number;
  observableProperties: JSON;
}
export interface SensorUpdateRequest {
  description?: string;
  seriesNumber?: string;
  brand?: string;
  serviceAddress?: string;
  lastCheckDate?: string; // or Date
  serviceTypeId?: number;
  observableProperties?: JSON;
}
