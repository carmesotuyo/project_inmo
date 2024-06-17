import { NotificationRequest, NotificationResult } from '../../dtos/notificationRequest';
import { NotificationService } from '../../interfaces/services/notificationService';

export class NotificationServiceImpl implements NotificationService {
  notify(data: NotificationRequest): Promise<NotificationResult> {
    throw new Error('Method not implemented.');
  }
}
