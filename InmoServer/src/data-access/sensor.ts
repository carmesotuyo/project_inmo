import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export const Sensor = sequelize.define(
  'Sensor',
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      validate: {
        len: {
          args: [1, 15],
          msg: 'ID must be no more than 15 characters long',
        },
      },
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [1, 200],
          msg: 'Description must be no more than 200 characters long',
        },
      },
    },
    seriesNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: {
          args: [0, 45],
          msg: 'Series number must be no more than 45 characters long',
        },
      },
    },
    brand: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [1, 50],
          msg: 'Brand must be no more than 50 characters long',
        },
      },
    },
    serviceAddress: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [1, 1000],
          msg: 'Service address must be no more than 1000 characters long',
        },
      },
    },
    lastCheckDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    serviceTypeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'SensorServiceType',
        key: 'id',
      },
    },
    observableProperties: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        isLongEnough(value: JSON) {
          if (JSON.stringify(value).length > 1000) {
            throw new Error('Properties JSON must be no longer than 1000 characters');
          }
        },
      },
    },
    propertyId: {
      type: DataTypes.NUMBER,
      allowNull: true,
    },
  },
  {
    tableName: 'Reservations',
    timestamps: true,
  },
);
