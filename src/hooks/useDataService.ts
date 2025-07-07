import { useState, useEffect } from 'react';
import { dataService } from '@/services/dataService';
import { IndJob, IndTransactionRecord, IndBillitemRecord } from '@/types';

export function useJobs() {
  const [jobs, setJobs] = useState<IndJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = dataService.subscribe(() => {
      setJobs(dataService.getJobs());
    });

    // Initial load
    setJobs(dataService.getJobs());
    setLoading(false);

    return unsubscribe;
  }, []);

  const createJob = (job: Omit<IndJob, 'id' | 'created' | 'updated'>) => {
    try {
      return dataService.createJob(job);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create job');
      throw err;
    }
  };

  const updateJob = (id: string, updates: Partial<IndJob>) => {
    try {
      return dataService.updateJob(id, updates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update job');
      throw err;
    }
  };

  const deleteJob = (id: string) => {
    try {
      return dataService.deleteJob(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete job');
      throw err;
    }
  };

  const createTransaction = (jobId: string, transaction: Omit<IndTransactionRecord, 'id' | 'created' | 'updated' | 'job'>, type: 'income' | 'expenditure') => {
    try {
      return dataService.createTransaction(jobId, transaction, type);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create transaction');
      throw err;
    }
  };

  const createMultipleTransactions = (jobId: string, transactions: Omit<IndTransactionRecord, 'id' | 'created' | 'updated' | 'job'>[], type: 'income' | 'expenditure') => {
    try {
      return dataService.createMultipleTransactions(jobId, transactions, type);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create transactions');
      throw err;
    }
  };

  const updateTransaction = (transactionId: string, updates: Partial<IndTransactionRecord>) => {
    try {
      return dataService.updateTransaction(transactionId, updates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update transaction');
      throw err;
    }
  };

  const deleteTransaction = (transactionId: string) => {
    try {
      return dataService.deleteTransaction(transactionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete transaction');
      throw err;
    }
  };

  const createBillItem = (jobId: string, billItem: Omit<IndBillitemRecord, 'id' | 'created' | 'updated'>) => {
    try {
      return dataService.createBillItem(jobId, billItem);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create bill item');
      throw err;
    }
  };

  const createMultipleBillItems = (jobId: string, billItems: Omit<IndBillitemRecord, 'id' | 'created' | 'updated'>[]) => {
    try {
      return dataService.createMultipleBillItems(jobId, billItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create bill items');
      throw err;
    }
  };

  return {
    jobs,
    loading,
    error,
    setJobs,
    setLoading,
    setError,
    createJob,
    updateJob,
    deleteJob,
    createTransaction,
    createMultipleTransactions,
    updateTransaction,
    deleteTransaction,
    createBillItem,
    createMultipleBillItems,
  };
}

export function useJob(id: string) {
  const [job, setJob] = useState<IndJob | undefined>();

  useEffect(() => {
    const unsubscribe = dataService.subscribe(() => {
      setJob(dataService.getJob(id));
    });

    // Initial load
    setJob(dataService.getJob(id));

    return unsubscribe;
  }, [id]);

  return { job, setJob };
}