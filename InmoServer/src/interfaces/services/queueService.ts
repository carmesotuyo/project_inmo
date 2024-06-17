export interface QueueService {
  addJobToQueue(type: string, data: JSON): void;
}
