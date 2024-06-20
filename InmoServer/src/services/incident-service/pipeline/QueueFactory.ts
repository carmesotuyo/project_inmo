import { BullQueueAdapter } from '../../../queues-providers/BullQueueAdapter';
import { RabbitMQQueueAdapter } from '../../../queues-providers/RabbitQueueAdapter';
import { IQueue } from '../../../interfaces/queues/IQueue';

export class QueueFactory {
  static getQueueFactory<T>(queueName: string): IQueue<T> {
    const queueType = process.env.QUEUE_TYPE;

    switch (queueType) {
      case 'BULL':
        return new BullQueueAdapter<T>(queueName);
      case 'RABBITMQ':
        return new RabbitMQQueueAdapter<T>(queueName);
      default:
        throw new Error(`Unsupported queue type: ${queueType}`);
    }
  }
}
