import { hashPassword, verifyPassword } from '../lib/auth';
import { userRepository } from '../repositories/users.repository';
import { User } from '../types';

export type CreateUserDTO = {
  name: string;
  email: string;
  phone: string;
  role?: User['role'];
  password: string;
};

type CreateUserOptions = {
  requestedBy?: Pick<User, 'role'> | null;
};

type UserServiceContract = {
  getAll: () => Promise<User[]>;
  getMonitoringUsers: (requestedBy?: Pick<User, 'role'> | null) => Promise<User[]>;
  getById: (id: string) => Promise<User | null>;
  create: (data: CreateUserDTO, options?: CreateUserOptions) => Promise<User>;
  updateRole: (
    userId: string,
    role: User['role'],
    options?: { requestedBy?: Pick<User, 'id' | 'role'> | null }
  ) => Promise<User>;
};

const allowedRoles: User['role'][] = ['user', 'admin', 'mechanic', 'trainee'];

export const UserService: UserServiceContract = {
  getAll: async (): Promise<User[]> => {
    return await userRepository.findAll();
  },

  getMonitoringUsers: async (requestedBy?: Pick<User, 'role'> | null): Promise<User[]> => {
    if (requestedBy?.role !== 'admin' && requestedBy?.role !== 'mechanic') {
      throw new Error('Only admins and mechanics can view monitoring users');
    }

    return userRepository.findMonitoringUsers();
  },

  getById: async (id: string): Promise<User | null> => {
    return userRepository.findById(id);
  },

  create: async (data: CreateUserDTO, options?: CreateUserOptions): Promise<User> => {
    if (!data.name || data.name.trim() === '') {
      throw new Error('Name cannot be empty');
    }
    if (!data.email || data.email.trim() === '') {
      throw new Error('Email cannot be empty');
    }
    if (!data.phone || data.phone.trim() === '') {
      throw new Error('Phone cannot be empty');
    }
    const role = data.role ?? 'user';

    if (!allowedRoles.includes(role)) {
      throw new Error('Role must be one of: user, admin, mechanic, trainee');
    }
    if (options?.requestedBy?.role !== 'admin' && role !== 'user') {
      throw new Error('Only admins can assign admin, mechanic, or trainee roles');
    }
    if (!data.password || data.password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    return await userRepository.create({
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      role,
      password_hash: hashPassword(data.password)
    });
  },

  updateRole: async (
    userId: string,
    role: User['role'],
    options?: { requestedBy?: Pick<User, 'id' | 'role'> | null }
  ): Promise<User> => {
    if (!userId) {
      throw new Error('User id is required');
    }

    if (!allowedRoles.includes(role)) {
      throw new Error('Role must be one of: user, admin, mechanic, trainee');
    }

    if (options?.requestedBy?.role !== 'admin') {
      throw new Error('Only admins can update roles');
    }

    if (options.requestedBy.id === userId) {
      throw new Error('Admins cannot change their own role from this page');
    }

    const updatedUser = await userRepository.updateRole(userId, role);

    if (!updatedUser) {
      throw new Error('User not found');
    }

    return updatedUser;
  },
};

export async function authenticateUser(identifier: string, password: string): Promise<User | null> {
  const normalizedIdentifier = identifier.trim();
  const user = normalizedIdentifier.includes('@')
    ? await userRepository.findByEmail(normalizedIdentifier)
    : await userRepository.findByPhone(normalizedIdentifier);

  if (!user) {
    return null;
  }

  const isValid = verifyPassword(password, user.password_hash);

  if (!isValid) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    created_at: user.created_at,
  };
}
