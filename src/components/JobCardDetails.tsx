import { useState, useEffect } from 'react';
import { Calendar, Factory, Clock, Copy, DollarSign } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { IndJob } from '@/lib/types';
import { useJobs } from '@/hooks/useDataService';
import { useToast } from '@/hooks/use-toast';
import { useClipboard } from '@/hooks/useClipboard';
import { formatISK } from '@/utils/priceUtils';

interface JobCardDetailsProps {
  job: IndJob;
}

const JobCardDetails: React.FC<JobCardDetailsProps> = ({ job }) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValues, setTempValues] = useState<{ [key: string]: string }>({});
  const { updateJob } = useJobs();
  const { toast } = useToast();

  const { copying, copyToClipboard } = useClipboard();

  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleString('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(',', '');
  };

  const roundToSignificantDigits = (num: number, digits: number = 4): number => {
    if (num === 0) return 0;
    const magnitude = Math.floor(Math.log10(Math.abs(num)));
    const factor = Math.pow(10, digits - 1 - magnitude);
    return Math.round(num * factor) / factor;
  };

  const handleFieldClick = (fieldName: string, currentValue: string | null, e: React.MouseEvent) => {
    setEditingField(fieldName);
    setTempValues({ ...tempValues, [fieldName]: currentValue || '' });
  };

  const handleJobIdClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await copyToClipboard(job.id, 'id', 'Job ID copied to clipboard');
  };

  const handleFieldUpdate = async (fieldName: string, value: string) => {
    try {
      const dateValue = value ? new Date(value).toISOString() : null;
      await updateJob(job.id, { [fieldName]: dateValue });
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

  const formatDateForInput = (dateString: string | null | undefined) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().slice(0, 16);
  };

  const handleBlur = (fieldName: string) => {
    const value = tempValues[fieldName];
    if (value !== (job[fieldName as keyof IndJob] || '')) {
      handleFieldUpdate(fieldName, value);
    } else {
      setEditingField(null);
    }
  };

  const handleClick = (fieldName: string, value: string | null, e: React.MouseEvent) => {
    e.stopPropagation();
    // Allow editing regardless of whether value exists or not
    setEditingField(fieldName);
    setTempValues({ ...tempValues, [fieldName]: formatDateForInput(value) });
  };

  const DateField = ({ label, value, fieldName, icon }: { label: string; value: string | null; fieldName: string; icon: React.ReactNode }) => (
    <>
      <div className="flex items-center gap-2 text-sm text-gray-400">
        {icon}
        <span>{label}:</span>
      </div>
      <div className="flex items-center">
        {editingField === fieldName ? (
          <Input
            type="datetime-local"
            value={tempValues[fieldName] || ''}
            onChange={(e) => setTempValues({ ...tempValues, [fieldName]: e.target.value })}
            onBlur={() => handleBlur(fieldName)}
            onKeyDown={(e) => handleKeyPress(fieldName, e)}
            className="h-6 px-2 py-1 bg-gray-800 border-gray-600 text-white text-sm w-full"
            autoFocus
            data-no-navigate
          />
        ) : (
          <span
            onClick={(e) => handleClick(fieldName, value, e)}
            className="cursor-pointer hover:text-blue-400 h-6 flex items-center text-white text-sm w-full"
            title="Click to edit"
            data-no-navigate
          >
            {formatDateTime(value)}
          </span>
        )}
      </div>
    </>
  );

  return (
    <div className="flex-shrink-0">
      <div className="grid gap-x-4 gap-y-2" style={{ gridTemplateColumns: 'auto 1fr auto 1fr' }}>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Factory className="w-4 h-4" />
          <span>Job ID:</span>
        </div>
        <div className="flex items-center gap-1">
          <span
            className="cursor-pointer hover:text-blue-400 transition-colors inline-flex items-center gap-1 text-sm text-white"
            onClick={handleJobIdClick}
            title="Click to copy job ID"
            data-no-navigate
          >
            {job.id}
            {copying === 'id' && <Copy className="w-3 h-3 text-green-400" />}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>Created:</span>
        </div>
        <div className="text-sm text-white">
          {formatDateTime(job.created)}
        </div>

        <DateField
          label="Start"
          value={job.jobStart}
          fieldName="jobStart"
          icon={<Clock className="w-4 h-4" />}
        />

        <DateField
          label="End"
          value={job.jobEnd}
          fieldName="jobEnd"
          icon={<Clock className="w-4 h-4" />}
        />

        <DateField
          label="Sale Start"
          value={job.saleStart}
          fieldName="saleStart"
          icon={<Calendar className="w-4 h-4" />}
        />

        <DateField
          label="Sale End"
          value={job.saleEnd}
          fieldName="saleEnd"
          icon={<Calendar className="w-4 h-4" />}
        />
      </div>

      {job.projectedRevenue > 0 && job.produced > 0 && (
        <div className="mt-2">
          <PriceDisplay job={job} />
        </div>
      )}
    </div>
  );
};

