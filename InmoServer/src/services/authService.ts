import { User } from '../data-access/user';
import { Op } from 'sequelize';

export class UserService  {
    async createUser(data: any): Promise<InstanceType<typeof User>> {
      if (!data) throw Error('Data incorrecta, DTO vacio');
      const userObject = { ...data };
      return await User.create(userObject);
    }
  
    async getUserById(id: number): Promise<InstanceType<typeof User> | null> {
      const user = await User.findByPk(id);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    }

    async getUserByEmail (email: string): Promise<InstanceType<typeof User> | null> {
        const user = await User.findOne({ where: { email } });
        if (!user) {
          throw new Error('User not found');
        }
        return user;
      }
    
  }