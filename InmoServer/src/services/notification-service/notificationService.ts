import { NotificationRequest, NotificationResult } from '../../dtos/notificationRequest';
import { NotificationService } from '../../interfaces/services/notificationService';
import { connectRabbitMQ } from '../../config/queueConnections';
import logger from '../../config/logger';

export class NotificationServiceImpl implements NotificationService {
  async notify(notification: NotificationRequest): Promise<void> {
    try {
      const connection = await connectRabbitMQ();
      const channel = await connection.createChannel();
      const exchange = 'notifications';

      await channel.assertExchange(exchange, 'topic', { durable: true });

      const routingKey = `${notification.type}.${notification.priority}.${notification.propertyId}`;
      channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(notification)));

      logger.info(`Notification of type ${notification.type} and priority ${notification.priority} for property ${notification.propertyId} sent: ${notification.message}`);
      await channel.close();
    } catch (error: any) {
      console.error('Error connecting to RabbitMQ:', error.message);
    }
  }
}
