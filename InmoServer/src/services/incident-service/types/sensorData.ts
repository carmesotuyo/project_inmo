export interface SensorData {
  sensorId: string;
  dateTime: string;
  [key: string]: any;
  priority?: string;
  needsAlert?: boolean;
}

export interface DataToReport {
  propertyId: number;
  incident: string;
  date: Date;
}
