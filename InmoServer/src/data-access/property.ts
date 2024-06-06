import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import { Country } from './country';

export const Property = sequelize.define('Property', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  numberOfAdults: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 20
    },
  },
  numberOfKids: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0,
      max: 20
    },
  },
  numberOfDoubleBeds: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0,
      max: 10
    },
  },
  numberOfSingleBeds: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0,
      max: 20
    },
  },
  airConditioning: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  wifi: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  garage: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  houseOrApartment: {
    type: DataTypes.ENUM,
    allowNull: false,
    validate: {
      isIn: {
        args: [['1', '2']],
        msg: "Must be House (1) or Apartment (2)"
      }
    },
  },
  mtsToTheBeach: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 50,
      max: 20000
    },
  },
  country: {
    type: Country, //TODO agregar relacion
    allowNull: false
  },
  stateOrProvince: {
    type: DataTypes.STRING,
    allowNull: false
  },
  district: {
    type: DataTypes.STRING,
    allowNull: false
  },
  neighborhood: {
    type: DataTypes.STRING,
    allowNull: false
  },
  images: {
    type: DataTypes.ARRAY, //TODO chequear esto
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM,
    allowNull: false,
    validate: {
      isIn: {
        args: [['Pendiente de pago', 'Activo']],
        msg: "Must be 'Pendiente de pago' or 'Activo'"
      }
    },
  },
}, {
  tableName: 'Properties',
  timestamps: true
});
