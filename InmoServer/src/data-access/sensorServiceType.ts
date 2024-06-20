import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export const SensorServiceType = sequelize.define(
  'SensorServiceType',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    priority: {
      type: DataTypes.ENUM('Low', 'Medium', 'High'),
      allowNull: false,
    },
  },
  {
    tableName: 'ServiceTypes',
    timestamps: false,
  },
);
