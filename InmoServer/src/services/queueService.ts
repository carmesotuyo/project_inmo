import Queue from 'bull';
import { QueueService } from '../interfaces/services/queueService';

const myQueue = new Queue('reports', 'redis://127.0.0.1:6378');

export class QueueServiceImpl implements QueueService {
  async addJobToQueue(type: string, data: JSON): Promise<void> {
    try {
      console.log(`Data to be added to queue: ${type}`);
      const job = await myQueue.add({ 
        type: type, 
        data: data 
      });
      console.log(`Job added with ID: ${job.id}`);
    } catch (error) {
      console.error('Failed to add job to the queue:', error);
    }
  }
}
