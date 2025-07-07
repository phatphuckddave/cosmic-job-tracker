import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import JobCard from '@/components/JobCard';
import TransactionForm from '@/components/TransactionForm';
import TransactionTable from '@/components/TransactionTable';
import JobForm from '@/components/JobForm';
import { IndTransactionRecordNoId, IndJobRecordNoId, IndTransactionRecord } from '@/lib/pbtypes';
import { useJobs, useJob } from '@/hooks/useDataService';
import { useState } from 'react';
import { IndJob } from '@/lib/types';

const JobDetails = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState<IndJob | null>(null);

  const {
    createMultipleTransactions,
    updateTransaction,
    deleteTransaction,
    updateJob,
    deleteJob,
    createMultipleBillItems
  } = useJobs();

  const job = useJob(jobId || null);

  if (!jobId) {
    navigate('/');
    return null;
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-950 p-6 flex items-center justify-center">
        <div className="text-white">Job not found</div>
      </div>
    );
  }

  const handleEditJob = (job: IndJob) => {
    setEditingJob(job);
    setShowJobForm(true);
  };

  const handleUpdateJob = async (jobData: IndJobRecordNoId) => {
    if (!editingJob) return;

    try {
      await updateJob(editingJob.id, jobData);
      setShowJobForm(false);
      setEditingJob(null);
    } catch (error) {
      console.error('Error updating job:', error);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (confirm('Are you sure you want to delete this job?')) {
      try {
        await deleteJob(jobId);
        navigate('/');
      } catch (error) {
        console.error('Error deleting job:', error);
      }
    }
  };

  const handleTransactionsAdded = async (transactions: IndTransactionRecordNoId[], type: 'expenditure' | 'income') => {
    try {
      await createMultipleTransactions(jobId, transactions, type);
    } catch (error) {
      console.error('Error adding transactions:', error);
    }
  };

  const handleUpdateTransaction = async (transactionId: string, updates: Partial<IndTransactionRecord>) => {
    try {
      await updateTransaction(jobId, transactionId, updates);
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    try {
      await deleteTransaction(jobId, transactionId);
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const handleUpdateProduced = async (jobId: string, produced: number) => {
    try {
      await updateJob(jobId, { produced });
    } catch (error) {
      console.error('Error updating produced quantity:', error);
    }
  };

  const handleImportBOM = async (jobId: string, items: { name: string; quantity: number }[]) => {
    try {
      const billItems = items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        unitPrice: 0
      }));
      await createMultipleBillItems(jobId, billItems, 'billOfMaterials');
    } catch (error) {
      console.error('Error importing BOM:', error);
    }
  };

  if (showJobForm) {
    return (
      <div className="min-h-screen bg-gray-950 p-6">
        <div className="max-w-4xl mx-auto">
          <JobForm
            job={editingJob || undefined}
            onSubmit={handleUpdateJob}
            onCancel={() => {
              setShowJobForm(false);
              setEditingJob(null);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Job Details</h1>
            <p className="text-gray-400">{job.outputItem}</p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="border-gray-600 hover:bg-gray-800"
          >
            Back to Jobs
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <JobCard
            job={job}
            onEdit={handleEditJob}
            onDelete={handleDeleteJob}
            onUpdateProduced={handleUpdateProduced}
            onImportBOM={handleImportBOM}
          />
          <TransactionForm
            jobId={job.id}
            onTransactionsAdded={handleTransactionsAdded}
          />
        </div>

        <div className="space-y-6">
          <TransactionTable
            title="Expenditures"
            transactions={job.expenditures}
            type="expenditure"
            onUpdateTransaction={handleUpdateTransaction}
            onDeleteTransaction={handleDeleteTransaction}
          />
          <TransactionTable
            title="Income"
            transactions={job.income}
            type="income"
            onUpdateTransaction={handleUpdateTransaction}
            onDeleteTransaction={handleDeleteTransaction}
          />
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
