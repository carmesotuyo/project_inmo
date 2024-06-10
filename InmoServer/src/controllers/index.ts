import { QueueServiceImpl } from '../services/queueService';
import { PropertyController } from './propertyController';
import { PropertyServiceImpl } from '../services/propertyService';
import { ReservationController } from './reservationController';
import { ReservationServiceImpl } from '../services/reservationService';
import { CountryController } from './countryController';
import { CountryServiceImpl } from '../services/countryService';
import { PropertyAvailabilityController } from './propertyAvailabilityController';
import { PropertyAvailabilityServiceImpl } from '../services/propertyAvailabilityService';
import { SensorController } from './sensorController';
import { SensorServiceImpl } from '../services/sensorService';
import { ServiceTypeController } from './sensorServiceTypeController';
import { ServiceTypeServiceImpl } from '../services/sensorServiceTypeService';

// Instanciar las implementaciones de los servicios
const queueService = new QueueServiceImpl();
const propertyService = new PropertyServiceImpl();
const propertyAvailabilityService = new PropertyAvailabilityServiceImpl();
const reservationService = new ReservationServiceImpl(propertyAvailabilityService);
const countryService = new CountryServiceImpl();
const sensorService = new SensorServiceImpl();
const serviceTypeService = new ServiceTypeServiceImpl();

// Instanciar el controlador con las implementaciones concretas de los servicios
export const propertyController = new PropertyController(propertyService, queueService);
export const reservationController = new ReservationController(reservationService, queueService);
export const countryController = new CountryController(countryService, queueService);
export const propertyAvailabilityController = new PropertyAvailabilityController(propertyAvailabilityService, queueService);
export const sensorController = new SensorController(sensorService, queueService);
export const serviceTypeController = new ServiceTypeController(serviceTypeService, queueService);
