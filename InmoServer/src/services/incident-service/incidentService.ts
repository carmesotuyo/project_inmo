import { Pipeline } from './pipeline/Pipeline';
import { QueueFactory } from './pipeline/QueueFactory';
import { Filters } from './filters/filters';
import dotenv from 'dotenv';
import { ServiceTypeService } from '../../interfaces/services/sensorServiceType';
import { SensorService } from '../../interfaces/services/sensorService';
import { NotificationService } from '../../interfaces/services/notificationService';
import { SensorData } from './types/sensorData';
import { PropertyService } from '../../interfaces/services/propertyService';
import { QueueService } from '../../interfaces/services/queueService';
import { SignalDocument } from '../../data-access/signal';
import { Signal } from '../../config/mongoConnections';
import { IncidentService } from '../../interfaces/services/incidentService';
import { connectRabbitMQ } from '../../config/queueConnections';

dotenv.config();

export class IncidentServiceImpl implements IncidentService {
  private pipeline: Pipeline<SensorData>;

  constructor(
    private sensorService: SensorService,
    private serviceType: ServiceTypeService,
    private notificationService: NotificationService,
    private propertyService: PropertyService,
    private queueService: QueueService,
  ) {
    const queueFactory = QueueFactory.getQueueFactory<SensorData>;
    const filtersInit = new Filters(this.sensorService, this.serviceType, this.notificationService, this.propertyService, this.queueService);
    this.pipeline = new Pipeline<SensorData>([filtersInit.verifyPropertyAndSensorExist, filtersInit.saveSignalToDB, filtersInit.validateValuesRange, filtersInit.validateAlertRange, filtersInit.notify], queueFactory);

    this.pipeline.on('finalOutput', this.handleFinalOutput);
    this.pipeline.on('errorInFilter', this.handleErrorInFilter);

    this.init();
  }

  async init() {
    this.connectToRabbitMQ();
  }

  private connectToRabbitMQ = async (retryCount = 0) => {
    const MAX_RETRIES = 5;
    try {
      const connection = await connectRabbitMQ();
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
    } catch (error: any) {
      console.error('Error connecting to RabbitMQ:', error.message);
      if (retryCount < MAX_RETRIES) {
        // Retry after a delay, with incrementing retry count
        const delay = 5000 * Math.pow(2, retryCount); // Exponential backoff
        setTimeout(() => this.connectToRabbitMQ(retryCount + 1), delay);
      } else {
        console.error(`Max retries (${MAX_RETRIES}) reached. Cannot connect to RabbitMQ.`);
      }
    }
  };

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

  async getSignals(): Promise<SignalDocument[]> {
    try {
      const signals = await Signal.find().sort({ dateTime: -1 }).exec();
      return signals;
    } catch (error: any) {
      throw new Error(`Error fetching signals: ${error.message}`);
    }
  }

  async createSignal(signalData: SignalDocument): Promise<SignalDocument> {
    try {
      const signal = new Signal(signalData);
      return await signal.save();
    } catch (error: any) {
      throw new Error(`Error saving signal: ${error.message}`);
    }
  }

  async getRecentSignalsForProperty(propertyId: string): Promise<SignalDocument[]> {
    try {
      const signals = await Signal.aggregate([
        {
          $addFields: {
            extractedPropertyId: {
              $cond: {
                if: { $regexMatch: { input: '$sensorId', regex: /^APP\./ } },
                then: { $arrayElemAt: [{ $split: ['$sensorId', '.'] }, 1] },
                else: { $arrayElemAt: [{ $split: ['$sensorId', '.'] }, 0] },
              },
            },
          },
        },
        { $match: { extractedPropertyId: propertyId } },
        { $sort: { sensorId: 1, dateTime: -1 } },
        {
          $project: {
            sensorId: 1,
            dateTime: 1,
            dynamicFields: {
              // es el tipo de señal recibida, el cual es dinamico
              $objectToArray: '$$ROOT',
            },
          },
        },
        { $unwind: '$dynamicFields' },
        {
          $match: {
            'dynamicFields.k': { $nin: ['_id', 'sensorId', 'dateTime', 'extractedPropertyId'] },
          },
        },
        {
          $group: {
            _id: { sensorId: '$sensorId', type: '$dynamicFields.k' },
            latestSignal: { $first: '$$ROOT' },
          },
        },
        { $replaceRoot: { newRoot: '$latestSignal' } },
        {
          $project: {
            sensorId: 1,
            dateTime: 1,
            type: '$dynamicFields.k',
            value: '$dynamicFields.v',
          },
        },
      ]).exec();

      const formattedSignals = signals.map((signal) => {
        const { sensorId, dateTime, type, value } = signal;
        return {
          sensorId,
          dateTime,
          [type]: value,
        } as SignalDocument;
      });

      return formattedSignals;
    } catch (error: any) {
      throw new Error(`Error fetching signals: ${error.message}`);
    }
  }
}
