
import { Button } from '@/components/ui/button';

interface TransactionActionsProps {
  onCancel: () => void;
  onSubmit: () => void;
  canSubmit: boolean;
}

const TransactionActions: React.FC<TransactionActionsProps> = ({
  onCancel,
  onSubmit,
  canSubmit
}) => {
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
        Assign Transactions
      </Button>
    </div>
  );
};

export default TransactionActions;
