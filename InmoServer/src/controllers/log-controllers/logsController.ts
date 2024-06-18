import { Request, Response } from 'express';
import { LogService } from '../../services/log-service/logsService';

export class LogController {
  constructor(private logService: LogService) {}

  public getLogs = async (req: Request, res: Response): Promise<void> => {
    try {
      const logs = await this.logService.getLogs();
      res.status(200).json(logs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
