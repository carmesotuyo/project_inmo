import { Country } from './country';
import { Property } from './property';
import { PropertyAvailability } from './propertyAvailability';
import { Reservation } from './reservation';

export const setRelationships = async () => {
  Property.belongsTo(Country, { foreignKey: 'countryId' });
  Country.hasMany(Property, { foreignKey: 'countryId' });
  Reservation.belongsTo(Property, { foreignKey: 'propertyId' });
  Property.hasMany(PropertyAvailability, { as: 'availabilities', foreignKey: 'propertyId' });
  PropertyAvailability.belongsTo(Property, { foreignKey: 'propertyId' });
};
