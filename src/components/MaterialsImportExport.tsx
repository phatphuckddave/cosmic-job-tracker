
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FileText } from 'lucide-react';
import { IndBillitemRecord } from '@/lib/pbtypes';
import { IndJob } from '@/lib/types';
import { dataService } from '@/services/dataService';
import { useToast } from '@/hooks/use-toast';
import { useMaterialsCalculations } from '@/hooks/useMaterialsCalculations';
import { parseBillOfMaterials, parseConsumedMaterials } from '@/utils/materialsParser';
import { exportBillOfMaterials, exportConsumedMaterials, exportMissingMaterials } from '@/utils/materialsExporter';
import MaterialsActions from './MaterialsActions';
import MaterialsList from './MaterialsList';

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
  const { toast } = useToast();
  const { calculateMissingMaterials } = useMaterialsCalculations(job, billOfMaterials);

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
    const exported = exportBillOfMaterials(billOfMaterials);
    navigator.clipboard.writeText(exported);
    toast({
      title: "Exported",
      description: "Bill of materials copied to clipboard",
      duration: 2000,
    });
  };

  const handleExportConsumed = () => {
    const exported = exportConsumedMaterials(consumedMaterials);
    navigator.clipboard.writeText(exported);
    toast({
      title: "Exported",
      description: "Consumed materials copied to clipboard",
      duration: 2000,
    });
  };

  const handleExportMissing = () => {
    const missingMaterials = calculateMissingMaterials();
    const exported = exportMissingMaterials(missingMaterials);
    if (exported) {
      navigator.clipboard.writeText(exported);
      toast({
        title: "Exported",
        description: "Missing materials copied to clipboard",
        duration: 2000,
      });
    } else {
      toast({
        title: "Nothing Missing",
        description: "All materials are satisfied for this job",
        duration: 2000,
      });
    }
  };

  const missingMaterials = calculateMissingMaterials();

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
          <Label className="text-gray-300">Bill of Materials</Label>
          <MaterialsActions
            type="bom"
            onImport={handleImportBom}
            onExport={handleExportBom}
            onExportMissing={handleExportMissing}
            importDisabled={!job}
            missingDisabled={!job || missingMaterials.length === 0}
          />
          <Textarea
            placeholder="Paste bill of materials here (e.g., Mexallon 1000)"
            value={bomInput}
            onChange={(e) => setBomInput(e.target.value)}
            className="bg-gray-800 border-gray-600 text-white"
            rows={4}
          />
        </div>

        <div className="space-y-4">
          <Label className="text-gray-300">Consumed Materials</Label>
          <MaterialsActions
            type="consumed"
            onImport={handleImportConsumed}
            onExport={handleExportConsumed}
            importDisabled={!job}
          />
          <Textarea
            placeholder="Paste consumed materials here (tab-separated: Item\tRequired)"
            value={consumedInput}
            onChange={(e) => setConsumedInput(e.target.value)}
            className="bg-gray-800 border-gray-600 text-white"
            rows={4}
          />
        </div>

        <MaterialsList
          title="Current Bill of Materials"
          materials={billOfMaterials}
        />

        <MaterialsList
          title="Current Consumed Materials"
          materials={consumedMaterials}
        />

        <MaterialsList
          title="Missing Materials"
          materials={missingMaterials}
          className="text-red-400"
        />
      </CardContent>
    </Card>
  );
};

export default MaterialsImportExport;
