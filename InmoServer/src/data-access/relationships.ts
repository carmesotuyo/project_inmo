// src/data-access/relationships.ts
import { Country } from './country';
import { Property } from './property';

export const setRelationships = async () =>{
  Property.belongsTo(Country, { foreignKey: 'countryId' });
  Country.hasMany(Property, { foreignKey: 'countryId' });
}
