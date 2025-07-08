
import { useState } from 'react';
import { IndJob } from '@/lib/types';
import { formatISK } from '@/utils/priceUtils';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { getStatusBackgroundColor } from '@/utils/jobStatusUtils';

interface RecapPopoverProps {
  title: string;
  jobs: IndJob[];
  children: React.ReactNode;
  calculateJobValue: (job: IndJob) => number;
}

const RecapPopover: React.FC<RecapPopoverProps> = ({
  title,
  jobs,
  children,
  calculateJobValue
}) => {
  const navigate = useNavigate();
  const [sortDescending, setSortDescending] = useState(true);

  const jobContributions = jobs
    .map(job => ({
      job,
      value: calculateJobValue(job)
    }))
    .filter(({ value }) => value !== 0)
    .sort((a, b) => {
      if (sortDescending) {
        // For descending: negative values first, then positive values
        // Within each group, sort by magnitude
        if (a.value < 0 && b.value >= 0) return -1; // a (negative) comes first
        if (a.value >= 0 && b.value < 0) return 1;  // b (negative) comes first
        return Math.abs(b.value) - Math.abs(a.value); // same sign, sort by magnitude
      } else {
        // For ascending: positive values first, then negative values
        // Within each group, sort by magnitude
        if (a.value >= 0 && b.value < 0) return -1; // a (positive) comes first
        if (a.value < 0 && b.value >= 0) return 1;  // b (positive) comes first
        return Math.abs(a.value) - Math.abs(b.value); // same sign, sort by magnitude
      }
    });

  const handleJobClick = (jobId: string) => {
    navigate(`/${jobId}`);
  };

  const toggleSort = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSortDescending(!sortDescending);
  };

  const handleItemClick = (e: React.MouseEvent, jobId: string) => {
    // Check if the clicked element or its parent has data-no-navigate
    const target = e.target as HTMLElement;
    const hasNoNavigate = target.closest('[data-no-navigate]');

    if (!hasNoNavigate) {
      handleJobClick(jobId);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-[30rem] bg-gray-800/95 border-gray-600 text-white max-h-[40rem] overflow-y-auto">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-white flex items-center justify-between">
            <span>{title}</span>
            <button
              onClick={toggleSort}
              className="flex items-center gap-1 text-sm font-normal text-gray-300 hover:text-white transition-colors"
              title="Click to toggle sort order"
              data-no-navigate
            >
              Sort {sortDescending ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {jobContributions.length === 0 ? (
            <p className="text-gray-400 text-sm">No contributions to display</p>
          ) : (
            jobContributions.map(({ job, value }) => (
              <div
                key={job.id}
                onClick={(e) => handleItemClick(e, job.id)}
                className={`flex justify-between items-center p-2 rounded hover:bg-gray-700/50 cursor-pointer transition-colors border-l-2 border-l-gray-600 ${getStatusBackgroundColor(job.status)}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-blue-400 truncate" title={job.outputItem}>
                    {job.outputItem}
                  </div>
                  <div className="text-xs text-gray-400">
                    ID: {job.id}
                  </div>
                </div>
                <div className={`text-sm font-medium ml-2 ${value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatISK(value)}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </PopoverContent>
    </Popover>
  );
};

export default RecapPopover;
