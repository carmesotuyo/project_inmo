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
import { IncidentService } from '../incident-service/incidentService';
import { AuthController } from './authController';
import { UserService } from '../services/authService';
import { LogService } from '../services/logsService';
import { LogController } from './logsController';
import { NotificationServiceImpl } from '../notification-service/notificationService';
import { SignalController } from './signalController';

// Instanciar las implementaciones de los servicios
const queueService = new QueueServiceImpl();
const propertyService = new PropertyServiceImpl();
const propertyAvailabilityService = new PropertyAvailabilityServiceImpl();
const countryService = new CountryServiceImpl();
const reservationService = new ReservationServiceImpl(propertyAvailabilityService, countryService, propertyService);
const serviceTypeService = new ServiceTypeServiceImpl();
const sensorService = new SensorServiceImpl(serviceTypeService, propertyService);
const userService = new UserService();
const logService = new LogService();
const notificationService = new NotificationServiceImpl();
const incidentService = new IncidentService(sensorService, serviceTypeService, notificationService, propertyService, queueService);

// Inicializar las queues de escucha
incidentService.init();

// Instanciar el controlador con las implementaciones concretas de los servicios
export const propertyController = new PropertyController(propertyService, queueService);
export const reservationController = new ReservationController(reservationService, queueService);
export const countryController = new CountryController(countryService, queueService);
export const propertyAvailabilityController = new PropertyAvailabilityController(propertyAvailabilityService, queueService);
export const sensorController = new SensorController(sensorService, queueService);
export const serviceTypeController = new ServiceTypeController(serviceTypeService, queueService);
export const authController = new AuthController(userService);
export const logController = new LogController(logService);
export const signalController = new SignalController(incidentService);
