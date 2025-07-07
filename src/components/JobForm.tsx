import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IndJobStatusOptions, IndJobRecordNoId } from '@/lib/pbtypes';
import { IndJob } from '@/lib/types';
import { parseISKAmount } from '@/utils/priceUtils';

interface JobFormProps {
  job?: IndJob;
  onSubmit: (job: IndJobRecordNoId) => void;
  onCancel: () => void;
}

const formatDateForInput = (dateString: string | undefined | null): string => {
  if (!dateString) return '';

  // Create a date object in local timezone
  const date = new Date(dateString);

  // Format to YYYY-MM-DD
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  // Format to HH:MM
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  // Combine into format required by datetime-local (YYYY-MM-DDTHH:MM)
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const JobForm: React.FC<JobFormProps> = ({ job, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    outputItem: job?.outputItem || '',
    outputQuantity: job?.outputQuantity || 0,
    jobStart: formatDateForInput(job?.jobStart),
    jobEnd: formatDateForInput(job?.jobEnd),
    saleStart: formatDateForInput(job?.saleStart),
    saleEnd: formatDateForInput(job?.saleEnd),
    status: job?.status || IndJobStatusOptions.Planned,
    projectedCost: job?.projectedCost || 0,
    projectedRevenue: job?.projectedRevenue || 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSubmit({
      outputItem: formData.outputItem,
      outputQuantity: formData.outputQuantity,
      jobStart: formData.jobStart || undefined,
      jobEnd: formData.jobEnd || undefined,
      saleStart: formData.saleStart || undefined,
      saleEnd: formData.saleEnd || undefined,
      status: formData.status,
      projectedCost: formData.projectedCost,
      projectedRevenue: formData.projectedRevenue
    });
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
              <Label htmlFor="startDate" className="text-gray-300">Start Date & Time</Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={formData.jobStart}
                onChange={(e) => setFormData({
                  ...formData,
                  jobStart: e.target.value
                })}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-gray-300">End Date & Time</Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={formData.jobEnd}
                onChange={(e) => setFormData({
                  ...formData,
                  jobEnd: e.target.value
                })}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="saleStartDate" className="text-gray-300">Sale Start Date & Time</Label>
              <Input
                id="saleStartDate"
                type="datetime-local"
                value={formData.saleStart}
                onChange={(e) => setFormData({
                  ...formData,
                  saleStart: e.target.value
                })}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="saleEndDate" className="text-gray-300">Sale End Date & Time</Label>
              <Input
                id="saleEndDate"
                type="datetime-local"
                value={formData.saleEnd}
                onChange={(e) => setFormData({
                  ...formData,
                  saleEnd: e.target.value
                })}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
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
