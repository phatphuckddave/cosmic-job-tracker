import { useState } from 'react';
import { CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Import, Upload, Check, Copy } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { IndJob } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useJobs } from '@/hooks/useDataService';

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
  const [isEditingProduced, setIsEditingProduced] = useState(false);
  const [producedValue, setProducedValue] = useState(job.produced?.toString() || '0');
  const [copyingBom, setCopyingBom] = useState(false);
  const [copyingName, setCopyingName] = useState(false);
  const { toast } = useToast();
  const { updateJob } = useJobs();

  const statuses = ['Planned', 'Acquisition', 'Running', 'Done', 'Selling', 'Closed', 'Tracked'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Planned': return 'bg-gray-600';
      case 'Acquisition': return 'bg-yellow-600';
      case 'Running': return 'bg-blue-600';
      case 'Done': return 'bg-purple-600';
      case 'Selling': return 'bg-orange-600';
      case 'Closed': return 'bg-green-600';
      case 'Tracked': return 'bg-cyan-600';
      default: return 'bg-gray-600';
    }
  };

  const handleStatusChange = async (newStatus: string, e: React.MouseEvent) => {
    try {
      await updateJob(job.id, { status: newStatus });
      toast({
        title: "Status Updated",
        description: `Job status changed to ${newStatus}`,
        duration: 2000,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  const handleProducedUpdate = () => {
    const newValue = parseInt(producedValue);
    if (!isNaN(newValue) && onUpdateProduced) {
      onUpdateProduced(job.id, newValue);
      setIsEditingProduced(false);
    } else {
      setProducedValue(job.produced?.toString() || '0');
      setIsEditingProduced(false);
    }
  };

  const handleProducedKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleProducedUpdate();
    } else if (e.key === 'Escape') {
      setIsEditingProduced(false);
      setProducedValue(job.produced?.toString() || '0');
    }
  };

  const importBillOfMaterials = async () => {
    if (!onImportBOM) {
      toast({
        title: "Error",
        description: "Import functionality is not available",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    try {
      const clipboardText = await navigator.clipboard.readText();
      const lines = clipboardText.split('\n').filter(line => line.trim());
      const items: { name: string; quantity: number }[] = [];

      for (const line of lines) {
        const parts = line.trim().split(/[\s\t]+/);
        if (parts.length >= 2) {
          const name = parts.slice(0, -1).join(' ');
          const quantityPart = parts[parts.length - 1].replace(/,/g, '');
          const quantity = parseInt(quantityPart);
          if (name && !isNaN(quantity)) {
            items.push({ name, quantity });
          }
        }
      }

      if (items.length > 0) {
        onImportBOM(job.id, items);
        toast({
          title: "BOM Imported",
          description: `Successfully imported ${items.length} items`,
          duration: 3000,
        });
      } else {
        toast({
          title: "No Valid Items",
          description: "No valid items found in clipboard. Format: 'Item Name Quantity' per line",
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to read from clipboard",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  const exportBillOfMaterials = async () => {
    if (!job.billOfMaterials?.length) {
      toast({
        title: "Nothing to Export",
        description: "No bill of materials found for this job",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    const text = job.billOfMaterials
      .map(item => `${item.name}\t${item.quantity.toLocaleString()}`)
      .join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopyingBom(true);
      toast({
        title: "Exported!",
        description: "Bill of materials copied to clipboard",
        duration: 2000,
      });
      setTimeout(() => setCopyingBom(false), 1000);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  const handleJobNameClick = async (e: React.MouseEvent) => {
    try {
      await navigator.clipboard.writeText(job.outputItem);
      setCopyingName(true);
      toast({
        title: "Copied!",
        description: "Job name copied to clipboard",
        duration: 2000,
      });
      setTimeout(() => setCopyingName(false), 1000);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  const handleProducedClick = (e: React.MouseEvent) => {
    if (job.status !== 'Closed') {
      setIsEditingProduced(true);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    onEdit(job);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    onDelete(job.id);
  };

  const handleImportClick = (e: React.MouseEvent) => {
    importBillOfMaterials();
  };

  const handleExportClick = (e: React.MouseEvent) => {
    exportBillOfMaterials();
  };

  const sortedIncome = [...job.income].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const itemsSold = sortedIncome.reduce((sum, tx) => sum + tx.quantity, 0);

  return (
    <div className="flex justify-between items-start">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <CardTitle
            className="text-blue-400 truncate cursor-pointer hover:text-blue-300 transition-colors flex items-center gap-1"
            onClick={handleJobNameClick}
            title="Click to copy job name"
            data-no-navigate
          >
            {job.outputItem}
            {copyingName && <Copy className="w-4 h-4 text-green-400" />}
          </CardTitle>
        </div>
        <p className="text-gray-400 text-sm">
          Quantity: {job.outputQuantity.toLocaleString()}
          <span className="ml-4">
            Produced: {
              isEditingProduced && job.status !== 'Closed' ? (
                <Input
                  type="number"
                  value={producedValue}
                  onChange={(e) => setProducedValue(e.target.value)}
                  onBlur={handleProducedUpdate}
                  onKeyDown={handleProducedKeyPress}
                  className="w-24 h-5 px-2 py-0 inline-block bg-gray-800 border-gray-600 text-white text-xs leading-5"
                  min="0"
                  autoFocus
                  data-no-navigate
                />
              ) : (
                <span
                  onClick={handleProducedClick}
                  className={`inline-block min-w-[96px] h-5 leading-5 ${job.status !== 'Closed' ? "cursor-pointer hover:text-blue-400" : ""}`}
                  title={job.status !== 'Closed' ? "Click to edit" : undefined}
                  data-no-navigate
                >
                  {(job.produced || 0).toLocaleString()}
                </span>
              )
            }
          </span>
          <span className="ml-4">
            Sold: <span className="text-green-400">{itemsSold.toLocaleString()}</span>
          </span>
        </p>
      </div>
      <div className="flex flex-col gap-2 flex-shrink-0 items-end">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div
                className={`${getStatusColor(job.status)} text-white px-3 py-1 rounded-sm text-xs font-semibold cursor-pointer hover:opacity-80 transition-opacity`}
                data-no-navigate
              >
                {job.status}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-800/50 border-gray-600 text-white">
              {statuses.map((status) => (
                <DropdownMenuItem
                  key={status}
                  onClick={(e) => handleStatusChange(status, e)}
                  className="hover:bg-gray-700 cursor-pointer"
                  data-no-navigate
                >
                  <div className={`w-3 h-3 rounded-sm ${getStatusColor(status)} mr-2`} />
                  {status}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            size="sm"
            onClick={handleEditClick}
            className="border-gray-600 hover:bg-gray-800"
            data-no-navigate
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteClick}
            data-no-navigate
          >
            Delete
          </Button>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="p-1 h-6 w-6"
            onClick={handleImportClick}
            title="Import BOM from clipboard"
            data-no-navigate
          >
            <Import className="w-4 h-4 text-blue-400" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="p-1 h-6 w-6"
            onClick={handleExportClick}
            disabled={!job.billOfMaterials?.length}
            title="Export BOM to clipboard"
            data-no-navigate
          >
            {copyingBom ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Upload className="w-4 h-4 text-blue-400" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JobCardHeader;
