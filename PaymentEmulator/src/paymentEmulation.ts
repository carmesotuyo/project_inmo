import express from 'express';
const app = express();
const port = 3000;

class PaymentEmulation {
  static processPayment() {
    // Generar un número aleatorio para simular la aceptación o rechazo del pago
    const success = Math.random() > 0.1; // 90% de éxito
    return success;
  }

  static processRefund() {
    // Generar un número aleatorio para simular la aceptación o rechazo del reembolso
    const success = Math.random() > 0.1; // 90% de éxito
    return success;
  }
}

// Middleware para parsear JSON
app.use(express.json());

// Ruta para procesar pagos
app.post('/payment', (req, res) => {
  const success = PaymentEmulation.processPayment();
  if (success) {
    res.status(200).json({ message: 'Payment processed successfully' });
  } else {
    res.status(400).json({ message: 'Payment failed' });
  }
});

// Ruta para procesar reembolsos
app.post('/refund', (req, res) => {
  const success = PaymentEmulation.processRefund();
  if (success) {
    res.status(200).json({ message: 'Refund processed successfully' });
  } else {
    res.status(400).json({ message: 'Refund failed' });
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Payment emulation API running at http://localhost:${port}`);
});
