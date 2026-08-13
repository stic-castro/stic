import { useState, useEffect, useCallback } from 'react';
import { jobsService } from '../services/jobs.service';
import { Job, ProgressLog, Mechanic, Car } from '../types';

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await jobsService.getJobs();
      setJobs(data);
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Error fetching jobs'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return { jobs, loading, error, refresh: fetchJobs };
}

export function useJobDetail(jobId: string) {
  const [job, setJob] = useState<Job | null>(null);
  const [logs, setLogs] = useState<ProgressLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [allJobs, allLogs] = await Promise.all([
        jobsService.getJobs(),
        jobsService.getProgressLogs()
      ]);
      
      const foundJob = allJobs.find(j => j.id === jobId) || null;
      setJob(foundJob);
      
      const jobLogs = allLogs
        .filter(l => l.job_id === jobId)
        .sort((a, b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime());
      setLogs(jobLogs);
      
      if (!foundJob) {
        setError('Job not found');
      }
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Error fetching job details'));
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  return { job, logs, loading, error, refresh: fetchDetails };
}

export function useFormOptions() {
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOptions() {
      try {
        const [m, c] = await Promise.all([
          jobsService.getMechanics(),
          jobsService.getCars()
        ]);
        setMechanics(m);
        setCars(c);
      } catch (err) {
        console.error("Failed to load generic options", err);
      } finally {
        setLoading(false);
      }
    }
    loadOptions();
  }, []);

  return { mechanics, cars, loading };
}
