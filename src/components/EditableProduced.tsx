
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { IndJob } from '@/lib/types';

interface EditableProducedProps {
  job: IndJob;
  onUpdateProduced?: (jobId: string, produced: number) => void;
}

const EditableProduced: React.FC<EditableProducedProps> = ({ job, onUpdateProduced }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(job.produced?.toString() || '0');

  const handleUpdate = () => {
    const newValue = parseInt(value);
    if (!isNaN(newValue) && onUpdateProduced) {
      onUpdateProduced(job.id, newValue);
      setIsEditing(false);
    } else {
      setValue(job.produced?.toString() || '0');
      setIsEditing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUpdate();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setValue(job.produced?.toString() || '0');
    }
  };

  const handleClick = () => {
    if (job.status !== 'Closed') {
      setIsEditing(true);
    }
  };

  if (isEditing && job.status !== 'Closed') {
    return (
      <Input
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleUpdate}
        onKeyDown={handleKeyPress}
        className="w-24 h-5 px-2 py-0 inline-block bg-gray-800 border-gray-600 text-white text-xs leading-5"
        min="0"
        autoFocus
        data-no-navigate
      />
    );
  }

  return (
    <span
      onClick={handleClick}
      className={`inline-block w-20 h-5 leading-5 text-left ${job.status !== 'Closed' ? "cursor-pointer hover:text-blue-400" : ""}`}
      title={job.status !== 'Closed' ? "Click to edit" : undefined}
      data-no-navigate
    >
      {(job.produced || 0).toLocaleString()}
    </span>
  );
};

export default EditableProduced;
