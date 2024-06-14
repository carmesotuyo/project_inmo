import Log, { LogDocument } from '../data-access/logs';

export class LogService {
  async getLogs(): Promise<LogDocument[]> {
    try {
      const logs = await Log.find().sort({ timestamp: -1 }).exec();
      return logs;
    } catch (error: any) {
      throw new Error(`Error fetching logs: ${error.message}`);
    }
  }
}
