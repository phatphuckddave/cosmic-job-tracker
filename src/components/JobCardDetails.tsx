import { useState, useEffect } from 'react';
import { Calendar, Factory, Clock, Copy } from 'lucide-react';
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

  const DateField = ({ label, value, fieldName, icon }: { label: string; value: string | null; fieldName: string; icon: React.ReactNode }) => (
    <div className="flex items-center gap-2 text-sm text-gray-400">
      {icon}
      <span className="w-16">{label}:</span>
      {editingField === fieldName ? (
        <Input
          type="datetime-local"
          value={tempValues[fieldName] || ''}
          onChange={(e) => setTempValues({ ...tempValues, [fieldName]: e.target.value })}
          onBlur={() => handleFieldUpdate(fieldName, tempValues[fieldName])}
          onKeyDown={(e) => handleKeyPress(fieldName, e)}
          className="h-6 px-2 py-1 bg-gray-800 border-gray-600 text-white text-xs flex-1 min-w-0"
          autoFocus
          data-no-navigate
        />
      ) : (
        <span
          onClick={(e) => handleFieldClick(fieldName, value, e)}
          className="cursor-pointer hover:text-blue-400 flex-1 min-w-0 h-6 flex items-center"
          title="Click to edit"
          data-no-navigate
        >
          {formatDateTime(value)}
        </span>
      )}
    </div>
  );

  return (
    <div className="flex-shrink-0">
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Factory className="w-4 h-4" />
          <span className="w-16">Job ID:</span>
          <span
            className="cursor-pointer hover:text-blue-400 transition-colors inline-flex items-center gap-1"
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
          <span className="w-16">Created:</span>
          <span>{formatDateTime(job.created)}</span>
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
          <MinPriceDisplay job={job} />
        </div>
      )}
    </div>
  );
};

interface MinPriceDisplayProps {
  job: IndJob;
}

const MinPriceDisplay: React.FC<MinPriceDisplayProps> = ({ job }) => {
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
  
  const minPricePerUnit = job.projectedRevenue / job.produced;
  const minPriceWithTax = minPricePerUnit * (1 + salesTax);
  
  const handleCopyPrice = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await copyToClipboard(
      minPriceWithTax.toFixed(2), 
      'minPrice', 
      'Minimum price copied to clipboard'
    );
  };

  return (
    <div className="flex items-center gap-2 text-sm text-gray-400">
      <Factory className="w-4 h-4" />
      <span className="w-16">Min Price:</span>
      <span
        className="cursor-pointer hover:text-blue-400 transition-colors inline-flex items-center gap-1"
        onClick={handleCopyPrice}
        title="Click to copy minimum price per unit"
        data-no-navigate
      >
        {formatISK(minPriceWithTax)}
        {copying === 'minPrice' && <Copy className="w-3 h-3 text-green-400" />}
      </span>
      <span className="text-xs text-gray-500">
        per unit {salesTax > 0 && `(+${(salesTax * 100).toFixed(1)}% tax)`}
      </span>
    </div>
  );
};

export default JobCardDetails;
