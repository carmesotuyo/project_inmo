// src/controllers/index.ts
import { PropertyController } from './propertyController';
import { propertyService } from '../services/propertyService';

export const propertyController = new PropertyController(propertyService);
