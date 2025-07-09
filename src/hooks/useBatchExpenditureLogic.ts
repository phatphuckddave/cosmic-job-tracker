import { useState } from 'react';
import { parseTransactionLine, formatISK, PastedTransaction } from '@/utils/priceUtils';
import { IndTransactionRecordNoId, IndJobStatusOptions } from '@/lib/pbtypes';
import { IndJob } from '@/lib/types';

interface TransactionGroup {
  itemName: string;
  transactions: PastedTransaction[];
  totalQuantity: number;
  totalValue: number;
}

export const useBatchExpenditureLogic = (jobs: IndJob[]) => {
  const [pastedData, setPastedData] = useState('');
  const [transactionGroups, setTransactionGroups] = useState<TransactionGroup[]>([]);
  const [duplicatesFound, setDuplicatesFound] = useState(0);

  // Filter jobs that are in acquisition status
  const eligibleJobs = jobs.filter(job => job.status === IndJobStatusOptions.Acquisition);

  const findMatchingJob = (itemName: string): string | undefined => {
    // Find jobs where the item is in the bill of materials and not satisfied
    for (const job of eligibleJobs) {
      const billItem = job.billOfMaterials?.find(item => 
        item.name.toLowerCase() === itemName.toLowerCase()
      );
      
      if (billItem) {
        // Check if this material is already satisfied
        const ownedQuantity = job.expenditures?.reduce((total, exp) => 
          exp.itemName.toLowerCase() === itemName.toLowerCase() ? total + exp.quantity : total, 0
        ) || 0;
        
        // Only return this job if we still need more of this material
        if (ownedQuantity < billItem.quantity) {
          return job.id;
        }
      }
    }
    return undefined;
  };

  const normalizeDate = (dateStr: string): string => {
    return dateStr.replace('T', ' ');
  };

  const createTransactionKey = (parsed: PastedTransaction): string => {
    if (!parsed) return '';
    const key = [
      normalizeDate(parsed.date.toString()),
      parsed.itemName,
      parsed.quantity.toString(),
      Math.abs(parsed.totalPrice).toString(), // Use absolute value for expenditures
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
      Math.abs(tx.totalPrice).toString(), // Use absolute value for expenditures
      tx.buyer,
      tx.location
    ].join('|');
    return key;
  };

  const handlePaste = (value: string) => {
    console.log('Handling paste with value:', value);
    setPastedData(value);
    const lines = value.trim().split('\n').filter(line => line.trim().length > 0);
    console.log('Processing lines:', lines);
    
    const pasteTransactionMap = new Map<string, PastedTransaction>();

    // STEP 1: Combine identical transactions within the pasted data
    lines.forEach((line, index) => {
      console.log(`Processing line ${index}:`, line);
      const parsed: PastedTransaction | null = parseTransactionLine(line);
      
      if (parsed) {
        console.log('Parsed transaction:', parsed);
        
        // For expenditures, we expect negative amounts, but handle both cases
        const isExpenditure = parsed.totalPrice < 0;
        if (isExpenditure) {
          // Convert to positive values for expenditures
          parsed.totalPrice = Math.abs(parsed.totalPrice);
          parsed.unitPrice = Math.abs(parsed.unitPrice);
        } else {
          // If it's positive, we might still want to treat it as expenditure
          // based on context, but let's keep it as is for now
          console.log('Transaction has positive amount, treating as expenditure anyway');
        }
        
        const transactionKey: string = createTransactionKey(parsed);
        console.log('Transaction key:', transactionKey);

        if (pasteTransactionMap.has(transactionKey)) {
          const existing = pasteTransactionMap.get(transactionKey)!;
          existing.quantity += parsed.quantity;
          existing.totalPrice += parsed.totalPrice;
          const newKey = createTransactionKey(existing);
          pasteTransactionMap.set(newKey, existing);
          pasteTransactionMap.delete(transactionKey);
        } else {
          pasteTransactionMap.set(transactionKey, parsed);
        }
      } else {
        console.log('Failed to parse line:', line);
      }
    });

    console.log('Parsed transactions map:', pasteTransactionMap);

    // STEP 2: Identify which jobs these transactions belong to
    const relevantJobIds = new Set<string>();
    pasteTransactionMap.forEach((transaction) => {
      const matchingJobId = findMatchingJob(transaction.itemName);
      if (matchingJobId) {
        relevantJobIds.add(matchingJobId);
        transaction.assignedJobId = matchingJobId;
      }
    });

    // STEP 3: Check against existing expenditures from relevant jobs
    const existingTransactionKeys = new Set<string>();
    eligibleJobs.forEach(job => {
      if (relevantJobIds.has(job.id)) {
        job.expenditures?.forEach(tx => {
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
      } else if (!transaction.assignedJobId) {
        transaction.assignedJobId = findMatchingJob(transaction.itemName);
      }
    });

    const transactionList = Array.from(pasteTransactionMap.values());
    console.log('Final transaction list:', transactionList);
    setDuplicatesFound(duplicates);

    // Create individual transaction groups
    const groups = transactionList.map(tx => ({
      itemName: tx.itemName,
      transactions: [tx],
      totalQuantity: tx.quantity,
      totalValue: tx.totalPrice
    }));

    console.log('Transaction groups:', groups);
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

  const canSubmit = transactionGroups.some(g => g.transactions.some(tx => !tx.isDuplicate && tx.assignedJobId));

  return {
    pastedData,
    transactionGroups,
    duplicatesFound,
    eligibleJobs,
    handlePaste,
    handleAssignJob,
    canSubmit
  };
};
