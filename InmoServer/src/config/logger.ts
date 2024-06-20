import winston from 'winston';
import 'winston-mongodb';
import dotenv from 'dotenv';

dotenv.config();

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp(),
  winston.format.printf(({ timestamp, level, message }) => {
    return `${timestamp} ${level}: ${message}`;
  }),
);

const mongoDBFormat = winston.format.combine(winston.format.timestamp(), winston.format.json());

const logger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.Console({
      format: consoleFormat,
    }),
    new winston.transports.MongoDB({
      level: 'info',
      db: process.env.LOGS_MONGO_URI!,
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
      collection: 'logs',
      format: mongoDBFormat,
    }),
  ],
});

export default logger;
