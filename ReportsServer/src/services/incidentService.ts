import Incident, { IIncident } from '../models/incident';

export const createIncident = async (data: IIncident): Promise<IIncident> => {
  const incident = new Incident(data);
  return await incident.save();
};
