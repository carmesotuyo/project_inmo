import { SignalDocument } from '../../data-access/signal';

export interface IncidentService {
  getSignals(): Promise<SignalDocument[]>;
}
