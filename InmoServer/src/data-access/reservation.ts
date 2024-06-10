import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export const Reservation = sequelize.define(
  'Reservation',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    propertyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Properties',
        key: 'id',
      },
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('Pending Approval', 'Approved', 'Rejected', 'Cancelled by Tenant'),
      allowNull: false,
    },
    adults: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    children: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    inquilino: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    amountPaid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'Reservations',
    timestamps: true,
  },
);
