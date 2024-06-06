import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export const Country = sequelize.define('Country', {
  name: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  cancellationDays: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  returnPercentage: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
}, {
  tableName: 'Countries',
  timestamps: true
});
