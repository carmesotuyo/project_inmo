import nock from 'nock';
import { PaymentServiceImpl } from '../../services/payment-service/paymentService';

describe('PaymentServiceImpl', () => {
  let paymentService: PaymentServiceImpl;

  beforeAll(() => {
    paymentService = new PaymentServiceImpl();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('processPayment', () => {
    it('should return true when payment is processed successfully', async () => {
      const scope = nock('http://localhost:3000')
        .post('/payment')
        .reply(200, { message: 'Payment processed successfully' });

      const result = await paymentService.processPayment('test@example.com', 100);
      expect(result).toBe(true);
      scope.done();
    });

    it('should return false when payment processing fails', async () => {
      const scope = nock('http://localhost:3000')
        .post('/payment')
        .reply(500);

      const result = await paymentService.processPayment('test@example.com', 100);
      expect(result).toBe(false);
      scope.done();
    });
  });

  describe('processRefund', () => {
    it('should return true when refund is processed successfully', async () => {
      const scope = nock('http://localhost:3000')
        .post('/refund')
        .reply(200, { message: 'Refund processed successfully' });

      const result = await paymentService.processRefund('test@example.com', 50);
      expect(result).toBe(true);
      scope.done();
    });

    it('should return false when refund processing fails', async () => {
      const scope = nock('http://localhost:3000')
        .post('/refund')
        .reply(500);

      const result = await paymentService.processRefund('test@example.com', 50);
      expect(result).toBe(false);
      scope.done();
    });
  });
});
