// Importa EventEmitter para permitir que nuestra clase emita eventos.
import { EventEmitter } from 'events';
// Importa la interfaz IQueue, que define los métodos que debe tener cualquier cola que usemos.
import { IQueue } from '../../../interfaces/queues/IQueue';

type FilterFunction<T> = (input: T) => Promise<T>;

// Declara la clase Pipeline, que extiende EventEmitter para poder emitir eventos.
export class Pipeline<T> extends EventEmitter {
  private filters: FilterFunction<T>[];
  private filterQueues: { filter: FilterFunction<T>; queue: IQueue<T> }[];

  constructor(filters: FilterFunction<T>[], queueFactory: (name: string) => IQueue<T>) {
    super(); // Llama al constructor de EventEmitter.
    this.filters = filters;
    this.filterQueues = [];
    this.setupQueues(queueFactory);
  }

  private setupQueues(queueFactory: (name: string) => IQueue<T>): void {
    this.filters.forEach((filter, index) => {
      const queueName = `filter-queue-${index}`;
      const filterQueue = queueFactory(queueName);
      this.filterQueues.push({ filter, queue: filterQueue });

      filterQueue.process(async (data: T) => {
        try {
          const filteredData = await filter(data);
          this.enqueueNextFilter(index, filteredData);
        } catch (err) {
          this.emit('errorInFilter', err, data);
        }
      });
    });
  }

  private enqueueNextFilter(currentFilterIndex: number, data: T): void {
    const nextFilter = this.filterQueues[currentFilterIndex + 1];
    if (nextFilter) {
      nextFilter.queue.add(data);
    } else {
      // Si no hay más filtros, emite un evento 'finalOutput' con los datos finales.
      this.emit('finalOutput', data);
    }
  }

  public async processInput(input: T): Promise<void> {
    if (this.filterQueues.length > 0) {
      await this.filterQueues[0].queue.add(input);
    }
  }
}
