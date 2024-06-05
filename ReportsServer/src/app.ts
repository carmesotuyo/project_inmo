import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import * as matchController from "./controllers/matchController";
import Queue from 'bull';
import * as matchService from './services/matchService';

console.log("Started Reports Server");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
// Conectarse a la misma cola que el productor
// TODO cambiar todo matches por reports o lo que sea:
const myQueue = new Queue('reports', 'redis://127.0.0.1:6378');

app.use(express.json());

// TODO poner los controllers especificos:
app.get("/matches", matchController.getAllMatches);
app.get("/matches-grouped-by-month", matchController.getMatchesByMonth);

console.log("process.env.MONGO_URI ", process.env.MONGO_URI);
mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Procesar los trabajos en la cola
myQueue.process(async (job, done) => {
  try{
    console.log(`Processing job ${job.id}:`, job.data);
    matchService.createMatch(job.data.details.data);
    done();
  }catch(error){
    console.log(`Error in creating Match: ${error}`)
  }
});

myQueue.on('completed', (job) => {
  console.log(`Job ${job.id} has been completed`);
});

myQueue.on('failed', (job, err) => {
  console.log(`Job ${job.id} failed with error ${err.message}`);
});
