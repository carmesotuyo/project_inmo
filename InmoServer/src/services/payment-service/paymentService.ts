import { PaymentEmulation } from '../../../../PaymentEmulator/src/paymentEmulation';
import { PaymentService } from '../../interfaces/services/paymentService';

export class PaymentServiceImpl implements PaymentService {
  async processPayment(email: string, amountToPay: number): Promise<boolean> {
    const paymentSuccess = PaymentEmulation.processPayment();

    if (paymentSuccess) {
      // Actualizar el estado de la reserva
      this.sendPaymentConfirmationEmails(email, amountToPay); // llamar servicio de notifiaciones
    }
    return paymentSuccess;
  }

  async processRefund(email: string, amount: number): Promise<boolean> {
    const refundSuccess = PaymentEmulation.processRefund();
    if (refundSuccess) {
      this.sendRefundConfirmationEmails(email, amount); // llamar servicio de notifiaciones
    }
    return refundSuccess;
  }

  async sendPaymentConfirmationEmails(email: string, amountPaid: number): Promise<void> {
    // Lógica para enviar correos electrónicos
    // Aquí puedes implementar el envío de correos utilizando nodemailer u otro servicio
  }
  async sendRefundConfirmationEmails(email: string, amountRefunded: number): Promise<void> {
    // Lógica para enviar correos electrónicos
    // Aquí puedes implementar el envío de correos utilizando nodemailer u otro servicio
  }
}
``;
