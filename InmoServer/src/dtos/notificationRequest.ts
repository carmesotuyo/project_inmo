export enum NotificationType {
  SensorSignal = 'Sensor signal',
  AppIncident = 'App incident',
  Booking = 'Booking',
  Payment = 'Payment',
  Property = 'Property',
} //son ejemplos, editarlos segun lo que precisemos

export enum NotificationPriority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
}

export interface NotificationRequest {
  type: NotificationType;
  propertyId: number;
  priority: NotificationPriority;
  message: string;
}
export interface NotificationResult {
  success: boolean;
  messageId?: string;
  statusCode?: string;
  statusMessage?: string;
  error?: string;
}
