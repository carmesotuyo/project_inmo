export class PaymentEmulation {
    static processPayment(): boolean {
        // Generar un número aleatorio para simular la aceptación o rechazo del pago
        const success = Math.random() > 0.1; // 90% de éxito
        return success;
    }
    static processRefund(): boolean {
        // Generar un número aleatorio para simular la aceptación o rechazo del pago
        const success = Math.random() > 0.1; // 90% de éxito
        return success;
    }
}