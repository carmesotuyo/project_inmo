import { NotificationRequest, NotificationResult } from '../../dtos/notificationRequest';

export interface NotificationService {
  notify(data: NotificationRequest): Promise<NotificationResult>;
}
