import axios from 'axios';
import { PaymentService } from '../../interfaces/services/paymentService';

export class PaymentServiceImpl implements PaymentService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = 'http://localhost:3000';
  }

  async processPayment(email: string, amountToPay: number): Promise<boolean> {
    try {
      const response = await axios.post(`${this.baseUrl}/process-payment`);
      const paymentSuccess = response.data.message === 'Payment processed successfully';

      return paymentSuccess;
    } catch (error) {
      console.error('Error processing payment:', error);
      return false;
    }
  }

  async processRefund(email: string, amount: number): Promise<boolean> {
    try {
      const response = await axios.post(`${this.baseUrl}/process-refund`);
      const refundSuccess = response.data.message === 'Refund processed successfully';

      return refundSuccess;
    } catch (error) {
      console.error('Error processing refund:', error);
      return false;
    }
  }
}
