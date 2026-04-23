import { userRepository } from '../repositories/users.repository';
import { Mechanic } from '../types';
import { IService } from '../types/core';

export const MechanicService: IService<Mechanic, never> = {
  getAll: async (): Promise<Mechanic[]> => {
    const mechanicUsers = await userRepository.findByRoles(['mechanic']);

    return mechanicUsers.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      created_at: user.created_at,
    }));
  },

  create: async (): Promise<Mechanic> => {
    throw new Error('Mechanics are managed through users with the mechanic role');
  },
};
