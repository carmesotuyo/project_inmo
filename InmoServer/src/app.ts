import { sequelize, dbSync } from './config/database';
import mongoose from 'mongoose';
import express from 'express';
import bodyParser from 'body-parser';
import authRoutes from './routes/auhtRoutes';
import propertyRoutes from './routes/propertyRoutes';
import reservationRoutes from './routes/reservationRoutes';
import countryRoutes from './routes/countryRoutes';
import propertyAvailabilityRoutes from './routes/propertyAvailabilityRoutes';
import sensorRoutes from './routes/sensorRoutes';
import serviceTypeRoutes from './routes/serviceTypeRoutes';
import logRoutes from './routes/logsRoutes';
import logger from './config/logger';
import signalRoutes from './routes/signalRoutes';

const app = express();
app.use(express.json());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3002;

app.use('/api', authRoutes);
app.use('/api', propertyRoutes);
app.use('/api', reservationRoutes);
app.use('/api', countryRoutes);
app.use('/api', propertyAvailabilityRoutes);
app.use('/api', sensorRoutes);
app.use('/api', serviceTypeRoutes);
app.use('/api', logRoutes);
app.use('/api', signalRoutes);

const connectDB = async () => {
  try {
    const signalsDB = mongoose.createConnection(process.env.SIGNALS_MONGO_URI as string);
    const logsDB = mongoose.createConnection(process.env.LOGS_MONGO_URI as string);
    logsDB.on('connected', () => {
      console.log('Logs MongoDB connected');
      logger.info('Logs MongoDB connected');
    });
    signalsDB.on('connected', () => {
      console.log('Signals MongoDB connected');
      logger.info('Signals MongoDB connected');
    });

    logsDB.on('error', (err) => console.log('Logs MongoDB error: ' + err));
    signalsDB.on('error', (err) => console.log('Signals MongoDB error: ' + err));
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const main = async () => {
  app.listen(PORT, async () => {
    console.log(`Server running on http://localhost:${PORT}`);

    try {
      await sequelize.authenticate();
      console.log('Connection has been established successfully.');
      await dbSync(); // Llama a la función de sincronización después de la autenticación
      await connectDB();
    } catch (error) {
      console.error('Unable to connect to the database: ', error);
    }
  });
};
main();
