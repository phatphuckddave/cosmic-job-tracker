
import { Button } from '@/components/ui/button';
import { Plus, FileText, ShoppingCart } from 'lucide-react';
import SalesTaxConfig from './SalesTaxConfig';

interface JobsToolbarProps {
  onNewJob: () => void;
  onBatchIncome: () => void;
  onBatchExpenditure: () => void;
}

const JobsToolbar = ({ onNewJob, onBatchIncome, onBatchExpenditure }: JobsToolbarProps) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-bold text-white">Jobs</h2>
      <div className="flex gap-2">
        <SalesTaxConfig />
        <Button
          variant="outline"
          onClick={onBatchIncome}
          className="border-gray-600 hover:bg-gray-800"
        >
          <FileText className="w-4 h-4 mr-2" />
          Batch Income
        </Button>
        <Button
          variant="outline"
          onClick={onBatchExpenditure}
          className="border-gray-600 hover:bg-gray-800"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Batch Expenditure
        </Button>
        <Button
          onClick={onNewJob}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Job
        </Button>
      </div>
    </div>
  );
};

export default JobsToolbar;
