import { useState } from 'react';
import { formatISK, parseISKAmount } from '@/utils/priceUtils';
import { IndJob } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { useJobs } from '@/hooks/useDataService';
import { useToast } from '@/hooks/use-toast';
import { BarChart3 } from 'lucide-react';
import JobTransactionPopover from './JobTransactionPopover';
import TransactionChart from './TransactionChart';
import { useJobCardMetrics } from '@/hooks/useJobCardMetrics';

interface JobCardMetricsProps {
  job: IndJob;
}

const JobCardMetrics: React.FC<JobCardMetricsProps> = ({ job }) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValues, setTempValues] = useState<{ [key: string]: string }>({});
  const [chartModal, setChartModal] = useState<{ type: 'costs' | 'revenue' | 'profit'; isOpen: boolean }>({ type: 'costs', isOpen: false });
  const { updateJob } = useJobs();
  const { toast } = useToast();

  // Use optimized hook for all expensive calculations
  const {
    sortedExpenditures,
    sortedIncome,
    totalExpenditure,
    totalIncome,
    profit,
    margin,
    itemsSold,
    produced,
    showPerformanceIndicator,
    performancePercentage
  } = useJobCardMetrics(job);

  const handleFieldClick = (fieldName: string, currentValue: number, e: React.MouseEvent) => {
    e.stopPropagation();
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

  const openChart = (type: 'costs' | 'revenue' | 'profit', e: React.MouseEvent) => {
    e.stopPropagation();
    setChartModal({ type, isOpen: true });
  };

  const closeChart = () => {
    setChartModal({ type: 'costs', isOpen: false });
  };

  return (
    <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-700/50 flex-shrink-0">
      <div className="text-center space-y-1">
        <div className="text-xs font-medium text-red-400 uppercase tracking-wide flex items-center justify-center gap-1">
          Costs
          <button 
            className="hover:text-red-300 transition-colors" 
            onClick={(e) => openChart('costs', e)}
            data-no-navigate
          >
            <BarChart3 className="w-4 h-4" />
          </button>
        </div>
        <JobTransactionPopover job={job} type="costs">
          <div className="text-lg font-bold text-red-400 cursor-pointer hover:text-red-300 transition-colors" data-no-navigate>
            {formatISK(totalExpenditure)}
          </div>
        </JobTransactionPopover>
        {job.projectedCost > 0 && (
          <div className="text-xs text-gray-400 space-y-1">
            <div>vs {editingField === 'projectedCost' ? (
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
            )}</div>
            <div
              className={`text-xs font-medium px-2 py-0.5 rounded-full inline-block ${totalExpenditure <= job.projectedCost
                  ? 'bg-green-900/50 text-green-400'
                  : 'bg-red-900/50 text-red-400'
                }`}
              title={`Cost efficiency: ${((totalExpenditure / job.projectedCost) * 100).toFixed(1)}% of projected cost`}
            >
              {totalExpenditure <= job.projectedCost ? '✅' : '⚠️'} {((totalExpenditure / job.projectedCost) * 100).toFixed(0)}%
            </div>
          </div>
        )}
      </div>
      <div className="text-center space-y-1">
        <div className="text-xs font-medium text-green-400 uppercase tracking-wide flex items-center justify-center gap-1">
          Revenue
          <button 
            className="hover:text-green-300 transition-colors" 
            onClick={(e) => openChart('revenue', e)}
            data-no-navigate
          >
            <BarChart3 className="w-4 h-4" />
          </button>
        </div>
        <JobTransactionPopover job={job} type="revenue">
          <div className="text-lg font-bold text-green-400 cursor-pointer hover:text-green-300 transition-colors" data-no-navigate>
            {formatISK(totalIncome)}
          </div>
        </JobTransactionPopover>
        {job.projectedRevenue > 0 && (
          <div className="text-xs text-gray-400 space-y-1">
            <div>vs {editingField === 'projectedRevenue' ? (
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
            )}</div>
            <div className="flex justify-center gap-2">
              <div
                className={`text-xs font-medium px-2 py-0.5 rounded-full inline-block ${totalIncome >= job.projectedRevenue
                    ? 'bg-green-900/50 text-green-400'
                    : 'bg-yellow-900/50 text-yellow-400'
                  }`}
                title={`Revenue progress: ${((totalIncome / job.projectedRevenue) * 100).toFixed(1)}% of projected revenue`}
              >
                {totalIncome >= job.projectedRevenue ? '🎯' : '📊'} {((totalIncome / job.projectedRevenue) * 100).toFixed(0)}%
              </div>
              {showPerformanceIndicator && (
                <div
                  className={`text-xs font-medium px-2 py-0.5 rounded-full inline-block ${performancePercentage >= 100
                      ? 'bg-green-900/50 text-green-400'
                      : performancePercentage >= 90
                        ? 'bg-yellow-900/50 text-yellow-400'
                        : 'bg-red-900/50 text-red-400'
                    }`}
                  title={`Price performance: ${formatISK(totalIncome / itemsSold)}/unit vs ${formatISK(job.projectedRevenue / produced)}/unit expected (${performancePercentage.toFixed(1)}%)`}
                >
                  {performancePercentage >= 100 ? '📈' : performancePercentage >= 90 ? '⚠️' : '📉'} {performancePercentage.toFixed(0)}%
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="text-center space-y-1">
        <div className="text-xs font-medium text-gray-300 uppercase tracking-wide flex items-center justify-center gap-1">
          Profit
          <button 
            className="hover:text-gray-100 transition-colors" 
            onClick={(e) => openChart('profit', e)}
            data-no-navigate
          >
            <BarChart3 className="w-4 h-4" />
          </button>
        </div>
        <JobTransactionPopover job={job} type="profit">
          <div className={`text-lg font-bold cursor-pointer transition-colors ${profit >= 0 ? 'text-green-400 hover:text-green-300' : 'text-red-400 hover:text-red-300'}`} data-no-navigate>
            {formatISK(profit)}
          </div>
        </JobTransactionPopover>
        <div className={`text-xs font-medium ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {margin.toFixed(1)}% margin
        </div>
        {job.projectedRevenue > 0 && job.projectedCost > 0 && (
          <div className="text-xs text-gray-400">
            vs {formatISK(job.projectedRevenue - job.projectedCost)}
          </div>
        )}
      </div>
      
      <TransactionChart
        job={job}
        type={chartModal.type}
        isOpen={chartModal.isOpen}
        onClose={closeChart}
      />
    </div>
  );
};

export default JobCardMetrics;