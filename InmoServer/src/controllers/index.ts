// src/controllers/index.ts
import { PropertyController } from './propertyController';
import { propertyService } from '../services/propertyService';
import { queueService } from '../services/queueService';

export const propertyController = new PropertyController(propertyService, queueService);
