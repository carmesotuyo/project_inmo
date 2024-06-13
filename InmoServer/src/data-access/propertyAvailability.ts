import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export const PropertyAvailability = sequelize.define(
  'PropertyAvailability',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    propertyId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Properties',
        key: 'id',
      },
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
  },
  {
    tableName: 'PropertyAvailabilities',
    timestamps: true,
  },
);
