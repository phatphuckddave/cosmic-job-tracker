
import { IndJob } from '@/lib/types';
import { IndTransactionRecordNoId, IndJobRecordNoId } from '@/lib/pbtypes';

interface DashboardHandlersProps {
  createJob: (jobData: IndJobRecordNoId) => Promise<IndJob>;
  updateJob: (id: string, updates: Partial<IndJobRecordNoId>) => Promise<IndJob>;
  deleteJob: (id: string) => Promise<void>;
  createMultipleTransactions: (jobId: string, transactions: IndTransactionRecordNoId[], type: 'expenditure' | 'income') => Promise<IndJob>;
  createMultipleBillItems: (jobId: string, items: { name: string; quantity: number; unitPrice: number }[], type: 'billOfMaterials' | 'consumedMaterials') => Promise<IndJob>;
  loadJobsForStatuses: (statuses: string[]) => Promise<void>;
  setShowJobForm: (show: boolean) => void;
  setEditingJob: (job: IndJob | null) => void;
  collapsedGroups: Record<string, boolean>;
  setCollapsedGroups: (groups: Record<string, boolean>) => void;
  loadingStatuses: Set<string>;
}

export function useDashboardHandlers({
  createJob,
  updateJob,
  deleteJob,
  createMultipleTransactions,
  createMultipleBillItems,
  loadJobsForStatuses,
  setShowJobForm,
  setEditingJob,
  collapsedGroups,
  setCollapsedGroups,
  loadingStatuses
}: DashboardHandlersProps) {

  const handleCreateJob = async (jobData: IndJobRecordNoId, billOfMaterials?: { name: string; quantity: number }[]) => {
    try {
      const newJob = await createJob(jobData);
      
      if (billOfMaterials && billOfMaterials.length > 0) {
        const billItems = billOfMaterials.map(item => ({
          name: item.name,
          quantity: item.quantity,
          unitPrice: 0
        }));
        await createMultipleBillItems(newJob.id, billItems, 'billOfMaterials');
      }
      
      setShowJobForm(false);
    } catch (error) {
      console.error('Error creating job:', error);
    }
  };

  const handleEditJob = (job: IndJob) => {
    setEditingJob(job);
    setShowJobForm(true);
  };

  const handleUpdateJob = async (jobData: IndJobRecordNoId, editingJob: IndJob | null) => {
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
      } catch (error) {
        console.error('Error deleting job:', error);
      }
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

  const toggleGroup = async (status: string) => {
    const currentScrollY = window.scrollY;
    
    const newState = { ...collapsedGroups, [status]: !collapsedGroups[status] };
    setCollapsedGroups(newState);
    localStorage.setItem('jobGroupsCollapsed', JSON.stringify(newState));

    if (collapsedGroups[status] && !loadingStatuses.has(status)) {
      await loadJobsForStatuses([status]);
      
      setTimeout(() => {
        window.scrollTo(0, currentScrollY);
      }, 50);
    }
  };

  const handleBatchTransactionsAssigned = async (assignments: { jobId: string, transactions: IndTransactionRecordNoId[] }[]) => {
    try {
      for (const { jobId, transactions } of assignments) {
        await createMultipleTransactions(jobId, transactions, 'income');
      }
    } catch (error) {
      console.error('Error assigning batch transactions:', error);
    }
  };

  const handleBatchExpendituresAssigned = async (assignments: { jobId: string, transactions: IndTransactionRecordNoId[] }[]) => {
    try {
      for (const { jobId, transactions } of assignments) {
        await createMultipleTransactions(jobId, transactions, 'expenditure');
      }
    } catch (error) {
      console.error('Error assigning batch expenditures:', error);
    }
  };

  return {
    handleCreateJob,
    handleEditJob,
    handleUpdateJob,
    handleDeleteJob,
    handleUpdateProduced,
    handleImportBOM,
    toggleGroup,
    handleBatchTransactionsAssigned,
    handleBatchExpendituresAssigned
  };
}
