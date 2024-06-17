import express from 'express';
import dotenv from 'dotenv';
import connectDB from './conf/db';
import myQueue from './services/queueService';
import routes from './routes/routes';

console.log('Started Reports Server');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use('/api', routes);

const main = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

main();

myQueue;