import { Request, Response } from 'express';
import { IncidentService } from '../incident-service/incidentService';

export class SignalController {
  constructor(private signalService: IncidentService) {}

  public getSignals = async (req: Request, res: Response): Promise<void> => {
    try {
      const signals = await this.signalService.getSignals();
      res.status(200).json(signals);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
