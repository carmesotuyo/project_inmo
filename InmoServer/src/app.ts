import { sequelize, dbSync } from './config/database';
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
import signalRoutes from './routes/signalRoutes';
import { connectLogsDB, connectSignalsDB } from './config/mongoConnections';

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

const main = async () => {
  app.listen(PORT, async () => {
    console.log(`Server running on http://localhost:${PORT}`);

    try {
      await sequelize.authenticate();
      console.log('Connection has been established successfully.');
      await dbSync(); // Llama a la función de sincronización después de la autenticación
      await connectLogsDB();
      await connectSignalsDB();
    } catch (error) {
      console.error('Unable to connect to the database: ', error);
    }
  });
};
main();
