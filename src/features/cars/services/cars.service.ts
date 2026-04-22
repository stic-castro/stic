import { Car, CreateCarDTO, MonitoringUser } from '../types';

const API_BASE = '/api';

export const carsService = {
  getCars: async (): Promise<Car[]> => {
    const res = await fetch(`${API_BASE}/cars`);
    if (!res.ok) throw new Error('Failed to fetch cars');
    return res.json();
  },

  getMonitoringUsers: async (): Promise<MonitoringUser[]> => {
    const res = await fetch(`${API_BASE}/users?scope=monitoring`);

    if (!res.ok) {
      const payload = await res.json().catch(() => null);
      throw new Error(payload?.error || 'Failed to fetch monitoring users');
    }

    return res.json();
  },

  createCar: async (data: CreateCarDTO): Promise<Car> => {
    const res = await fetch(`${API_BASE}/cars`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const payload = await res.json().catch(() => null);
      throw new Error(payload?.error || 'Failed to create car');
    }

    return res.json();
  },
};
