
import { useState } from 'react';
import { parseTransactionLine, PastedTransaction } from '@/utils/priceUtils';
import { IndTransactionRecordNoId, IndJobStatusOptions } from '@/lib/pbtypes';
import { IndJob } from '@/lib/types';

interface TransactionGroup {
  itemName: string;
  transactions: PastedTransaction[];
  totalQuantity: number;
  totalValue: number;
}

export const useBatchTransactionLogic = (jobs: IndJob[]) => {
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

  const getAssignments = () => {
    // Group transactions by assigned job
    return transactionGroups
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
  };

  const canSubmit = transactionGroups.some(g => g.transactions.some(tx => !tx.isDuplicate && tx.assignedJobId));

  return {
    pastedData,
    transactionGroups,
    duplicatesFound,
    eligibleJobs,
    handlePaste,
    handleAssignJob,
    getAssignments,
    canSubmit
  };
};
