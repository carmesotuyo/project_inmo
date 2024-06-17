import { QueueServiceImpl } from '../services/queue-service/queueService';
import { PropertyController } from './management-controllers/propertyController';
import { PropertyServiceImpl } from '../services/management-service/propertyService';
import { ReservationController } from './booking-controllers/reservationController';
import { ReservationServiceImpl } from '../services/booking-service/reservationService';
import { CountryController } from './management-controllers/countryController';
import { CountryServiceImpl } from '../services/management-service/countryService';
import { PropertyAvailabilityController } from './management-controllers/propertyAvailabilityController';
import { PropertyAvailabilityServiceImpl } from '../services/management-service/propertyAvailabilityService';
import { SensorController } from './management-controllers/sensorController';
import { SensorServiceImpl } from '../services/management-service/sensorService';
import { ServiceTypeController } from './management-controllers/sensorServiceTypeController';
import { ServiceTypeServiceImpl } from '../services/management-service/sensorServiceTypeService';
import { IncidentServiceImpl } from '../services/incident-service/incidentService';
import { AuthController } from './auth-controllers/authController';
import { UserService } from '../services/auth-service/authService';
import { PaymentServiceImpl } from '../services/payment-service/paymentService';
import { LogService } from '../services/log-service/logsService';
import { LogController } from './log-controllers/logsController';
import { NotificationServiceImpl } from '../services/notification-service/notificationService';
import { SignalController } from './incident-controllers/signalController';

// Instanciar las implementaciones de los servicios
const queueService = new QueueServiceImpl();
const propertyService = new PropertyServiceImpl();
const propertyAvailabilityService = new PropertyAvailabilityServiceImpl();
const countryService = new CountryServiceImpl();
const paymentService = new PaymentServiceImpl();
const reservationService = new ReservationServiceImpl(propertyAvailabilityService, countryService, propertyService, paymentService);
const serviceTypeService = new ServiceTypeServiceImpl();
const sensorService = new SensorServiceImpl(serviceTypeService, propertyService);
const userService = new UserService();
const logService = new LogService();
const notificationService = new NotificationServiceImpl();
const incidentService = new IncidentServiceImpl(sensorService, serviceTypeService, notificationService, propertyService, queueService);

// Inicializar las queues de escucha
incidentService.init();

// Instanciar el controlador con las implementaciones concretas de los servicios
export const propertyController = new PropertyController(propertyService, queueService);
export const reservationController = new ReservationController(reservationService, queueService);
export const countryController = new CountryController(countryService);
export const propertyAvailabilityController = new PropertyAvailabilityController(propertyAvailabilityService);
export const sensorController = new SensorController(sensorService);
export const serviceTypeController = new ServiceTypeController(serviceTypeService);
export const authController = new AuthController(userService);
export const logController = new LogController(logService);
export const signalController = new SignalController(incidentService);
