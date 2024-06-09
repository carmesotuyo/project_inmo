import { QueueServiceImpl } from '../services/queueService';
import { PropertyController } from './propertyController';
import { PropertyServiceImpl } from '../services/propertyService';
import { ReservationController } from './reservationController';
import { ReservationServiceImpl } from '../services/reservationService';
import { CountryController } from './countryController';
import { CountryServiceImpl } from '../services/countryService';
import { PropertyAvailabilityController } from './propertyAvailabilityController';
import { PropertyAvailabilityServiceImpl } from '../services/propertyAvailabilityService';

// Instanciar las implementaciones de los servicios
const queueService = new QueueServiceImpl();
const propertyService = new PropertyServiceImpl();
const reservationService = new ReservationServiceImpl();
const countryService = new CountryServiceImpl();
const propertyAvailabilityService = new PropertyAvailabilityServiceImpl();

// Instanciar el controlador con las implementaciones concretas de los servicios
export const propertyController = new PropertyController(propertyService, queueService);
export const reservationController = new ReservationController(reservationService, queueService);
export const countryController = new CountryController(countryService, queueService);
export const propertyAvailabilityController = new PropertyAvailabilityController(propertyAvailabilityService, queueService);
