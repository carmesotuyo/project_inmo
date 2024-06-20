export enum NotificationType {
  Booking = 'Booking',
  Payment = 'Payment',
  Property = 'Property',
}

export enum NotificationPriority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
}

export interface NotificationRequest {
  type: NotificationType | string;
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
