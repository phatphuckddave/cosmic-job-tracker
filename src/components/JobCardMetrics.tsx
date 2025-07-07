import { useState } from 'react';
import { formatISK, parseISKAmount } from '@/utils/priceUtils';
import { IndJob } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { useJobs } from '@/hooks/useDataService';
import { useToast } from '@/hooks/use-toast';

interface JobCardMetricsProps {
  job: IndJob;
}

const JobCardMetrics: React.FC<JobCardMetricsProps> = ({ job }) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValues, setTempValues] = useState<{ [key: string]: string }>({});
  const { updateJob } = useJobs();
  const { toast } = useToast();

  const sortedExpenditures = [...job.expenditures].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const sortedIncome = [...job.income].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const totalExpenditure = sortedExpenditures.reduce((sum, tx) => sum + tx.totalPrice, 0);
  const totalIncome = sortedIncome.reduce((sum, tx) => sum + tx.totalPrice, 0);
  const profit = totalIncome - totalExpenditure;
  const margin = totalIncome > 0 ? ((profit / totalIncome) * 100) : 0;

  const handleFieldClick = (fieldName: string, currentValue: number, e: React.MouseEvent) => {
    setEditingField(fieldName);
    setTempValues({ ...tempValues, [fieldName]: formatISK(currentValue) });
  };

  const handleFieldUpdate = async (fieldName: string, value: string) => {
    try {
      const numericValue = parseISKAmount(value);
      await updateJob(job.id, { [fieldName]: numericValue });
      setEditingField(null);
      toast({
        title: "Updated",
        description: `${fieldName} updated successfully`,
        duration: 2000,
      });
    } catch (error) {
      console.error('Error updating field:', error);
      toast({
        title: "Error",
        description: "Failed to update field",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  const handleKeyPress = (fieldName: string, e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleFieldUpdate(fieldName, tempValues[fieldName]);
    } else if (e.key === 'Escape') {
      setEditingField(null);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-700/50 flex-shrink-0">
      <div className="text-center space-y-1">
        <div className="text-xs font-medium text-red-400 uppercase tracking-wide">Costs</div>
        <div className="text-lg font-bold text-red-400">{formatISK(totalExpenditure)}</div>
        {job.projectedCost > 0 && (
          <div className="text-xs text-gray-400">
            vs {editingField === 'projectedCost' ? (
              <Input
                value={tempValues.projectedCost || ''}
                onChange={(e) => setTempValues({ ...tempValues, projectedCost: e.target.value })}
                onBlur={() => handleFieldUpdate('projectedCost', tempValues.projectedCost)}
                onKeyDown={(e) => handleKeyPress('projectedCost', e)}
                className="w-24 h-6 px-2 py-1 inline-block bg-gray-800 border-gray-600 text-white text-xs"
                autoFocus
                data-no-navigate
              />
            ) : (
              <span
                onClick={(e) => handleFieldClick('projectedCost', job.projectedCost, e)}
                className="cursor-pointer hover:text-blue-400"
                title="Click to edit"
                data-no-navigate
              >
                {formatISK(job.projectedCost)}
              </span>
            )}
            <div className={`text-xs font-medium ${totalExpenditure <= job.projectedCost ? 'text-green-400' : 'text-red-400'}`}>
              {((totalExpenditure / job.projectedCost) * 100).toFixed(0)}%
            </div>
          </div>
        )}
      </div>
      <div className="text-center space-y-1">
        <div className="text-xs font-medium text-green-400 uppercase tracking-wide">Revenue</div>
        <div className="text-lg font-bold text-green-400">{formatISK(totalIncome)}</div>
        {job.projectedRevenue > 0 && (
          <div className="text-xs text-gray-400">
            vs {editingField === 'projectedRevenue' ? (
              <Input
                value={tempValues.projectedRevenue || ''}
                onChange={(e) => setTempValues({ ...tempValues, projectedRevenue: e.target.value })}
                onBlur={() => handleFieldUpdate('projectedRevenue', tempValues.projectedRevenue)}
                onKeyDown={(e) => handleKeyPress('projectedRevenue', e)}
                className="w-24 h-6 px-2 py-1 inline-block bg-gray-800 border-gray-600 text-white text-xs"
                autoFocus
                data-no-navigate
              />
            ) : (
              <span
                onClick={(e) => handleFieldClick('projectedRevenue', job.projectedRevenue, e)}
                className="cursor-pointer hover:text-blue-400"
                title="Click to edit"
                data-no-navigate
              >
                {formatISK(job.projectedRevenue)}
              </span>
            )}
            <div className={`text-xs font-medium ${totalIncome >= job.projectedRevenue ? 'text-green-400' : 'text-red-400'}`}>
              {((totalIncome / job.projectedRevenue) * 100).toFixed(0)}%
            </div>
          </div>
        )}
      </div>
      <div className="text-center space-y-1">
        <div className="text-xs font-medium text-gray-300 uppercase tracking-wide">Profit</div>
        <div className={`text-lg font-bold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {formatISK(profit)}
        </div>
        <div className={`text-xs font-medium ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {margin.toFixed(1)}% margin
        </div>
        {job.projectedRevenue > 0 && job.projectedCost > 0 && (
          <div className="text-xs text-gray-400">
            vs {formatISK(job.projectedRevenue - job.projectedCost)}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobCardMetrics;
