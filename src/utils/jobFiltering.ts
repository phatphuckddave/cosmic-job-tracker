
import { IndJob } from '@/lib/types';
import { getStatusPriority } from '@/utils/jobStatusUtils';

export const filterJobs = (jobs: IndJob[], searchQuery: string) => {
  if (!searchQuery) return jobs;
  const query = searchQuery.toLowerCase();
  return jobs.filter(job =>
    job.outputItem.toLowerCase().includes(query)
  );
};

export const sortJobs = (jobs: IndJob[]) => {
  return [...jobs].sort((a, b) => {
    const priorityA = getStatusPriority(a.status);
    const priorityB = getStatusPriority(b.status);
    if (priorityA === priorityB) {
      return new Date(b.created || '').getTime() - new Date(a.created || '').getTime();
    }
    return priorityA - priorityB;
  });
};

export const categorizeJobs = (jobs: IndJob[], searchQuery: string) => {
  const sortedJobs = sortJobs(jobs);
  const regularJobs = filterJobs(sortedJobs.filter(job => job.status !== 'Tracked'), searchQuery);
  const trackedJobs = filterJobs(sortedJobs.filter(job => job.status === 'Tracked'), searchQuery);

  return { regularJobs, trackedJobs };
};
