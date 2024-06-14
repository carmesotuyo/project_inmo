import { connect } from 'amqplib';
import { Pipeline } from './pipeline/Pipeline';
import { QueueFactory } from './pipeline/QueueFactory';
import { validateValuesRange, checkPriority, validateAlertRange, notify } from './filters/filters';
import dotenv from 'dotenv';

dotenv.config();

export class IncidentService {
  private pipeline: Pipeline<JSON>;

  constructor() {
    const queueFactory = QueueFactory.getQueueFactory<JSON>;
    this.pipeline = new Pipeline<JSON>([validateValuesRange, checkPriority, validateAlertRange, notify], queueFactory);

    this.pipeline.on('finalOutput', this.handleFinalOutput);
    this.pipeline.on('errorInFilter', this.handleErrorInFilter);

    this.init();
  }

  async init() {
    const connection = await connect({
      hostname: process.env.RABBITMQ_HOST,
      port: Number(process.env.RABBITMQ_PORT),
      username: process.env.RABBITMQ_USER,
      password: process.env.RABBITMQ_PASSWORD,
    });
    const channel = await connection.createChannel();
    const exchange = 'sensor_data_exchange';

    await channel.assertExchange(exchange, 'fanout', { durable: false });
    const q = await channel.assertQueue('', { exclusive: true });
    console.log(' [*] Waiting for messages in %s. To exit press CTRL+C', q.queue);
    channel.bindQueue(q.queue, exchange, '');

    channel.consume(
      q.queue,
      async (msg) => {
        if (msg) {
          const data = JSON.parse(msg.content.toString());
          this.pipeline.processInput(data);
        }
      },
      { noAck: true },
    );
  }

  private handleFinalOutput(output: any): void {
    console.log(`Successfully processed incident for ${output.sensorId} ${output.dateTime}`);
    console.log(`==========================================================`);
  }

  private handleErrorInFilter(error: any, data: any): void {
    const errorData = JSON.stringify(data, null, 2);
    console.error(`Failed to process ${data.sensorId} ${data.dateTime}`);
    console.error(`Error in filter: ${error}, Data: ${errorData}`);
    console.log(`==========================================================`);
  }
}
