export interface PaymentService {
  processPayment(email: string, amountToPay: number): Promise<boolean>;
  processRefund(email: string, amount: number): Promise<boolean>;
  sendPaymentConfirmationEmails(email: string, amountPaid: number): Promise<void>;
  sendRefundConfirmationEmails(email: string, amountRefunded: number): Promise<void>;
}
