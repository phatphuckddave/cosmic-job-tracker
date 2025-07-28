
import { useState, useRef } from 'react';
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
  const [isUpdating, setIsUpdating] = useState(false);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleStatusChange = async (newStatus: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Prevent duplicate calls
    if (isUpdating || job.status === newStatus) {
      return;
    }

    // Clear any pending timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    setIsUpdating(true);

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
    } finally {
      // Reset updating state after a short delay
      updateTimeoutRef.current = setTimeout(() => {
        setIsUpdating(false);
      }, 500);
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
