
import { Card, CardContent } from '@/components/ui/card';
import { IndTransactionRecordNoId } from '@/lib/pbtypes';
import { IndJob } from '@/lib/types';
import { useBatchTransactionLogic } from '@/hooks/useBatchTransactionLogic';
import BatchTransactionHeader from '@/components/batch-transaction/BatchTransactionHeader';
import PasteTransactionInput from '@/components/batch-transaction/PasteTransactionInput';
import TransactionStats from '@/components/batch-transaction/TransactionStats';
import TransactionTable from '@/components/batch-transaction/TransactionTable';
import TransactionActions from '@/components/batch-transaction/TransactionActions';

interface BatchTransactionFormProps {
  onClose: () => void;
  onTransactionsAssigned: (assignments: { jobId: string, transactions: IndTransactionRecordNoId[] }[]) => void;
  jobs: IndJob[];
}

const BatchTransactionForm: React.FC<BatchTransactionFormProps> = ({ onClose, onTransactionsAssigned, jobs }) => {
  const {
    pastedData,
    transactionGroups,
    duplicatesFound,
    eligibleJobs,
    handlePaste,
    handleAssignJob,
    getAssignments,
    canSubmit
  } = useBatchTransactionLogic(jobs);

  const handleSubmit = () => {
    const assignments = getAssignments();
    onTransactionsAssigned(assignments);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <Card
        className="bg-gray-900 border-gray-700 text-white w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <BatchTransactionHeader onClose={onClose} />

        <CardContent className="space-y-4">
          <PasteTransactionInput
            pastedData={pastedData}
            onPaste={handlePaste}
          />

          {transactionGroups.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <TransactionStats
                  transactionCount={transactionGroups.length}
                  duplicatesFound={duplicatesFound}
                />
              </div>

              <TransactionActions
                onCancel={onClose}
                onSubmit={handleSubmit}
                canSubmit={canSubmit}
              />

              <TransactionTable
                transactionGroups={transactionGroups}
                jobs={jobs}
                eligibleJobs={eligibleJobs}
                onAssignJob={handleAssignJob}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BatchTransactionForm;
