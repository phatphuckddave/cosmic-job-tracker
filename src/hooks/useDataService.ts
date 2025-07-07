import { useState, useEffect, useCallback } from 'react';
import { dataService } from '@/services/dataService';
import { IndJob } from '@/lib/types';

export function useJobs() {
  const [jobs, setJobs] = useState<IndJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    
    const loadJobs = async (visibleStatuses?: string[]) => {
      try {
        setLoading(true);
        const loadedJobs = await dataService.loadJobs(visibleStatuses);
        if (mounted) {
          setJobs(loadedJobs);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load jobs');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadJobs();

    // Set up subscription for updates
    const unsubscribe = dataService.subscribe(() => {
      if (mounted) {
        const currentJobs = dataService.getJobs();
        setJobs(prevJobs => {
          // Only update if the jobs have actually changed
          const prevJson = JSON.stringify(prevJobs);
          const currentJson = JSON.stringify(currentJobs);
          return prevJson !== currentJson ? currentJobs : prevJobs;
        });
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []); // Empty dependency array ensures this only runs once on mount

  // Memoize the methods to prevent unnecessary re-renders
  const createJob = useCallback(dataService.createJob.bind(dataService), []);
  const updateJob = useCallback(dataService.updateJob.bind(dataService), []);
  const deleteJob = useCallback(dataService.deleteJob.bind(dataService), []);
  const createTransaction = useCallback(dataService.createTransaction.bind(dataService), []);
  const createMultipleTransactions = useCallback(dataService.createMultipleTransactions.bind(dataService), []);
  const updateTransaction = useCallback(dataService.updateTransaction.bind(dataService), []);
  const deleteTransaction = useCallback(dataService.deleteTransaction.bind(dataService), []);
  const createBillItem = useCallback(dataService.createBillItem.bind(dataService), []);
  const createMultipleBillItems = useCallback(dataService.createMultipleBillItems.bind(dataService), []);

  const loadJobsForStatuses = useCallback(async (visibleStatuses: string[]) => {
    try {
      setLoading(true);
      const loadedJobs = await dataService.loadJobs(visibleStatuses);
      setJobs(loadedJobs);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    jobs,
    loading,
    error,
    createJob,
    updateJob,
    deleteJob,
    createTransaction,
    createMultipleTransactions,
    updateTransaction,
    deleteTransaction,
    createBillItem,
    createMultipleBillItems,
    loadJobsForStatuses
  };
}

export function useJob(jobId: string | null) {
  const [job, setJob] = useState<IndJob | null>(null);

  useEffect(() => {
    if (!jobId) {
      setJob(null);
      return;
    }

    const updateJob = () => {
      setJob(dataService.getJob(jobId));
    };

    updateJob();

    const unsubscribe = dataService.subscribe(updateJob);
    return () => {
      unsubscribe();
    };
  }, [jobId]);

  return job;
}
