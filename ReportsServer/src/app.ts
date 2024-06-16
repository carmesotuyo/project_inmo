import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Queue from 'bull';

console.log("Started Reports Server");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Conectarse a la misma cola que el productor
// TODO cambiar todo matches por reports o lo que sea:
const myQueue = new Queue('reports', 'redis://127.0.0.1:6378');

app.use(express.json());

console.log("process.env.MONGO_URI ", process.env.MONGO_URI);

// Usa la URI correcta para MongoDB
//TODO arreglar la lectura de la variable de entorno, no está leyendo el .env
const db = process.env.MONGO_URI || "mongodb://root:secret@localhost:27018/admin";

const connectDB = async () => {
  try {
    await mongoose.connect(db as string)
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const main = async () => {
  app.listen(PORT, async () => {
    console.log(`Server running on http://localhost:${PORT}`);

    try {
      connectDB();
    } catch (error) {
      console.error('Unable to connect to the database: ', error);
    }
  });
};
main();

// Procesar los trabajos en la cola
myQueue.process(async (job, done) => {
  try {
    console.log(`Processing job ${job.id}:`, job.data);
    // Procesa los datos recibidos de la cola
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
