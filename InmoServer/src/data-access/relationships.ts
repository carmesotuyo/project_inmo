import { Country } from './country';
import { Property } from './property';
import { PropertyAvailability } from './propertyAvailability';
import { Reservation } from './reservation';
import { Sensor } from './sensor';
import { SensorServiceType } from './sensorServiceType';
import { PropertySensor } from './propertySensor';

export const setRelationships = async () => {
  Property.belongsTo(Country, { foreignKey: 'countryId' });
  Country.hasMany(Property, { foreignKey: 'countryId' });
  Reservation.belongsTo(Property, { foreignKey: 'propertyId' });
  Property.hasMany(PropertyAvailability, { as: 'availabilities', foreignKey: 'propertyId' });
  PropertyAvailability.belongsTo(Property, { foreignKey: 'propertyId' });
  Sensor.belongsTo(SensorServiceType, { foreignKey: 'serviceTypeId' });
  SensorServiceType.hasMany(Sensor, { foreignKey: 'serviceTypeId' });
  Property.belongsToMany(Sensor, { through: PropertySensor, foreignKey: 'propertyId' });
  Sensor.belongsToMany(Property, { through: PropertySensor, foreignKey: 'sensorId' });
};
