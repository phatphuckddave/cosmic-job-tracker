
import { IndJob } from '@/lib/types';
import { getStatusColor } from '@/utils/jobStatusUtils';
import { jobNeedsAttention, getAttentionGlowClasses } from '@/utils/jobAttentionUtils';
import JobCard from './JobCard';
import { Loader2 } from 'lucide-react';

interface JobGroupProps {
  status: string;
  jobs: IndJob[];
  isCollapsed: boolean;
  onToggle: (status: string) => void;
  onEdit: (job: IndJob) => void;
  onDelete: (jobId: string) => void;
  onUpdateProduced?: (jobId: string, produced: number) => void;
  onImportBOM?: (jobId: string, items: { name: string; quantity: number }[]) => void;
  isTracked?: boolean;
  isLoading?: boolean;
}

const JobGroup: React.FC<JobGroupProps> = ({
  status,
  jobs,
  isCollapsed,
  onToggle,
  onEdit,
  onDelete,
  onUpdateProduced,
  onImportBOM,
  isTracked = false,
  isLoading = false
}) => {
  // Check if any jobs in this group need attention
  const hasAttentionJobs = jobs.some(job => jobNeedsAttention(job));

  return (
    <div className="space-y-4">
      <div
        className={`${getStatusColor(status)} rounded-lg cursor-pointer select-none transition-colors hover:opacity-90 ${hasAttentionJobs ? getAttentionGlowClasses() : ''}`}
        onClick={() => onToggle(status)}
      >
        <div className="flex items-center justify-between p-4">
          <h3 className="text-xl font-semibold text-white flex items-center gap-3">
            <span>{status}</span>
            <span className="text-gray-200 text-lg">({jobs.length} jobs)</span>
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          </h3>
          <div className={`text-white text-lg transition-transform ${isCollapsed ? '-rotate-90' : 'rotate-0'}`}>
            ⌄
          </div>
        </div>
      </div>

      {!isCollapsed && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoading ? (
            <div className="col-span-full flex items-center justify-center p-8 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Loading jobs...
            </div>
          ) : (
            jobs.map(job => (
              <JobCard
                key={job.id}
                job={job}
                onEdit={onEdit}
                onDelete={onDelete}
                onUpdateProduced={onUpdateProduced}
                onImportBOM={onImportBOM}
                isTracked={isTracked}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default JobGroup;
