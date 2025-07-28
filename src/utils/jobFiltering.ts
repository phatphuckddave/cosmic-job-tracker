
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

// Optimized categorizeJobs function - single pass through data
export const categorizeJobs = (jobs: IndJob[], searchQuery: string) => {
  const query = searchQuery.toLowerCase();
  const hasQuery = Boolean(searchQuery);
  
  // Single pass: sort, filter, and categorize in one operation
  const sortedJobs = [...jobs].sort((a, b) => {
    const priorityA = getStatusPriority(a.status);
    const priorityB = getStatusPriority(b.status);
    if (priorityA === priorityB) {
      return new Date(b.created || '').getTime() - new Date(a.created || '').getTime();
    }
    return priorityA - priorityB;
  });

  const regularJobs: IndJob[] = [];
  const trackedJobs: IndJob[] = [];

  for (const job of sortedJobs) {
    // Apply search filter if needed
    if (hasQuery && !job.outputItem.toLowerCase().includes(query)) {
      continue;
    }

    // Categorize based on status
    if (job.status === 'Tracked') {
      trackedJobs.push(job);
    } else {
      regularJobs.push(job);
    }
  }

  return { regularJobs, trackedJobs };
};
