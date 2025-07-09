import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { parseTransactionLine, formatISK, PastedTransaction } from '@/utils/priceUtils';
import { IndTransactionRecordNoId, IndJobStatusOptions } from '@/lib/pbtypes';
import { IndJob } from '@/lib/types';
import { X } from 'lucide-react';

interface BatchTransactionFormProps {
  onClose: () => void;
  onTransactionsAssigned: (assignments: { jobId: string, transactions: IndTransactionRecordNoId[] }[]) => void;
  jobs: IndJob[];
}

interface TransactionGroup {
  itemName: string;
  transactions: PastedTransaction[];
  totalQuantity: number;
  totalValue: number;
}

const BatchTransactionForm: React.FC<BatchTransactionFormProps> = ({ onClose, onTransactionsAssigned, jobs }) => {
  const [pastedData, setPastedData] = useState('');
  const [transactionGroups, setTransactionGroups] = useState<TransactionGroup[]>([]);
  const [duplicatesFound, setDuplicatesFound] = useState(0);

  // Filter jobs that are either running, selling, or tracked
  const eligibleJobs = jobs.filter(job =>
    job.status === IndJobStatusOptions.Running ||
    job.status === IndJobStatusOptions.Selling ||
    job.status === IndJobStatusOptions.Tracked
  );

  const findMatchingJob = (itemName: string): string | undefined => {
    // First try exact match
    const exactMatch = eligibleJobs.find(job => job.outputItem === itemName);
    if (exactMatch) return exactMatch.id;

    // Then try case-insensitive match
    const caseInsensitiveMatch = eligibleJobs.find(job =>
      job.outputItem.toLowerCase() === itemName.toLowerCase()
    );
    if (caseInsensitiveMatch) return caseInsensitiveMatch.id;

    return undefined;
  };

  const normalizeDate = (dateStr: string): string => {
    // Convert any ISO date string to consistent format with space
    return dateStr.replace('T', ' ');
  };

  const createTransactionKey = (parsed: PastedTransaction): string => {
    if (!parsed) return '';
    const key = [
      normalizeDate(parsed.date.toString()),
      parsed.itemName,
      parsed.quantity.toString(),
      parsed.totalPrice.toString(),
      parsed.buyer,
      parsed.location
    ].join('|');
    return key;
  };

  const createTransactionKeyFromRecord = (tx: IndTransactionRecordNoId): string => {
    const key = [
      normalizeDate(tx.date),
      tx.itemName,
      tx.quantity.toString(),
      tx.totalPrice.toString(),
      tx.buyer,
      tx.location
    ].join('|');
    return key;
  };

  const handlePaste = (value: string) => {
    setPastedData(value);
    const lines = value.trim().split('\n');
    const pasteTransactionMap = new Map<string, PastedTransaction>();

    // STEP 1: First combine all identical transactions within the pasted data
    lines.forEach((line) => {
      const parsed: PastedTransaction | null = parseTransactionLine(line);
      if (parsed) {
        const transactionKey: string = createTransactionKey(parsed);

        if (pasteTransactionMap.has(transactionKey)) {
          // Merge with existing transaction in paste
          const existing = pasteTransactionMap.get(transactionKey)!;
          existing.quantity += parsed.quantity;
          existing.totalPrice += Math.abs(parsed.totalPrice);
          const newKey = createTransactionKey(existing);
          pasteTransactionMap.set(newKey, existing);
          pasteTransactionMap.delete(transactionKey); // Remove old key
        } else {
          // Add new transaction
          pasteTransactionMap.set(transactionKey, parsed);
        }
      }
    });

    // STEP 2: Identify which jobs these transactions belong to
    const relevantJobIds = new Set<string>();
    pasteTransactionMap.forEach((transaction) => {
      const matchingJobId = findMatchingJob(transaction.itemName);
      if (matchingJobId) {
        relevantJobIds.add(matchingJobId);
        transaction.assignedJobId = matchingJobId;
      }
    });

    // STEP 3: Only check against transactions from relevant jobs
    const existingTransactionKeys = new Set<string>();
    eligibleJobs.forEach(job => {
      if (relevantJobIds.has(job.id)) {
        job.income.forEach(tx => {
          const key = createTransactionKeyFromRecord(tx);
          existingTransactionKeys.add(key);
        });
      }
    });

    // STEP 4: Mark duplicates and assign jobs
    let duplicates = 0;
    pasteTransactionMap.forEach((transaction, key) => {
      const isDuplicate = existingTransactionKeys.has(key);
      transaction.isDuplicate = isDuplicate;

      if (isDuplicate) {
        duplicates++;
        transaction.assignedJobId = undefined;
      } else if (!!transaction.assignedJobId) {
        transaction.assignedJobId = findMatchingJob(transaction.itemName);
      }
    });

    // Convert map to array for display
    const transactionList = Array.from(pasteTransactionMap.values());
    setDuplicatesFound(duplicates);

    // Create individual transaction groups (no grouping by item name)
    const groups = transactionList.map(tx => ({
      itemName: tx.itemName,
      transactions: [tx],
      totalQuantity: tx.quantity,
      totalValue: tx.totalPrice
    }));

    setTransactionGroups(groups);
  };

  const handleAssignJob = (groupIndex: number, jobId: string) => {
    setTransactionGroups(prev => {
      const newGroups = [...prev];
      newGroups[groupIndex].transactions.forEach(tx => {
        tx.assignedJobId = jobId;
      });
      return newGroups;
    });
  };

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

  const allAssigned = transactionGroups.every(group =>
    group.transactions.every(tx => tx.assignedJobId)
  );

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <Card
        className="bg-gray-900 border-gray-700 text-white w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-gray-900 border-b border-gray-700 z-10">
          <CardTitle className="text-blue-400">Batch Transaction Assignment</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Paste EVE transaction data:
            </label>
            <Textarea
              value={pastedData}
              onChange={(e) => handlePaste(e.target.value)}
              placeholder="Paste your EVE transaction data here..."
              className="min-h-32 bg-gray-800 border-gray-600 text-white"
            />
          </div>

          {transactionGroups.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="text-blue-400 border-blue-400">
                    {transactionGroups.length} transactions found
                  </Badge>
                  {duplicatesFound > 0 && (
                    <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                      {duplicatesFound} duplicates found
                    </Badge>
                  )}
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">Item</TableHead>
                    <TableHead className="text-gray-300">Quantity</TableHead>
                    <TableHead className="text-gray-300">Total Value</TableHead>
                    <TableHead className="text-gray-300">Assign To Job</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactionGroups.map((group, index) => {
                    const autoAssigned = group.transactions[0]?.assignedJobId;
                    const isDuplicate = group.transactions[0]?.isDuplicate;
                    const matchingJob = autoAssigned ? jobs.find(j => j.id === autoAssigned) : undefined;

                    return (
                      <TableRow
                        key={group.itemName}
                        className={`border-gray-700 ${isDuplicate ? 'bg-red-900/30' : ''}`}
                      >
                        <TableCell className="text-white flex items-center gap-2">
                          {group.itemName}
                          {isDuplicate && (
                            <Badge variant="destructive" className="bg-red-600">
                              Duplicate
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {group.totalQuantity.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-green-400">
                          {formatISK(group.totalValue)}
                        </TableCell>
                        <TableCell>
                          {isDuplicate ? (
                            <div className="text-red-400 text-sm">
                              Transaction already exists
                            </div>
                          ) : (
                            <Select
                              value={group.transactions[0]?.assignedJobId || ''}
                              onValueChange={(value) => handleAssignJob(index, value)}
                            >
                              <SelectTrigger
                                className={`bg-gray-800 border-gray-600 text-white ${autoAssigned ? 'border-green-600' : ''}`}
                              >
                                <SelectValue placeholder={autoAssigned ? `Auto-assigned to ${matchingJob?.outputItem}` : 'Select a job'} />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-800 border-gray-600">
                                {eligibleJobs
                                  .filter(job => job.outputItem.includes(group.itemName) || job.status === 'Tracked')
                                  .map(job => (
                                    <SelectItem
                                      key={job.id}
                                      value={job.id}
                                      className="text-white"
                                    >
                                      {job.outputItem} ({job.status})
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="border-gray-600 hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!transactionGroups.some(g => g.transactions.some(tx => !tx.isDuplicate && tx.assignedJobId))}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Assign Transactions
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BatchTransactionForm;