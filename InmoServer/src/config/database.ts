import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(process.env.DB_NAME!, process.env.DB_USER!, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: process.env.DB_DIALECT || ('mysql' as any),
  port: process.env.DB_PORT || (3306 as any),
  dialectOptions: {
    connectTimeout: 60000,
  },
  logging: false,
});

import { setRelationships } from '../data-access/relationships';
import { User } from '../data-access/user';
import { Property } from '../data-access/property';
import { Country } from '../data-access/country';
import { Reservation } from '../data-access/reservation';
import { PropertyAvailability } from '../data-access/propertyAvailability';
import { Sensor } from '../data-access/sensor';
import { SensorServiceType } from '../data-access/sensorServiceType';
import { PropertySensor } from '../data-access/propertySensor';

const syncTables = async () => {
  try {
    if (process.env.DB_SYNC === 'true') {
      await Country.sync();
      await Property.sync();
      await SensorServiceType.sync();
      await Sensor.sync();
      await Reservation.sync();
      await PropertyAvailability.sync();
      await User.sync();
      await PropertySensor.sync();
      console.log('Los modelos fueron sincronizados con la base de datos.');
    }
  } catch (error) {
    console.error('Error al sincronizar los modelos con la base de datos:', error);
  }
};
const dbSync = async () => {
  await setRelationships();
  await syncTables();
};

export { sequelize, dbSync };
