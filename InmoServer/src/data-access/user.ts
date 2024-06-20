import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export const User = sequelize.define(
  'User',
  {
    document: {
      type: DataTypes.STRING(30),
      allowNull: false,
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
      type: DataTypes.ENUM('Administrador', 'Operario', 'Inquilino', 'Propietario'),
      allowNull: false,
      validate: {
        isIn: {
          args: [['Administrador', 'Operario', 'Inquilino', 'Propietario']],
          msg: "User role must be 'Administrador', 'Operario', 'Inquilino' or 'Propietario'",
        },
      },
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
