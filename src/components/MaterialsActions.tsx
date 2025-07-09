
import React from 'react';
import { Button } from '@/components/ui/button';
import { Import, Download, AlertTriangle } from 'lucide-react';

interface MaterialsActionsProps {
  onImport: () => void;
  onExport: () => void;
  onExportMissing?: () => void;
  importDisabled?: boolean;
  missingDisabled?: boolean;
  type: 'bom' | 'consumed';
}

const MaterialsActions: React.FC<MaterialsActionsProps> = ({
  onImport,
  onExport,
  onExportMissing,
  importDisabled = false,
  missingDisabled = false,
  type
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-1">
        <Button
          size="sm"
          variant="outline"
          onClick={onExport}
          className="border-gray-600 hover:bg-gray-800"
        >
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
        {type === 'bom' && onExportMissing && (
          <Button
            size="sm"
            variant="outline"
            onClick={onExportMissing}
            className="border-gray-600 hover:bg-gray-800"
            disabled={missingDisabled}
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Missing
          </Button>
        )}
      </div>
      <Button
        onClick={onImport}
        className="bg-blue-600 hover:bg-blue-700"
        disabled={importDisabled}
      >
        <Import className="w-4 h-4 mr-2" />
        Import {type === 'bom' ? 'Bill of Materials' : 'Consumed Materials'}
      </Button>
    </div>
  );
};

export default MaterialsActions;
