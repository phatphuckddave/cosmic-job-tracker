
import { CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { IndJob } from '@/lib/types';
import { useClipboard } from '@/hooks/useClipboard';
import JobStatusDropdown from './JobStatusDropdown';
import BOMActions from './BOMActions';
import EditableProduced from './EditableProduced';

interface JobCardHeaderProps {
  job: IndJob;
  onEdit: (job: any) => void;
  onDelete: (jobId: string) => void;
  onUpdateProduced?: (jobId: string, produced: number) => void;
  onImportBOM?: (jobId: string, items: { name: string; quantity: number }[]) => void;
}

const JobCardHeader: React.FC<JobCardHeaderProps> = ({
  job,
  onEdit,
  onDelete,
  onUpdateProduced,
  onImportBOM
}) => {
  const { copying, copyToClipboard } = useClipboard();

  const sortedIncome = [...job.income].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const itemsSold = sortedIncome.reduce((sum, tx) => sum + tx.quantity, 0);

  const handleJobNameClick = async (e: React.MouseEvent) => {
    await copyToClipboard(job.outputItem, 'name', 'Job name copied to clipboard');
  };

  return (
    <div className="flex justify-between items-start">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <CardTitle
            className="text-blue-400 truncate cursor-pointer hover:text-blue-300 transition-colors flex items-center gap-1 leading-normal"
            onClick={handleJobNameClick}
            title="Click to copy job name"
            data-no-navigate
            style={{ lineHeight: '1.4' }}
          >
            {job.outputItem}
            {copying === 'name' && <Copy className="w-4 h-4 text-green-400" />}
          </CardTitle>
        </div>
        <div className="text-gray-400 text-sm leading-relaxed" style={{ lineHeight: '1.4' }}>
          <div className="mb-1">
            Runs: {job.outputQuantity.toLocaleString()}
            <span className="ml-4">
              Produced: <EditableProduced job={job} onUpdateProduced={onUpdateProduced} />
            </span>
            <span className="ml-4">
              Sold: <span className="text-green-400">{itemsSold.toLocaleString()}</span>
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2 flex-shrink-0 items-end">
        <div className="flex items-center gap-2">
          <JobStatusDropdown job={job} />
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(job)}
            className="border-gray-600 hover:bg-gray-800"
            data-no-navigate
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(job.id)}
            data-no-navigate
          >
            Delete
          </Button>
        </div>
        <BOMActions job={job} onImportBOM={onImportBOM} />
      </div>
    </div>
  );
};

export default JobCardHeader;
