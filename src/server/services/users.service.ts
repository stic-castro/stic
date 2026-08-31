import { allowedRoles } from '../lib/auth';
import { createSupabaseAdminClient } from '../lib/supabase/admin';
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

    const supabaseAdmin = createSupabaseAdminClient();
    const { data: authData, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email.trim(),
      password: data.password,
      email_confirm: true,
      user_metadata: {
        name: data.name.trim(),
        phone: data.phone.trim(),
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!authData.user?.id || !authData.user.email) {
      throw new Error('Supabase Auth did not return a created user');
    }

    return await userRepository.upsert({
      id: authData.user.id,
      name: data.name.trim(),
      email: authData.user.email,
      phone: data.phone.trim(),
      role,
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
