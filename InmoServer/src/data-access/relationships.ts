import { Country } from './country';
import { Property } from './property';
import { Reservation } from './reservation';

export const setRelationships = async () => {
  Property.belongsTo(Country, { foreignKey: 'countryId' });
  Country.hasMany(Property, { foreignKey: 'countryId' });
  Reservation.belongsTo(Property, { foreignKey: 'propertyId' });
};
