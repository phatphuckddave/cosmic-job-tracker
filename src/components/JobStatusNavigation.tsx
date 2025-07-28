
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IndJob } from '@/lib/types';
import { getNextStatus, getPreviousStatus, getStatusBackgroundColor, getStatusBackgroundColorBright, getStatusColor } from '@/utils/jobStatusUtils';
import { useJobs } from '@/hooks/useDataService';
import { useToast } from '@/hooks/use-toast';

interface JobStatusNavigationProps {
  job: IndJob;
}

const JobStatusNavigation: React.FC<JobStatusNavigationProps> = ({ job }) => {
  const { updateJob } = useJobs();
  const { toast } = useToast();

  const nextStatus = getNextStatus(job.status);
  const previousStatus = getPreviousStatus(job.status);

  const handleStatusChange = async (newStatus: string) => {
    try {
      const currentTime = new Date().toISOString();
      const updates: { status: string; [key: string]: any } = { status: newStatus };

      // Automatically assign dates based on status
      switch (newStatus) {
        case 'Running':
          updates.jobStart = currentTime;
          break;
        case 'Done':
          updates.jobEnd = currentTime;
          break;
        case 'Selling':
          updates.saleStart = currentTime;
          break;
        case 'Closed':
          updates.saleEnd = currentTime;
          break;
      }

      await updateJob(job.id, updates);
      
      const dateMessages = [];
      if (updates.jobStart) dateMessages.push('job start date set');
      if (updates.jobEnd) dateMessages.push('job end date set');
      if (updates.saleStart) dateMessages.push('sale start date set');
      if (updates.saleEnd) dateMessages.push('sale end date set');
      
      const description = dateMessages.length > 0 
        ? `Job status changed to ${newStatus} and ${dateMessages.join(', ')}`
        : `Job status changed to ${newStatus}`;

      toast({
        title: "Status Updated",
        description,
        duration: 2000,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  return (
    <div className="flex gap-2 items-center justify-center">
      {previousStatus && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleStatusChange(previousStatus);
          }}
          className={`${getStatusBackgroundColorBright(previousStatus)} text-white px-4 py-2 rounded flex items-center justify-center gap-1 hover:opacity-80 transition-opacity w-32`}
          data-no-navigate
          title={`Move to ${previousStatus}`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="text-center flex-1">{previousStatus}</span>
        </button>
      )}
      {nextStatus && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleStatusChange(nextStatus);
          }}
          className={`${getStatusBackgroundColorBright(nextStatus)} text-white px-4 py-2 rounded flex items-center justify-center gap-1 hover:opacity-80 transition-opacity w-32`}
          data-no-navigate
          title={`Move to ${nextStatus}`}
        >
          <span className="text-center flex-1">{nextStatus}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default JobStatusNavigation;
