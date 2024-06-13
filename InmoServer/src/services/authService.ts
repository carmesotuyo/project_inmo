import { User } from '../data-access/user';
import { Op } from 'sequelize';
import { UserRequest } from '../dtos/userRequest';

export class UserService  {
    async createUser(data: UserRequest): Promise<InstanceType<typeof User>> {
      if (!data) throw Error('Data incorrecta, DTO vacio');
      const userObject = { ...data };
      return await User.create(userObject);
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

    // async updateUser(email: string, data: UserRequest): Promise<InstanceType<typeof User>> {
    //     const user = await User.findByPk(email);
    //     if (!user) {
    //       throw new Error('User not found');
    //     }
    //     return await user.update(data);
    // }

    // async deleteUser(email: string): Promise<void> {
    //     const user = await User.findByPk(email);
    //     if (!user) {
    //       throw new Error('User not found');
    //     }
    //     await user.destroy();
    // }
    
    
  }