import { ReservationServiceImpl } from './reservationService'; // Ajusta la ruta según tu estructura de proyecto
import { PropertyAvailabilityService } from '../../interfaces/services/propertyAvailabilityService';
import { CountryService } from '../../interfaces/services/countryService';
import { PropertyService } from '../../interfaces/services/propertyService';
import { PaymentService } from '../../interfaces/services/paymentService';
import { NotificationService } from '../../interfaces/services/notificationService';
import { ReservationRequest } from '../../dtos/reservationRequest';
import { Reservation } from '../../data-access/reservation';
import { Property } from '../../data-access/property';
import { User } from '../../data-access/user';
import { PaymentServiceImpl } from '../payment-service/paymentService';
import { PropertyAvailabilityServiceImpl } from '../management-service/propertyAvailabilityService';
import { CountryServiceImpl } from '../management-service/countryService';
import { PropertyServiceImpl } from '../management-service/propertyService';
import { NotificationServiceImpl } from '../notification-service/notificationService';
import CacheModule from '../../cache/cacheModule';
import { ReservationService } from '../../interfaces/services/reservationService';

jest.mock('../../data-access/reservation');
jest.mock('../../data-access/property');
jest.mock('../../data-access/user');
jest.mock('../../interfaces/services/propertyAvailabilityService');
jest.mock('../../interfaces/services/countryService');
jest.mock('../../interfaces/services/propertyService');
jest.mock('../../interfaces/services/paymentService');
jest.mock('../../interfaces/services/notificationService');

