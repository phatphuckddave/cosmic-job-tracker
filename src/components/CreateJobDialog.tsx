import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { IndJob, IndJobStatusOptions } from '@/types';
import { Plus } from 'lucide-react';

interface CreateJobDialogProps {
  onCreateJob: (job: Omit<IndJob, 'id' | 'created' | 'updated'>) => void;
}

export function CreateJobDialog({ onCreateJob }: CreateJobDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    outputItem: '',
    outputQuantity: 1,
    status: IndJobStatusOptions.Planned,
    projectedCost: 0,
    projectedRevenue: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.outputItem.trim()) return;

    const newJob: Omit<IndJob, 'id' | 'created' | 'updated'> = {
      outputItem: formData.outputItem.trim(),
      outputQuantity: formData.outputQuantity,
      status: formData.status,
      projectedCost: formData.projectedCost || undefined,
      projectedRevenue: formData.projectedRevenue || undefined,
      billOfMaterials: [],
      consumedMaterials: [],
      expenditures: [],
      income: [],
    };

    onCreateJob(newJob);
    
    // Reset form
    setFormData({
      outputItem: '',
      outputQuantity: 1,
      status: IndJobStatusOptions.Planned,
      projectedCost: 0,
      projectedRevenue: 0,
    });
    
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Create New Job
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Industry Job</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="outputItem">Output Item</Label>
            <Input
              id="outputItem"
              value={formData.outputItem}
              onChange={(e) => setFormData(prev => ({ ...prev, outputItem: e.target.value }))}
              placeholder="e.g. Inertial Stabilizers I"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.outputQuantity}
                onChange={(e) => setFormData(prev => ({ ...prev, outputQuantity: parseInt(e.target.value) || 1 }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as IndJobStatusOptions }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(IndJobStatusOptions).map(status => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="projectedCost">Projected Cost (ISK)</Label>
              <Input
                id="projectedCost"
                type="number"
                min="0"
                value={formData.projectedCost}
                onChange={(e) => setFormData(prev => ({ ...prev, projectedCost: parseFloat(e.target.value) || 0 }))}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="projectedRevenue">Projected Revenue (ISK)</Label>
              <Input
                id="projectedRevenue"
                type="number"
                min="0"
                value={formData.projectedRevenue}
                onChange={(e) => setFormData(prev => ({ ...prev, projectedRevenue: parseFloat(e.target.value) || 0 }))}
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              Create Job
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}