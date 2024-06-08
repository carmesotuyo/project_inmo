import { PropertyController } from './propertyController';
import { PropertyServiceImpl } from '../services/propertyService';
import { QueueServiceImpl } from '../services/queueService';

// Instanciar las implementaciones de los servicios
const propertyService = new PropertyServiceImpl();
const queueService = new QueueServiceImpl();

// Instanciar el controlador con las implementaciones concretas de los servicios
export const propertyController = new PropertyController(propertyService, queueService);

// Importar y configurar el ReservationController
import { ReservationController } from './reservationController';
import { ReservationServiceImpl } from '../services/reservationService';

// Instanciar las implementaciones de los servicios para Reservation
const reservationService = new ReservationServiceImpl();

// Instanciar el controlador con las implementaciones concretas de los servicios para Reservation
export const reservationController = new ReservationController(reservationService, queueService);