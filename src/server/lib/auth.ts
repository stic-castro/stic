import { User } from '../types';

export type SessionUser = Pick<User, 'id' | 'email' | 'phone' | 'role' | 'name'>;

export const allowedRoles: User['role'][] = ['user', 'admin', 'mechanic', 'trainee'];