describe('ReservationServiceImpl', () => {
  let reservationService: ReservationServiceImpl;
  let mockPropertyAvailabilityService: jest.Mocked<PropertyAvailabilityService>;
  let mockCountryService: jest.Mocked<CountryService>;
  let mockPropertyService: jest.Mocked<PropertyService>;
  let mockPaymentService: jest.Mocked<PaymentService>;
  let mockNotificationService: jest.Mocked<NotificationService>;
  let mockCacheModule: jest.Mocked<CacheModule>;

  beforeEach(() => {
    mockPropertyAvailabilityService = new PropertyAvailabilityServiceImpl() as jest.Mocked<PropertyAvailabilityServiceImpl>;
    mockCountryService = new CountryServiceImpl() as jest.Mocked<CountryServiceImpl>;
    mockPaymentService = new PaymentServiceImpl() as jest.Mocked<PaymentServiceImpl>;
    mockNotificationService = new NotificationServiceImpl() as jest.Mocked<NotificationServiceImpl>;
    mockCacheModule = new CacheModule() as jest.Mocked<CacheModule>;
    mockPropertyService = new PropertyServiceImpl(mockPaymentService, mockCacheModule, mockNotificationService) as jest.Mocked<PropertyServiceImpl>;

    reservationService = new ReservationServiceImpl(
      mockPropertyAvailabilityService,
      mockCountryService,
      mockPropertyService,
      mockPaymentService,
      mockNotificationService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createReservation', () => {
    it('should create a reservation successfully', async () => {
      const data: ReservationRequest = {
        propertyId: 1,
        adults: 2,
        children: 1,
        startDate: '2024-07-01',
        endDate: '2024-07-10',
        address: '123 Main St',
        nationality: 'US',
        country: 'USA',
      };

      const user = {
        document: '12345678',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone_number: '123-456-7890',
        address: '123 Main St',
        nationality: 'US',
        country: 'USA',
      };

      (User.findByPk as jest.Mock).mockResolvedValue(user);
      const property = { get: jest.fn().mockReturnValue(100) } as unknown as InstanceType<typeof Property>;
      (Property.findByPk as jest.Mock).mockResolvedValue(property);
      (Reservation.create as jest.Mock).mockResolvedValue({ get: jest.fn().mockReturnValue(1) });
      mockPropertyAvailabilityService.adjustPropertyAvailabilityFromReservationDates.mockResolvedValue(undefined);
      mockNotificationService.notify.mockResolvedValue();

      const result = await reservationService.createReservation(data, 'john.doe@example.com');
      expect(result).toBeDefined();
      expect(User.findByPk).toHaveBeenCalledWith('john.doe@example.com');
      expect(Property.findByPk).toHaveBeenCalledWith(data.propertyId);
      expect(Reservation.create).toHaveBeenCalled();
      expect(mockNotificationService.notify).toHaveBeenCalled();
    });

    it('should throw an error if user not found', async () => {
      (User.findByPk as jest.Mock).mockResolvedValue(null);

      const data: ReservationRequest = {
        propertyId: 1,
        adults: 2,
        children: 1,
        startDate: '2024-07-01',
        endDate: '2024-07-10',
        address: '123 Main St',
        nationality: 'US',
        country: 'USA',
      };

      await expect(reservationService.createReservation(data, 'john.doe@example.com')).rejects.toThrow('Usuario no encontrado');
    });
  });

  describe('getReservationByEmailAndCode', () => {
    it('should return a reservation', async () => {
      const reservation = { id: '1', inquilino: { email: 'john.doe@example.com' } };
      (Reservation.findOne as jest.Mock).mockResolvedValue(reservation);

      const result = await reservationService.getReservationByEmailAndCode('john.doe@example.com', '1');
      expect(result).toEqual(reservation);
      expect(Reservation.findOne).toHaveBeenCalledWith({ where: { id: '1', 'inquilino.email': 'john.doe@example.com' } });
    });

    it('should return null if reservation not found', async () => {
      (Reservation.findOne as jest.Mock).mockResolvedValue(null);

      const result = await reservationService.getReservationByEmailAndCode('john.doe@example.com', '1');
      expect(result).toBeNull();
    });
  });

  describe('cancelReservation', () => {
    it('should cancel the reservation and process refund', async () => {
      const reservation = {
        get: jest.fn().mockImplementation((key: string) => {
          if (key === 'startDate') return new Date(Date.now() + 86400000 * 10); // 10 days from now
          if (key === 'amountPaid') return 1000;
          if (key === 'propertyId') return 1;
          if (key === 'inquilino.email') return 'john.doe@example.com';
        }),
        set: jest.fn(),
        save: jest.fn(),
      };

      (reservationService.getReservationByEmailAndCode as jest.Mock).mockResolvedValue(reservation);
      (reservationService.getPropertyService().getPropertyByID as jest.Mock).mockResolvedValue({ get: jest.fn().mockReturnValue('USA') });
      (reservationService.getCountryService().getRefundPolicyByCountry as jest.Mock).mockResolvedValue({ refundDays: 5, refundPercentage: 50 });
      mockPaymentService.processRefund.mockResolvedValue(true);
      //mockPropertyAvailabilityService.createAvailability.mockResolvedValue(undefined);

      const result = await reservationService.cancelReservation('john.doe@example.com', '1');
      expect(result).toBeDefined();
      expect(reservation.set).toHaveBeenCalled();
      expect(reservation.save).toHaveBeenCalled();
      expect(mockPaymentService.processRefund).toHaveBeenCalledWith('john.doe@example.com', 500);
    });

    it('should throw an error if reservation not found', async () => {
      (reservationService.getReservationByEmailAndCode as jest.Mock).mockResolvedValue(null);

      await expect(reservationService.cancelReservation('john.doe@example.com', '1')).rejects.toThrow('Reserva no encontrada');
    });
  });

  describe('processPayment', () => {
    it('should process the payment successfully', async () => {
      const reservation = {
        get: jest.fn().mockImplementation((key: string) => {
          if (key === 'status') return 'Confirmed';
          if (key === 'propertyId') return 1;
          if (key === 'amountPaid') return 1000;
          if (key === 'inquilino.email') return 'john.doe@example.com';
        }),
      };

      (Reservation.findByPk as jest.Mock).mockResolvedValue(reservation);
      mockPaymentService.processPayment.mockResolvedValue(true);
      (Reservation.update as jest.Mock).mockResolvedValue([1, [reservation]]);
      mockNotificationService.notify.mockResolvedValue();

      await reservationService.processPayment(1);
      expect(Reservation.findByPk).toHaveBeenCalledWith(1);
      expect(mockPaymentService.processPayment).toHaveBeenCalledWith('john.doe@example.com', 1000);
      expect(Reservation.update).toHaveBeenCalledWith({ status: 'Paid' }, { where: { id: 1 } });
      expect(mockNotificationService.notify).toHaveBeenCalled();
    });

    it('should throw an error if reservation not found', async () => {
      (Reservation.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(reservationService.processPayment(1)).rejects.toThrow('Reserva no encontrada');
    });
  });

  describe('aproveReservation', () => {
    it('should approve the reservation', async () => {
      const reservation = {
        get: jest.fn().mockReturnValue('Pending Approval'),
        set: jest.fn(),
        save: jest.fn(),
      };

      (Reservation.findByPk as jest.Mock).mockResolvedValue(reservation);

      const result = await reservationService.aproveReservation(1, 'true');
      expect(result).toBe('La reserva ha sido aprobada correctamente');
      expect(reservation.set).toHaveBeenCalledWith('status', 'Approved');
      expect(reservation.save).toHaveBeenCalled();
    });

    it('should reject the reservation', async () => {
      const reservation = {
        get: jest.fn().mockReturnValue('Pending Approval'),
        set: jest.fn(),
        save: jest.fn(),
      };

      (Reservation.findByPk as jest.Mock).mockResolvedValue(reservation);

      const result = await reservationService.aproveReservation(1, 'false');
      expect(result).toBe('La reserva ha sido rechazada correctamente');
      expect(reservation.set).toHaveBeenCalledWith('status', 'Rejected');
      expect(reservation.save).toHaveBeenCalled();
    });

    it('should throw an error if reservation not found', async () => {
      (Reservation.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(reservationService.aproveReservation(1, 'true')).rejects.toThrow('Reserva no encontrada');
    });

    it('should throw an error if reservation is not pending approval', async () => {
      const reservation = {
        get: jest.fn().mockReturnValue('Confirmed'),
      };

      (Reservation.findByPk as jest.Mock).mockResolvedValue(reservation);

      await expect(reservationService.aproveReservation(1, 'true')).rejects.toThrow('La reserva no está pendiente de aprobación');
    });
  });
});
