import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { IndJob } from '@/lib/types';
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

  const getStatusBackgroundColor = (status: string) => {
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

  const handleCardClick = (e: React.MouseEvent) => {
    // Check if the click target or any of its parents has the data-no-navigate attribute
    const target = e.target as HTMLElement;
    const hasNoNavigate = target.closest('[data-no-navigate]');
    
    if (hasNoNavigate) {
      // Don't navigate if clicking on elements marked as non-navigating
      return;
    }
    
    // Only navigate if clicking on areas that aren't marked as non-navigating
    navigate(`/${job.id}`);
  };

  return (
    <Card
      className={`bg-gray-900 border-gray-700 text-white h-full flex flex-col cursor-pointer hover:bg-gray-800/50 transition-colors ${job.status === 'Tracked' ? 'border-l-4 border-l-cyan-600' : ''} ${getStatusBackgroundColor(job.status)}`}
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
