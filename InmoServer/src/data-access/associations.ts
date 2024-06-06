// src/models/associations.ts
import { Country } from './country';
import { Property } from './property';

Country.hasMany(Property, {
  foreignKey: 'countryId',
  as: 'properties'
});

Property.belongsTo(Country, {
  foreignKey: 'countryId',
  as: 'country'
});
