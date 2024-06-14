import winston from 'winston';
import 'winston-mongodb';
import dotenv from 'dotenv';

dotenv.config();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.MongoDB({
      level: 'info',
      db: process.env.MONGO_URI!,
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true
      },
      collection: 'logs',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    }),
  ],
});

export default logger;
