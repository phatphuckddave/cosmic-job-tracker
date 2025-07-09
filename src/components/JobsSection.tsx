
import { IndJob } from '@/lib/types';
import JobGroup from './JobGroup';

interface JobsSectionProps {
  regularJobs: IndJob[];
  trackedJobs: IndJob[];
  collapsedGroups: Record<string, boolean>;
  loadingStatuses: Set<string>;
  onToggleGroup: (status: string) => void;
  onEdit: (job: IndJob) => void;
  onDelete: (jobId: string) => void;
  onUpdateProduced: (jobId: string, produced: number) => void;
  onImportBOM: (jobId: string, items: { name: string; quantity: number }[]) => void;
}

const JobsSection = ({
  regularJobs,
  trackedJobs,
  collapsedGroups,
  loadingStatuses,
  onToggleGroup,
  onEdit,
  onDelete,
  onUpdateProduced,
  onImportBOM
}: JobsSectionProps) => {
  const jobGroups = regularJobs.reduce((groups, job) => {
    const status = job.status;
    if (!groups[status]) {
      groups[status] = [];
    }
    groups[status].push(job);
    return groups;
  }, {} as Record<string, IndJob[]>);

  return (
    <div className="space-y-4">
      <div className="space-y-6">
        {Object.entries(jobGroups).map(([status, statusJobs]) => (
          <JobGroup
            key={status}
            status={status}
            jobs={statusJobs}
            isCollapsed={collapsedGroups[status] || false}
            onToggle={onToggleGroup}
            onEdit={onEdit}
            onDelete={onDelete}
            onUpdateProduced={onUpdateProduced}
            onImportBOM={onImportBOM}
            isLoading={loadingStatuses.has(status)}
          />
        ))}
      </div>

      {trackedJobs.length > 0 && (
        <div className="space-y-4 mt-8 pt-8 border-t border-gray-700">
          <JobGroup
            status="Tracked"
            jobs={trackedJobs}
            isCollapsed={collapsedGroups['Tracked'] || false}
            onToggle={onToggleGroup}
            onEdit={onEdit}
            onDelete={onDelete}
            onUpdateProduced={onUpdateProduced}
            onImportBOM={onImportBOM}
            isTracked={true}
            isLoading={loadingStatuses.has('Tracked')}
          />
        </div>
      )}
    </div>
  );
};

export default JobsSection;
