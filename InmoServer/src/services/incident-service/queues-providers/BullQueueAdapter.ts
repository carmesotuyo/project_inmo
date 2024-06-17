import Bull, { Job, Queue as BullQueue } from 'bull';
import { IQueue } from '../../../interfaces/queues/IQueue';

export class BullQueueAdapter<T> implements IQueue<T> {
  private queue: BullQueue;

  constructor(queueName: string) {
    this.queue = new Bull(queueName);
  }

  async add(data: T): Promise<void> {
    await this.queue.add(data);
  }

  process(callback: (data: T) => Promise<void>): void {
    this.queue.process(async (job: Job) => {
      await callback(job.data);
    });
  }
}
