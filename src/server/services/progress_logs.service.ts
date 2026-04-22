import { progressLogRepository } from '../repositories/progress_logs.repository';
import { ProgressLog, User } from '../types';
import { IService } from '../types/core';

export type CreateProgressLogDTO = {
  job_id: string;
  description: string;
  started_at: string;
  ended_at?: string | null;
};

export const ProgressLogService: IService<ProgressLog, CreateProgressLogDTO> = {
  getAll: async (): Promise<ProgressLog[]> => {
    return await progressLogRepository.findAll();
  },

  create: async (data: CreateProgressLogDTO): Promise<ProgressLog> => {
    if (!data.job_id || !data.description || !data.started_at) {
      throw new Error('Missing required fields for progress log');
    }

    if (!data.ended_at) {
      throw new Error('End time is required for progress log');
    }

    const startedAt = new Date(data.started_at);
    const endedAt = new Date(data.ended_at);

    if (Number.isNaN(startedAt.getTime()) || Number.isNaN(endedAt.getTime())) {
      throw new Error('Progress log times must be valid dates');
    }

    if (endedAt <= startedAt) {
      throw new Error('End time must be after start time');
    }

    const durationMs = endedAt.getTime() - startedAt.getTime();
    const minimumHourMs = 60 * 60 * 1000;

    if (durationMs < minimumHourMs) {
      throw new Error('Each progress log must cover at least one hour of work');
    }

    return await progressLogRepository.create({
      job_id: data.job_id.trim(),
      description: data.description.trim(),
      started_at: startedAt.toISOString(),
      ended_at: endedAt.toISOString()
    });
  },
};

export async function getVisibleProgressLogs(currentUser: Pick<User, 'id' | 'role'>): Promise<ProgressLog[]> {
  return progressLogRepository.findVisible(currentUser);
}
