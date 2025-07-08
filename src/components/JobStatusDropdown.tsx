
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { IndJob } from '@/lib/types';
import { getStatusColor, JOB_STATUSES } from '@/utils/jobStatusUtils';
import { useJobs } from '@/hooks/useDataService';
import { useToast } from '@/hooks/use-toast';

interface JobStatusDropdownProps {
  job: IndJob;
}

const JobStatusDropdown: React.FC<JobStatusDropdownProps> = ({ job }) => {
  const { updateJob } = useJobs();
  const { toast } = useToast();

  const handleStatusChange = async (newStatus: string, e: React.MouseEvent) => {
    try {
      await updateJob(job.id, { status: newStatus });
      toast({
        title: "Status Updated",
        description: `Job status changed to ${newStatus}`,
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div
          className={`${getStatusColor(job.status)} text-white px-3 py-1 rounded-sm text-xs font-semibold cursor-pointer hover:opacity-80 transition-opacity`}
          data-no-navigate
        >
          {job.status}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-gray-800/50 border-gray-600 text-white">
        {JOB_STATUSES.map((status) => (
          <DropdownMenuItem
            key={status}
            onClick={(e) => handleStatusChange(status, e)}
            className="hover:bg-gray-700 cursor-pointer"
            data-no-navigate
          >
            <div className={`w-3 h-3 rounded-sm ${getStatusColor(status)} mr-2`} />
            {status}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default JobStatusDropdown;
