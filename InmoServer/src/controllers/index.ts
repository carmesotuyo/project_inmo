import { PropertyController } from './propertyController';
import { PropertyServiceImpl } from '../services/propertyServiceImpl';
import { QueueServiceImpl } from '../services/queueServiceImpl';

// Instanciar las implementaciones de los servicios
const propertyService = new PropertyServiceImpl();
const queueService = new QueueServiceImpl();

// Instanciar el controlador con las implementaciones concretas de los servicios
export const propertyController = new PropertyController(propertyService, queueService);

