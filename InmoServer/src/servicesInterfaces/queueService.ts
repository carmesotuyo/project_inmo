// src/servicesInterfaces/queueService.ts

export interface QueueService {
    addJobToQueue(data: JSON): void;
}