interface PriceDisplayProps {
  job: IndJob;
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({ job }) => {
  const { copying, copyToClipboard } = useClipboard();
  const [salesTax, setSalesTax] = useState(() => parseFloat(localStorage.getItem('salesTax') || '0') / 100);

  // Listen for storage changes to update tax rate
  useEffect(() => {
    const handleStorageChange = () => {
      setSalesTax(parseFloat(localStorage.getItem('salesTax') || '0') / 100);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const roundToSignificantDigits = (num: number, digits: number = 4): number => {
    if (num === 0) return 0;
    const magnitude = Math.floor(Math.log10(Math.abs(num)));
    const factor = Math.pow(10, digits - 1 - magnitude);
    return Math.round(num * factor) / factor;
  };

  // Calculate total costs and income
  const totalCosts = job.expenditures?.reduce((sum, tx) => sum + tx.totalPrice, 0) || 0;
  const totalIncome = job.income?.reduce((sum, tx) => sum + tx.totalPrice, 0) || 0;
  const itemsSold = job.income?.reduce((sum, tx) => sum + tx.quantity, 0) || 0;
  const itemsRemaining = (job.produced || 0) - itemsSold;

  // Original calculations (based on full revenue and costs)
  const targetPricePerUnit = job.projectedRevenue / job.produced;
  const targetPriceWithTax = roundToSignificantDigits(targetPricePerUnit * (1 + salesTax));

  const breakEvenPricePerUnit = totalCosts / job.produced;
  const breakEvenPriceWithTax = roundToSignificantDigits(breakEvenPricePerUnit * (1 + salesTax));

  // Adjusted calculations (based on remaining revenue and uncovered costs)
  const remainingRevenue = job.projectedRevenue - totalIncome;
  const uncoveredCosts = totalCosts - totalIncome;

  const adjustedTargetPricePerUnit = itemsRemaining > 0 ? remainingRevenue / itemsRemaining : 0;
  const adjustedTargetPriceWithTax = roundToSignificantDigits(adjustedTargetPricePerUnit * (1 + salesTax));

  const adjustedBreakEvenPricePerUnit = itemsRemaining > 0 ? Math.max(0, uncoveredCosts / itemsRemaining) : 0;
  const adjustedBreakEvenPriceWithTax = roundToSignificantDigits(adjustedBreakEvenPricePerUnit * (1 + salesTax));

  const handleCopyTargetPrice = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await copyToClipboard(
      targetPriceWithTax.toString(),
      'targetPrice',
      'Target price copied to clipboard'
    );
  };

  const handleCopyBreakEvenPrice = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await copyToClipboard(
      breakEvenPriceWithTax.toString(),
      'breakEvenPrice',
      'Break-even price copied to clipboard'
    );
  };

  const handleCopyAdjustedTargetPrice = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await copyToClipboard(
      adjustedTargetPriceWithTax.toString(),
      'adjustedTargetPrice',
      'Adjusted target price copied to clipboard'
    );
  };

  const handleCopyAdjustedBreakEvenPrice = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await copyToClipboard(
      adjustedBreakEvenPriceWithTax.toString(),
      'adjustedBreakEvenPrice',
      'Adjusted break-even price copied to clipboard'
    );
  };

  const taxSuffix = salesTax > 0 ? ` (+${(salesTax * 100).toFixed(1)}% tax)` : '';

  return (
    <div className="grid gap-x-4 gap-y-2 text-sm" style={{ gridTemplateColumns: '1fr 1fr' }}>
      <div className="flex items-center gap-2 text-gray-400 justify-center">
        <Factory className="w-4 h-4" />
        <span>Target Price{taxSuffix}:</span>
      </div>
      <div className="flex items-center gap-2 text-gray-400 justify-center">
        <DollarSign className="w-4 h-4" />
        <span>Break-even{taxSuffix}:</span>
      </div>

      <div className="flex items-center gap-1 text-lg justify-center">
        <span
          className="cursor-pointer hover:text-blue-400 transition-colors inline-flex items-center gap-1 text-white"
          onClick={handleCopyTargetPrice}
          title="Click to copy target price per unit (based on projected revenue)"
          data-no-navigate
        >
          {formatISK(targetPriceWithTax)}
          {copying === 'targetPrice' && <Copy className="w-3 h-3 text-green-400" />}
        </span>
      </div>
      <div className="flex items-center gap-1 text-lg justify-center">
        <span
          className="cursor-pointer hover:text-yellow-400 transition-colors inline-flex items-center gap-1 text-white"
          onClick={handleCopyBreakEvenPrice}
          title="Click to copy break-even price per unit (based on actual costs)"
          data-no-navigate
        >
          {formatISK(breakEvenPriceWithTax)}
          {copying === 'breakEvenPrice' && <Copy className="w-3 h-3 text-green-400" />}
        </span>
      </div>

      <div className="flex items-center gap-2 text-gray-400 justify-center">
        <Factory className="w-4 h-4" />
        <span>Adjusted Target{taxSuffix}:</span>
      </div>
      <div className="flex items-center gap-2 text-gray-400 justify-center">
        <DollarSign className="w-4 h-4" />
        <span>Adjusted Break-even{taxSuffix}:</span>
      </div>
      
      <div className="flex items-center gap-1 text-lg justify-center">
        <span
          className="cursor-pointer hover:text-blue-400 transition-colors inline-flex items-center gap-1 text-white"
          onClick={handleCopyAdjustedTargetPrice}
          title="Click to copy adjusted target price per unit (based on remaining revenue)"
          data-no-navigate
        >
          {formatISK(adjustedTargetPriceWithTax)}
          {copying === 'adjustedTargetPrice' && <Copy className="w-3 h-3 text-green-400" />}
        </span>
      </div>
      <div className="flex items-center gap-1 text-lg justify-center">
        <span
          className="cursor-pointer hover:text-yellow-400 transition-colors inline-flex items-center gap-1 text-white"
          onClick={handleCopyAdjustedBreakEvenPrice}
          title="Click to copy adjusted break-even price per unit (based on uncovered costs)"
          data-no-navigate
        >
          {formatISK(adjustedBreakEvenPriceWithTax)}
          {copying === 'adjustedBreakEvenPrice' && <Copy className="w-3 h-3 text-green-400" />}
        </span>
      </div>
    </div>
  );
};

export default JobCardDetails;
