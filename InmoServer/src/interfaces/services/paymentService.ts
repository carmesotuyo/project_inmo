export interface PaymentService {
  processPayment(email: string, amountToPay: number): Promise<boolean>;
  processRefund(email: string, amount: number): Promise<boolean>;
  sendPaymentConfirmationNotifications(email: string, amountPaid: number): Promise<void>;
  sendRefundConfirmationNotifications(email: string, amountRefunded: number): Promise<void>;
}
