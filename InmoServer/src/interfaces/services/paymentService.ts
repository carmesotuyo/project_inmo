export interface PaymentService {
  processPayment(email: string, amountToPay: number): Promise<boolean>;
  processRefund(email: string, amount: number): Promise<boolean>;
}
