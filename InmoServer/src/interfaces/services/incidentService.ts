import { SignalDocument } from '../../data-access/signal';

export interface IncidentService {
  getSignals(): Promise<SignalDocument[]>;
  getRecentSignalsForProperty(propertyId: string): Promise<SignalDocument[]>;
}
