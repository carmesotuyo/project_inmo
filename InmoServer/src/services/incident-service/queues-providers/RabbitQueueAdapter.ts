import { Channel, connect, Connection } from 'amqplib';
import { IQueue } from '../../../interfaces/queues/IQueue';

export class RabbitMQQueueAdapter<T> implements IQueue<T> {
  private connection: Promise<Connection>;
  private channel: Promise<Channel>;
  private queueName: string;

  constructor(queueName: string) {
    this.queueName = queueName;
    // Establece la conexión con RabbitMQ. Aquí se asume que RabbitMQ corre en localhost.
    // Modifica la URL según sea necesario, incluyendo credenciales si es necesario.
    this.connection = connect('amqp://user:password@localhost');
    this.channel = this.connection.then((conn) => conn.createChannel());
    this.channel.then((ch) => ch.assertQueue(queueName));
  }

  async add(data: T): Promise<void> {
    const ch = await this.channel;
    ch.sendToQueue(this.queueName, Buffer.from(JSON.stringify(data)));
  }

  // Toma una función callback que define cómo se procesarán los mensajes.
  process(callback: (data: T) => Promise<void>): void {
    this.channel.then((ch) => {
      ch.consume(this.queueName, async (msg) => {
        if (msg !== null) {
          try {
            const data = JSON.parse(msg.content.toString()) as T;
            await callback(data);
            ch.ack(msg);
          } catch (error) {
            console.error('Error processing message:', error);
            ch.nack(msg);
          }
        }
      });
    });
  }
}
