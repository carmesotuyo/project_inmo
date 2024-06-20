const amqplib = require('amqplib/callback_api');
require('dotenv').config();

const exchange = 'notifications';

amqplib.connect(
  {
    hostname: process.env.RABBITMQ_HOST || 'localhost',
    port: Number(process.env.RABBITMQ_PORT) || 5672,
    username: process.env.RABBITMQ_USER || 'guest',
    password: process.env.RABBITMQ_PASSWORD || 'guest',
  },
  (error0, connection) => {
    if (error0) {
      console.error('Failed to connect to RabbitMQ:', error0.message);
      return;
    }
    connection.createChannel((error1, channel) => {
      if (error1) {
        console.error('Failed to create channel:', error1.message);
        return;
      }

      channel.assertExchange(exchange, 'topic', { durable: true });

      channel.assertQueue('', { exclusive: true }, (error2, q) => {
        if (error2) {
          console.error('Failed to assert queue:', error2.message);
          return;
        }

        console.log(' [*] Waiting for logs. To exit press CTRL+C');

        // filtra por tipo Seguridad, de todas las prioridades, del inmueble con id 2
        // filtra por tipo Temperatura, prioridad baja, inmueble con id 3
        // const topics = ['Seguridad.*.2', 'Temperatura.Low.3'];

        // filtra por notificaciones del propio sistema, como son pagos, reservas y altas de inmuebles
        const topics = ['Payment.*.*', 'Booking.*.*', 'Property.*.*'];

        topics.forEach((topic) => {
          channel.bindQueue(q.queue, exchange, topic);
        });

        channel.consume(
          q.queue,
          (msg) => {
            if (msg.content) console.log(' [x] %s', msg.content.toString());
          },
          { noAck: true },
        );
      });
    });
  },
);
