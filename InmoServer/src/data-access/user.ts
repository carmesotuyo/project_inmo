import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export class User extends Model {
  public id!: number;
  public document!: string;
  public document_type!: string;
  public first_name!: string;
  public last_name!: string;
  public email!: string;
  public phone_number!: string;
  public role!: string;
  public auth0_id!: string;
}

export default (sequelize: any) =>
    User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
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
      type: DataTypes.ENUM('Administrador', 'Operario', 'Propietario', 'Inquilino'),
      allowNull: false,
    },
    auth0_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: 'users',
    sequelize,
    indexes: [
        {
          unique: true,
          fields: ["email"],
        },
      ],
    timestamps: true,
  },
);
