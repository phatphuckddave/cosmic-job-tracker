import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IndJob, IndBillitemRecord } from '@/types';
import { parseBOMData, exportBOMData } from '@/utils/bomParser';
import { Download, Upload } from 'lucide-react';

interface BOMManagerProps {
  job: IndJob;
  onImport: (items: Omit<IndBillitemRecord, 'id' | 'created' | 'updated'>[]) => void;
  onUpdate: (id: string, updates: Partial<IndJob>) => void;
}

export function BOMManager({ job, onImport, onUpdate }: BOMManagerProps) {
  const [importData, setImportData] = useState('');
  const [parsedItems, setParsedItems] = useState<Omit<IndBillitemRecord, 'id' | 'created' | 'updated'>[]>([]);

  const handleImportChange = (value: string) => {
    setImportData(value);
    if (value.trim()) {
      const parsed = parseBOMData(value);
      setParsedItems(parsed);
    } else {
      setParsedItems([]);
    }
  };

  const handleImport = () => {
    onImport(parsedItems);
    setImportData('');
    setParsedItems([]);
  };

  const handleExport = () => {
    if (job.billOfMaterials && job.billOfMaterials.length > 0) {
      const exportText = exportBOMData(job.billOfMaterials);
      navigator.clipboard.writeText(exportText);
      // You could add a toast notification here
    }
  };

  const handleClear = () => {
    onUpdate(job.id, { billOfMaterials: [] });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Bill of Materials</span>
          <div className="flex items-center gap-2">
            {job.billOfMaterials && job.billOfMaterials.length > 0 && (
              <>
                <Badge variant="secondary">{job.billOfMaterials.length} items</Badge>
                <Button size="sm" variant="outline" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current BOM Display */}
        {job.billOfMaterials && job.billOfMaterials.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium">Current Materials</h4>
              <Button size="sm" variant="destructive" onClick={handleClear}>
                Clear All
              </Button>
            </div>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {job.billOfMaterials.map((item) => (
                <div key={item.id} className="flex justify-between text-sm p-2 bg-muted rounded">
                  <span>{item.name}</span>
                  <span className="font-mono">{item.quantity.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Import Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            <span className="font-medium">Import Materials</span>
            {parsedItems.length > 0 && (
              <Badge variant="secondary">{parsedItems.length} items parsed</Badge>
            )}
          </div>
          <Textarea
            placeholder="Paste BOM data here (Tab-separated: Item Name	Quantity)&#10;Example:&#10;Isogen	2,400&#10;Mexallon	21,000"
            value={importData}
            onChange={(e) => handleImportChange(e.target.value)}
            className="min-h-[100px] font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Expected format: Item Name[TAB]Quantity (one per line)
          </p>
        </div>

        {/* Preview */}
        {parsedItems.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Preview ({parsedItems.length} items):</h4>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {parsedItems.map((item, index) => (
                <div key={index} className="flex justify-between text-sm p-2 bg-muted rounded">
                  <span>{item.name}</span>
                  <span className="font-mono">{item.quantity.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Import Button */}
        <div className="flex gap-2">
          <Button 
            onClick={handleImport} 
            disabled={parsedItems.length === 0}
            className="flex-1"
          >
            Import {parsedItems.length} Items
          </Button>
          <Button 
            onClick={() => {
              setImportData('');
              setParsedItems([]);
            }}
            variant="outline"
            disabled={!importData.trim()}
          >
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}