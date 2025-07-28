import { useMemo } from 'react';
import { IndJob } from '@/lib/types';
import { categorizeJobs } from '@/utils/jobFiltering';

export const useCategorizedJobs = (jobs: IndJob[], searchQuery: string) => {
  return useMemo(() => {
    return categorizeJobs(jobs, searchQuery);
  }, [jobs, searchQuery]);
};