
import { Button } from '@/components/ui/button';

interface ExpenditureActionsProps {
  onCancel: () => void;
  onSubmit: () => void;
  canSubmit: boolean;
}

const ExpenditureActions: React.FC<ExpenditureActionsProps> = ({ onCancel, onSubmit, canSubmit }) => {
  return (
    <div className="flex justify-end gap-2">
      <Button
        variant="outline"
        onClick={onCancel}
        className="border-gray-600 hover:bg-gray-800"
      >
        Cancel
      </Button>
      <Button
        onClick={onSubmit}
        disabled={!canSubmit}
        className="bg-blue-600 hover:bg-blue-700"
      >
        Assign Expenditures
      </Button>
    </div>
  );
};

export default ExpenditureActions;
