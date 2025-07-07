import { useState } from 'react';
import { Calendar, Factory, Clock } from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Input } from '@/components/ui/input';
import { IndJob } from '@/lib/types';
import { useJobs } from '@/hooks/useDataService';
import { useToast } from '@/hooks/use-toast';

interface JobCardDetailsProps {
  job: IndJob;
}

const JobCardDetails: React.FC<JobCardDetailsProps> = ({ job }) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValues, setTempValues] = useState<{ [key: string]: string }>({});
  const { updateJob } = useJobs();
  const { toast } = useToast();

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
          <span>{job.id}</span>
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

      {job.billOfMaterials && job.billOfMaterials.length > 0 && (
        <HoverCard>
          <HoverCardTrigger asChild>
            <div
              className="text-sm text-gray-400 mt-2 cursor-pointer hover:text-blue-400"
              data-no-navigate
            >
              BOM: {job.billOfMaterials.length} items (hover to view)
            </div>
          </HoverCardTrigger>
          <HoverCardContent className="w-80 bg-gray-800/50 border-gray-600 text-white">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-blue-400">Bill of Materials</h4>
              <div className="text-xs space-y-1 max-h-48 overflow-y-auto">
                {job.billOfMaterials.map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{item.name}</span>
                    <span className="text-gray-300">{item.quantity.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      )}
    </div>
  );
};

export default JobCardDetails;
