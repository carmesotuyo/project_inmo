import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database';


export const User = sequelize.define(
  'User',
  {
    document: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
      validate: {
        is: /^[A-Za-z0-9.-]+$/,
        len: [1, 30],
      },
    },
    document_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    first_name: {
      type: DataTypes.STRING(30),
      allowNull: false,
      validate: {
        len: [3, 30],
      },
    },
    last_name: {
      type: DataTypes.STRING(30),
      allowNull: false,
      validate: {
        len: [3, 30],
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      unique: true,

      validate: {
        isEmail: true,
      },
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: /^[0-9-+() ]*$/,
      },
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    auth0_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: 'Users',
    timestamps: true,
  },
);
