
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';

interface BatchExpenditureHeaderProps {
  onClose: () => void;
}

const BatchExpenditureHeader: React.FC<BatchExpenditureHeaderProps> = ({ onClose }) => {
  return (
    <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-gray-900 border-b border-gray-700 z-10">
      <CardTitle className="text-blue-400">Batch Expenditure Assignment</CardTitle>
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="text-gray-400 hover:text-white"
      >
        <X className="h-4 w-4" />
      </Button>
    </CardHeader>
  );
};

export default BatchExpenditureHeader;
