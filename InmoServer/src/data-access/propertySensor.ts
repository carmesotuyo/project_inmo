import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export const PropertySensor = sequelize.define(
  'PropertySensor',
  {
    propertyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Properties',
        key: 'id',
      },
    },
    sensorId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'Sensors',
        key: 'id',
      },
    },
  },
  {
    tableName: 'PropertySensors',
    timestamps: false,
  },
);
