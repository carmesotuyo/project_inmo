import { User } from '../data-access/user';
import { Op } from 'sequelize';
import { UserRequest } from '../dtos/userRequest';
import axios from 'axios';

export class UserService  {
    // async createUser(data: UserRequest): Promise<InstanceType<typeof User>> {
    //   if (!data) throw Error('Data incorrecta, DTO vacio');
    //   const userObject = { ...data };
    //   return await User.create(userObject);
    // }

    async createUser(data: UserRequest): Promise<InstanceType<typeof User>> {
        // Registrar usuario en Auth0
        const auth0Response = await axios.post(
          `https://${process.env.AUTH0_DOMAIN}/api/v2/users`,
          {
            email: data.email,
            password: data.password,
            connection: 'Username-Password-Authentication',
            given_name: data.first_name,
            family_name: data.last_name,
            name: `${data.first_name} ${data.last_name}`,
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.AUTH0_API_TOKEN}`,
              'Content-Type': 'application/json',
            },
          }
        );
    
        const { user_id } = auth0Response.data;
    
        // Crear usuario en la base de datos
        const user = await User.create({
          ...data,
          auth0_id: user_id,
        });
    
        return user;
      }

    async getUserByEmail (email: string):Promise<InstanceType<typeof User> | null> {
        const user = await User.findByPk(email);
        if (!user) {
          throw new Error('User not found');
        }
        return user;
    }

    async getAllUsers(): Promise<InstanceType<typeof User>[]> {
        const users = await User.findAll();
        if (!users) {
            throw new Error('User not found');
          }
        return users;
    }     
  }