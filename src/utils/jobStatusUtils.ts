
import { IndJobStatusOptions } from '@/lib/pbtypes';

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'Planned': return 'bg-gray-600';
    case 'Acquisition': return 'bg-yellow-600';
    case 'Running': return 'bg-blue-600';
    case 'Done': return 'bg-purple-600';
    case 'Selling': return 'bg-orange-600';
    case 'Closed': return 'bg-green-600';
    case 'Tracked': return 'bg-cyan-600';
    default: return 'bg-gray-600';
  }
};

export const getStatusBackgroundColor = (status: string) => {
  switch (status) {
    case 'Planned': return 'bg-gray-600/20';
    case 'Acquisition': return 'bg-yellow-600/20';
    case 'Running': return 'bg-blue-600/20';
    case 'Done': return 'bg-purple-600/20';
    case 'Selling': return 'bg-orange-600/20';
    case 'Closed': return 'bg-green-600/20';
    case 'Tracked': return 'bg-cyan-600/20';
    default: return 'bg-gray-600/20';
  }
};

export const getStatusPriority = (status: IndJobStatusOptions): number => {
  switch (status) {
    case 'Planned': return 6;
    case 'Acquisition': return 1;
    case 'Running': return 2;
    case 'Done': return 3;
    case 'Selling': return 4;
    case 'Closed': return 5;
    case 'Tracked': return 7;
    default: return 0;
  }
};

export const JOB_STATUSES = ['Planned', 'Acquisition', 'Running', 'Done', 'Selling', 'Closed', 'Tracked'] as const;
