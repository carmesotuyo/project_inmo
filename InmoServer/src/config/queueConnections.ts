import amqp, { Connection } from 'amqplib';

let connection: Connection | null = null;

export const connectRabbitMQ = async (): Promise<Connection> => {
  if (!connection) {
    connection = await amqp.connect({
      hostname: process.env.RABBITMQ_HOST || 'localhost',
      port: Number(process.env.RABBITMQ_PORT) || 5672,
      username: process.env.RABBITMQ_USER || 'guest',
      password: process.env.RABBITMQ_PASSWORD || 'guest',
    });
  }
  return connection;
};
