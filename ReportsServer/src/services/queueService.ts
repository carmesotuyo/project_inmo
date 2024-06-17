import Queue from 'bull';
import { createProperty } from './propertyService';
import { createReservation } from './reservationService';
import { createIncident } from './incidentService';

const myQueue = new Queue('reports', 'redis://127.0.0.1:6378');

myQueue.process(async (job, done) => {
  try {
    console.log(`Processing job ${job.id}:`, job.data);
    const { type, data } = job.data;
    
    switch (type) {
      case 'property':
        await createProperty(data);
        break;
      case 'reservation':
        await createReservation(data);
        break;
      case 'incident':
        await createIncident(data);
        break;
      default:
        console.log('Unknown type');
    }
    
    done();
  } catch (error) {
    console.log(`Error processing job: ${error}`);
  }
});

myQueue.on('completed', (job) => {
  console.log(`Job ${job.id} has been completed`);
});

myQueue.on('failed', (job, err) => {
  console.log(`Job ${job.id} failed with error ${err.message}`);
});

export default myQueue;
