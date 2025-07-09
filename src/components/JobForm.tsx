import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IndJobStatusOptions, IndJobRecordNoId } from '@/lib/pbtypes';
import { IndJob } from '@/lib/types';
import { parseISKAmount } from '@/utils/priceUtils';

interface JobFormProps {
  job?: IndJob;
  onSubmit: (job: IndJobRecordNoId, billOfMaterials?: { name: string; quantity: number }[]) => void;
  onCancel: () => void;
}

const JobForm: React.FC<JobFormProps> = ({ job, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    outputItem: job?.outputItem || '',
    outputQuantity: job?.outputQuantity || 0,
    status: job?.status || IndJobStatusOptions.Planned,
    projectedCost: job?.projectedCost || 0,
    projectedRevenue: job?.projectedRevenue || 0
  });

  const [jobDump, setJobDump] = useState('');
  const [parsedBillOfMaterials, setParsedBillOfMaterials] = useState<{ name: string; quantity: number }[]>([]);

  const parseJobDump = (dumpText: string) => {
    if (!dumpText.trim()) {
      setParsedBillOfMaterials([]);
      return;
    }

    const lines = dumpText.trim().split('\n').filter(line => line.trim());
    
    if (lines.length >= 3) {
      // Parse first line: "Item Name Quantity"
      const firstLine = lines[0].trim();
      const lastSpaceIndex = firstLine.lastIndexOf(' ');
      
      if (lastSpaceIndex > 0) {
        const itemName = firstLine.substring(0, lastSpaceIndex).trim();
        const quantity = parseInt(firstLine.substring(lastSpaceIndex + 1).trim()) || 0;
        
        // Parse cost (second line)
        const cost = parseISKAmount(lines[1].replace(/,/g, ''));
        
        // Parse revenue (third line)
        const revenue = parseISKAmount(lines[2].replace(/,/g, ''));
        
        setFormData(prev => ({
          ...prev,
          outputItem: itemName,
          outputQuantity: quantity,
          projectedCost: cost,
          projectedRevenue: revenue
        }));

        // Parse BOM - everything after the first 3 lines is BOM
        const bomLines = lines.slice(3); // Start from line 4 (index 3)
        const billOfMaterials: { name: string; quantity: number }[] = [];
        
        for (const line of bomLines) {
          const trimmedLine = line.trim();
          if (trimmedLine) {
            const lastSpaceIndex = trimmedLine.lastIndexOf(' ');
            if (lastSpaceIndex > 0) {
              const materialName = trimmedLine.substring(0, lastSpaceIndex).trim();
              const materialQuantity = parseInt(trimmedLine.substring(lastSpaceIndex + 1).trim()) || 0;
              if (materialName && materialQuantity > 0) {
                billOfMaterials.push({ name: materialName, quantity: materialQuantity });
              }
            }
          }
        }
        
        setParsedBillOfMaterials(billOfMaterials);
      }
    }
  };

  const handleJobDumpChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setJobDump(value);
    parseJobDump(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSubmit({
      outputItem: formData.outputItem,
      outputQuantity: formData.outputQuantity,
      status: formData.status,
      projectedCost: formData.projectedCost,
      projectedRevenue: formData.projectedRevenue
    }, parsedBillOfMaterials.length > 0 ? parsedBillOfMaterials : undefined);
  };

  const statusOptions = Object.values(IndJobStatusOptions);

  return (
    <Card className="bg-gray-900 border-gray-700 text-white">
      <CardHeader>
        <CardTitle className="text-blue-400">
          {job ? 'Edit Job' : 'Create New Job'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="itemName" className="text-gray-300">Output Item Name</Label>
              <Input
                id="itemName"
                value={formData.outputItem}
                onChange={(e) => setFormData({
                  ...formData,
                  outputItem: e.target.value
                })}
                className="bg-gray-800 border-gray-600 text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="itemQuantity" className="text-gray-300">Quantity</Label>
              <Input
                id="itemQuantity"
                type="number"
                value={formData.outputQuantity}
                onChange={(e) => setFormData({
                  ...formData,
                  outputQuantity: parseInt(e.target.value) || 0
                })}
                className="bg-gray-800 border-gray-600 text-white"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status" className="text-gray-300">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value as IndJobStatusOptions })}
            >
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status} className="text-white">
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="projectedCost" className="text-gray-300">Projected Cost</Label>
              <Input
                id="projectedCost"
                type="text"
                value={formData.projectedCost ? `${formData.projectedCost.toLocaleString()} ISK` : ''}
                onChange={(e) => setFormData({
                  ...formData,
                  projectedCost: parseISKAmount(e.target.value)
                })}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="projectedRevenue" className="text-gray-300">Projected Revenue</Label>
              <Input
                id="projectedRevenue"
                type="text"
                value={formData.projectedRevenue ? `${formData.projectedRevenue.toLocaleString()} ISK` : ''}
                onChange={(e) => setFormData({
                  ...formData,
                  projectedRevenue: parseISKAmount(e.target.value)
                })}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobDump" className="text-gray-300">Job Dump Import</Label>
            <Textarea
              id="jobDump"
              value={jobDump}
              onChange={handleJobDumpChange}
              placeholder="Paste job dump here:&#10;&#10;Standup Light Guided Bomb 100&#10;285,224,182&#10;771,342,930&#10;&#10;Megacyte 37&#10;Zydrine 84&#10;..."
              className="bg-gray-800 border-gray-600 text-white min-h-[120px]"
              rows={6}
            />
            {parsedBillOfMaterials.length > 0 && (
              <div className="text-sm text-gray-400">
                <p>Parsed {parsedBillOfMaterials.length} materials from dump</p>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
              {job ? 'Update Job' : 'Create Job'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="border-gray-600 hover:bg-gray-800"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default JobForm;
