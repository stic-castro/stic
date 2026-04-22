import { Job, ProgressLog, CreateJobDTO, CreateProgressLogDTO, Mechanic, Car } from '../types';

const API_BASE = '/api';

export const jobsService = {
  getJobs: async (): Promise<Job[]> => {
    const res = await fetch(`${API_BASE}/jobs`);
    if (!res.ok) throw new Error('Failed to fetch jobs');
    return res.json();
  },

  createJob: async (data: CreateJobDTO): Promise<Job> => {
    const res = await fetch(`${API_BASE}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const payload = await res.json().catch(() => null);
      throw new Error(payload?.error || 'Failed to create job');
    }
    return res.json();
  },

  getProgressLogs: async (): Promise<ProgressLog[]> => {
    const res = await fetch(`${API_BASE}/progress_logs`);
    if (!res.ok) throw new Error('Failed to fetch progress logs');
    return res.json();
  },

  createProgressLog: async (data: CreateProgressLogDTO): Promise<ProgressLog> => {
    const res = await fetch(`${API_BASE}/progress_logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const payload = await res.json().catch(() => null);
      throw new Error(payload?.error || 'Failed to create progress log');
    }
    return res.json();
  },

  getMechanics: async (): Promise<Mechanic[]> => {
    const res = await fetch(`${API_BASE}/mechanics`);
    if (!res.ok) throw new Error('Failed to fetch mechanics');
    return res.json();
  },

  getCars: async (): Promise<Car[]> => {
    const res = await fetch(`${API_BASE}/cars`);
    if (!res.ok) throw new Error('Failed to fetch cars');
    return res.json();
  }
};
