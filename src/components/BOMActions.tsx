
import { Button } from '@/components/ui/button';
import { Import, Upload, Check } from 'lucide-react';
import { IndJob } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useClipboard } from '@/hooks/useClipboard';

interface BOMActionsProps {
  job: IndJob;
  onImportBOM?: (jobId: string, items: { name: string; quantity: number }[]) => void;
}

const BOMActions: React.FC<BOMActionsProps> = ({ job, onImportBOM }) => {
  const { toast } = useToast();
  const { copying, copyToClipboard } = useClipboard();

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

    await copyToClipboard(text, 'bom', 'Bill of materials copied to clipboard');
  };

  return (
    <div className="flex gap-1">
      <Button
        variant="ghost"
        size="sm"
        className="p-1 h-6 w-6"
        onClick={importBillOfMaterials}
        title="Import BOM from clipboard"
        data-no-navigate
      >
        <Import className="w-4 h-4 text-blue-400" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="p-1 h-6 w-6"
        onClick={exportBillOfMaterials}
        disabled={!job.billOfMaterials?.length}
        title="Export BOM to clipboard"
        data-no-navigate
      >
        {copying === 'bom' ? (
          <Check className="w-4 h-4 text-green-400" />
        ) : (
          <Upload className="w-4 h-4 text-blue-400" />
        )}
      </Button>
    </div>
  );
};

export default BOMActions;
