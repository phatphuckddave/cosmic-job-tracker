
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { IndJob } from '@/lib/types';
import { getStatusBackgroundColor } from '@/utils/jobStatusUtils';
import { jobNeedsAttention, getAttentionGlowClasses } from '@/utils/jobAttentionUtils';
import JobCardHeader from './JobCardHeader';
import JobCardDetails from './JobCardDetails';
import JobCardMetrics from './JobCardMetrics';

interface JobCardProps {
  job: IndJob;
  onEdit: (job: any) => void;
  onDelete: (jobId: string) => void;
  onUpdateProduced?: (jobId: string, produced: number) => void;
  onImportBOM?: (jobId: string, items: { name: string; quantity: number }[]) => void;
  isTracked?: boolean;
}

const JobCard: React.FC<JobCardProps> = ({
  job,
  onEdit,
  onDelete,
  onUpdateProduced,
  onImportBOM,
  isTracked = false
}) => {
  const navigate = useNavigate();
  const needsAttention = jobNeedsAttention(job);

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const hasNoNavigate = target.closest('[data-no-navigate]');

    if (hasNoNavigate) {
      return;
    }

    navigate(`/${job.id}`);
  };

  return (
    <Card
      className={`bg-gray-900 border-gray-700 text-white h-full flex flex-col cursor-pointer hover:bg-gray-800/50 transition-colors ${job.status === 'Tracked' ? 'border-l-4 border-l-cyan-600' : ''} ${getStatusBackgroundColor(job.status)} ${needsAttention ? getAttentionGlowClasses() : ''}`}
      onClick={handleCardClick}
    >
      <CardHeader className="flex-shrink-0">
        <JobCardHeader
          job={job}
          onEdit={onEdit}
          onDelete={onDelete}
          onUpdateProduced={onUpdateProduced}
          onImportBOM={onImportBOM}
        />
      </CardHeader>
      <CardContent className="flex-1 flex flex-col space-y-4">
        <JobCardDetails job={job} />
        <div className="flex-1" />
        <JobCardMetrics job={job} />
      </CardContent>
    </Card>
  );
};

export default JobCard;
