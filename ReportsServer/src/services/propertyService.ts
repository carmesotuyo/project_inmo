import Property, { IProperty } from '../models/property';

export const createProperty = async (data: IProperty): Promise<IProperty> => {
  const property = new Property(data);
  return await property.save();
};

export const getProperties = async (): Promise<IProperty[]> => {
    return await Property.find();
    };
