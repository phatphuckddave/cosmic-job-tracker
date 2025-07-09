
import { Card, CardContent } from '@/components/ui/card';
import { IndTransactionRecordNoId } from '@/lib/pbtypes';
import { IndJob } from '@/lib/types';
import BatchExpenditureHeader from './batch-expenditure/BatchExpenditureHeader';
import PasteExpenditureInput from './batch-expenditure/PasteExpenditureInput';
import ExpenditureStats from './batch-expenditure/ExpenditureStats';
import ExpenditureTable from './batch-expenditure/ExpenditureTable';
import ExpenditureActions from './batch-expenditure/ExpenditureActions';
import { useBatchExpenditureLogic } from '@/hooks/useBatchExpenditureLogic';

interface BatchExpenditureFormProps {
  onClose: () => void;
  onTransactionsAssigned: (assignments: { jobId: string, transactions: IndTransactionRecordNoId[] }[]) => void;
  jobs: IndJob[];
}

const BatchExpenditureForm: React.FC<BatchExpenditureFormProps> = ({ onClose, onTransactionsAssigned, jobs }) => {
  const {
    pastedData,
    transactionGroups,
    duplicatesFound,
    eligibleJobs,
    handlePaste,
    handleAssignJob,
    canSubmit
  } = useBatchExpenditureLogic(jobs);

  const handleSubmit = () => {
    // Group transactions by assigned job
    const assignments = transactionGroups
      .flatMap(group => group.transactions)
      .filter(tx => tx.assignedJobId)
      .reduce((acc, tx) => {
        const jobId = tx.assignedJobId!;
        const existing = acc.find(a => a.jobId === jobId);
        if (existing) {
          existing.transactions.push(tx);
        } else {
          acc.push({ jobId, transactions: [tx] });
        }
        return acc;
      }, [] as { jobId: string, transactions: IndTransactionRecordNoId[] }[]);

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
        <BatchExpenditureHeader onClose={onClose} />
        <CardContent className="space-y-4">
          <PasteExpenditureInput pastedData={pastedData} onPaste={handlePaste} />

          {transactionGroups.length > 0 && (
            <div className="space-y-4">
              <ExpenditureStats 
                totalExpenditures={transactionGroups.length}
                duplicatesFound={duplicatesFound}
              />

              <ExpenditureTable
                transactionGroups={transactionGroups}
                jobs={jobs}
                eligibleJobs={eligibleJobs}
                onAssignJob={handleAssignJob}
              />

              <ExpenditureActions
                onCancel={onClose}
                onSubmit={handleSubmit}
                canSubmit={canSubmit}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BatchExpenditureForm;
