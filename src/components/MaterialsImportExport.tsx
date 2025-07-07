import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Import, Download, FileText } from 'lucide-react';
import { IndBillitemRecord, IndBillitemRecordNoId } from '@/lib/pbtypes';
import { IndJob } from '@/lib/types';
import { dataService } from '@/services/dataService';

interface MaterialsImportExportProps {
  job?: IndJob;
  billOfMaterials: IndBillitemRecord[];
  consumedMaterials: IndBillitemRecord[];
  onBillOfMaterialsUpdate: (billItems: IndBillitemRecord[]) => void;
  onConsumedMaterialsUpdate: (billItems: IndBillitemRecord[]) => void;
}

const MaterialsImportExport: React.FC<MaterialsImportExportProps> = ({
  job,
  billOfMaterials,
  consumedMaterials,
  onBillOfMaterialsUpdate,
  onConsumedMaterialsUpdate
}) => {
  const [bomInput, setBomInput] = useState('');
  const [consumedInput, setConsumedInput] = useState('');

  const parseBillOfMaterials = (text: string): IndBillitemRecordNoId[] => {
    const lines = text.split('\n').filter(line => line.trim());
    const materials: IndBillitemRecordNoId[] = [];

    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 2) {
        const name = parts.slice(0, -1).join(' ');
        const quantity = parseInt(parts[parts.length - 1]);
        if (name && !isNaN(quantity)) {
          materials.push({ name, quantity });
        }
      }
    }

    return materials;
  };

  const parseConsumedMaterials = (text: string): IndBillitemRecordNoId[] => {
    const lines = text.split('\n').filter(line => line.trim());
    const materials: IndBillitemRecordNoId[] = [];

    for (const line of lines) {
      const parts = line.trim().split('\t');
      if (parts.length >= 2) {
        const name = parts[0];
        const quantity = parseInt(parts[1]);
        if (name && !isNaN(quantity)) {
          materials.push({ name, quantity });
        }
      }
    }

    return materials;
  };

  const exportBillOfMaterials = (): string => {
    return billOfMaterials.map(item => `${item.name} ${item.quantity}`).join('\n');
  };

  const exportConsumedMaterials = (): string => {
    return consumedMaterials.map(item => `${item.name}\t${item.quantity}`).join('\n');
  };

  const handleImportBom = async () => {
    if (!job) return;

    const materials = parseBillOfMaterials(bomInput);
    if (materials.length > 0) {
      try {
        const updatedJob = await dataService.createMultipleBillItems(job.id, materials, 'billOfMaterials');
        onBillOfMaterialsUpdate(updatedJob.billOfMaterials);
        setBomInput('');
      } catch (error) {
        console.error('Error importing bill of materials:', error);
      }
    }
  };

  const handleImportConsumed = async () => {
    if (!job) return;

    const materials = parseConsumedMaterials(consumedInput);
    if (materials.length > 0) {
      try {
        const updatedJob = await dataService.createMultipleBillItems(job.id, materials, 'consumedMaterials');
        onConsumedMaterialsUpdate(updatedJob.consumedMaterials);
        setConsumedInput('');
      } catch (error) {
        console.error('Error importing consumed materials:', error);
      }
    }
  };

  const handleExportBom = () => {
    const exported = exportBillOfMaterials();
    navigator.clipboard.writeText(exported);
  };

  const handleExportConsumed = () => {
    const exported = exportConsumedMaterials();
    navigator.clipboard.writeText(exported);
  };

  return (
    <Card className="bg-gray-900 border-gray-700 text-white">
      <CardHeader>
        <CardTitle className="text-blue-400 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Materials Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-gray-300">Bill of Materials</Label>
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportBom}
              className="border-gray-600 hover:bg-gray-800"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
          <Textarea
            placeholder="Paste bill of materials here (e.g., Mexallon 1000)"
            value={bomInput}
            onChange={(e) => setBomInput(e.target.value)}
            className="bg-gray-800 border-gray-600 text-white"
            rows={4}
          />
          <Button
            onClick={handleImportBom}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={!job}
          >
            <Import className="w-4 h-4 mr-2" />
            Import Bill of Materials
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-gray-300">Consumed Materials</Label>
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportConsumed}
              className="border-gray-600 hover:bg-gray-800"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
          <Textarea
            placeholder="Paste consumed materials here (tab-separated: Item\tRequired)"
            value={consumedInput}
            onChange={(e) => setConsumedInput(e.target.value)}
            className="bg-gray-800 border-gray-600 text-white"
            rows={4}
          />
          <Button
            onClick={handleImportConsumed}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={!job}
          >
            <Import className="w-4 h-4 mr-2" />
            Import Consumed Materials
          </Button>
        </div>

        {billOfMaterials.length > 0 && (
          <div className="space-y-2">
            <Label className="text-gray-300">Current Bill of Materials:</Label>
            <div className="text-sm text-gray-400 max-h-32 overflow-y-auto">
              {billOfMaterials.map((item, index) => (
                <div key={index}>{item.name}: {item.quantity.toLocaleString()}</div>
              ))}
            </div>
          </div>
        )}

        {consumedMaterials.length > 0 && (
          <div className="space-y-2">
            <Label className="text-gray-300">Current Consumed Materials:</Label>
            <div className="text-sm text-gray-400 max-h-32 overflow-y-auto">
              {consumedMaterials.map((item, index) => (
                <div key={index}>{item.name}: {item.quantity.toLocaleString()}</div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MaterialsImportExport;
