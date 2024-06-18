import mongoose, { Connection, Model } from 'mongoose';
import dotenv from 'dotenv';
import { SignalDocument, signalSchema } from '../data-access/signal';
import { LogDocument, logSchema } from '../data-access/logs';

dotenv.config();

let signalsConn: Connection;
let logsConn: Connection;
let Signal: Model<SignalDocument>;
let Log: Model<LogDocument>;

const connectLogsDB = async (): Promise<Connection> => {
  if (!logsConn) {
    logsConn = mongoose.createConnection(process.env.LOGS_MONGO_URI as string);

    logsConn.on('connected', () => {
      console.log('Logs MongoDB connected');
    });
    logsConn.on('error', (err) => {
      console.log('Logs MongoDB error: ' + err);
    });
    Log = logsConn.model<LogDocument>('Log', logSchema);
  }
  return logsConn;
};

const connectSignalsDB = async (): Promise<Connection> => {
  if (!signalsConn) {
    signalsConn = mongoose.createConnection(process.env.SIGNALS_MONGO_URI as string);
    signalsConn.on('connected', () => {
      console.log('Signals MongoDB connected');
    });
    signalsConn.on('error', (err) => {
      console.log('Signals MongoDB error: ' + err);
    });
    Signal = signalsConn.model<SignalDocument>('Signal', signalSchema);
  }
  return signalsConn;
};

export { Log, Signal, connectLogsDB, connectSignalsDB, signalsConn, logsConn };
