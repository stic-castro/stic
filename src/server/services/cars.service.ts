import { carRepository } from '../repositories/cars.repository';
import { userRepository } from '../repositories/users.repository';
import { Car, User } from '../types';
import { IService } from '../types/core';

export type CreateCarDTO = {
  user_id: string;
  brand: string;
  model: string;
  year: number;
  plate: string;
};

export const CarService: IService<Car, CreateCarDTO> = {
  getAll: async (): Promise<Car[]> => {
    return await carRepository.findAll();
  },

  create: async (data: CreateCarDTO): Promise<Car> => {
    if (!data.user_id || !data.brand || !data.model || !data.year || !data.plate) {
      throw new Error('Missing required fields for car');
    }

    const monitoringUser = await userRepository.findById(data.user_id.trim());

    if (!monitoringUser || monitoringUser.role !== 'user') {
      throw new Error('Monitoring user must be an existing regular user');
    }

    return await carRepository.create({
      user_id: data.user_id.trim(),
      brand: data.brand.trim(),
      model: data.model.trim(),
      year: data.year,
      plate: data.plate.trim()
    });
  },
};

export async function getVisibleCars(currentUser: Pick<User, 'id' | 'role'>): Promise<Car[]> {
  return carRepository.findVisible(currentUser);
}
