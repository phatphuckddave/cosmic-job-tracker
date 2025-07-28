
import { IndJobStatusOptions } from '@/lib/pbtypes';

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'Planned': return 'bg-gray-600';
    case 'Acquisition': return 'bg-yellow-600';
    case 'Staging': return 'bg-amber-600';
    case 'Inbound': return 'bg-orange-600';
    case 'Queued': return 'bg-red-600';
    case 'Running': return 'bg-blue-600';
    case 'Done': return 'bg-purple-600';
    case 'Delivered': return 'bg-indigo-600';
    case 'Outbound': return 'bg-pink-600';
    case 'Selling': return 'bg-emerald-600';
    case 'Closed': return 'bg-green-600';
    case 'Tracked': return 'bg-cyan-600';
    default: return 'bg-gray-600';
  }
};

export const getStatusBackgroundColor = (status: string) => {
  switch (status) {
    case 'Planned': return `bg-gray-600/25`;
    case 'Acquisition': return `bg-yellow-600/25`;
    case 'Staging': return `bg-amber-600/25`;
    case 'Inbound': return `bg-orange-600/25`;
    case 'Queued': return `bg-red-600/25`;
    case 'Running': return `bg-blue-600/25`;
    case 'Done': return `bg-purple-600/25`;
    case 'Delivered': return `bg-indigo-600/25`;
    case 'Outbound': return `bg-pink-600/25`;
    case 'Selling': return `bg-emerald-600/25`;
    case 'Closed': return `bg-green-600/25`;
    case 'Tracked': return `bg-cyan-600/25`;
    default: return `bg-gray-600/25`;
  }
};

export const getStatusBackgroundColorBright = (status: string) => {
  switch (status) {
    case 'Planned': return `bg-gray-600/55`;
    case 'Acquisition': return `bg-yellow-600/55`;
    case 'Staging': return `bg-amber-600/55`;
    case 'Inbound': return `bg-orange-600/55`;
    case 'Queued': return `bg-red-600/55`;
    case 'Running': return `bg-blue-600/55`;
    case 'Done': return `bg-purple-600/55`;
    case 'Delivered': return `bg-indigo-600/55`;
    case 'Outbound': return `bg-pink-600/55`;
    case 'Selling': return `bg-emerald-600/55`;
    case 'Closed': return `bg-green-600/55`;
    case 'Tracked': return `bg-cyan-600/55`;
    default: return `bg-gray-600/55`;
  }
};

export const getStatusPriority = (status: IndJobStatusOptions): number => {
  switch (status) {
    case 'Planned': return 1;
    case 'Acquisition': return 2;
    case 'Staging': return 3;
    case 'Inbound': return 4;
    case 'Queued': return 5;
    case 'Running': return 6;
    case 'Done': return 7;
    case 'Delivered': return 8;
    case 'Outbound': return 9;
    case 'Selling': return 10;
    case 'Closed': return 11;
    case 'Tracked': return 12;
    default: return 0;
  }
};

// Define the status sequence - using the actual enum values
export const JOB_STATUSES = [
  'Planned', 'Acquisition', 'Staging', 'Inbound', 'Queued', 'Running', 'Done',
  'Delivered', 'Outbound', 'Selling', 'Closed', 'Tracked'
] as const;

export const getNextStatus = (currentStatus: string): string | null => {
  const currentIndex = JOB_STATUSES.indexOf(currentStatus as any);
  if (currentIndex === -1 || currentIndex === JOB_STATUSES.length - 1) return null;
  return JOB_STATUSES[currentIndex + 1];
};

export const getPreviousStatus = (currentStatus: string): string | null => {
  const currentIndex = JOB_STATUSES.indexOf(currentStatus as any);
  if (currentIndex <= 0) return null;
  return JOB_STATUSES[currentIndex - 1];
};
