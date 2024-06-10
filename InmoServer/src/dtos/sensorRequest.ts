export interface SensorRequest {
  id: string;
  description: string;
  seriesNumber?: string;
  brand: string;
  serviceAddress: string;
  lastCheckDate: string; // or Date
  serviceTypeId: number;
  observableProperties: object; // Better to define a proper type/interface
}
