
import JobForm from '@/components/JobForm';
import BatchTransactionForm from '@/components/BatchTransactionForm';
import BatchExpenditureForm from '@/components/BatchExpenditureForm';
import SearchOverlay from '@/components/SearchOverlay';
import TransactionChart from '@/components/TransactionChart';
import DashboardStats from '@/components/DashboardStats';
import JobsToolbar from '@/components/JobsToolbar';
import JobsSection from '@/components/JobsSection';
import { useDashboard } from '@/hooks/useDashboard';
import { useDashboardHandlers } from '@/hooks/useDashboardHandlers';
import { useJobMetrics } from '@/hooks/useJobMetrics';
import { categorizeJobs } from '@/utils/jobFiltering';

const Index = () => {
  const {
    jobs,
    loading,
    error,
    loadingStatuses,
    showJobForm,
    setShowJobForm,
    editingJob,
    setEditingJob,
    showBatchForm,
    setShowBatchForm,
    showBatchExpenditureForm,
    setShowBatchExpenditureForm,
    searchOpen,
    setSearchOpen,
    searchQuery,
    setSearchQuery,
    totalRevenueChartOpen,
    setTotalRevenueChartOpen,
    totalProfitChartOpen,
    setTotalProfitChartOpen,
    collapsedGroups,
    setCollapsedGroups,
    containerRef,
    createJob,
    updateJob,
    deleteJob,
    createMultipleTransactions,
    createMultipleBillItems,
    loadJobsForStatuses
  } = useDashboard();

  const {
    handleCreateJob,
    handleEditJob,
    handleUpdateJob,
    handleDeleteJob,
    handleUpdateProduced,
    handleImportBOM,
    toggleGroup,
    handleBatchTransactionsAssigned,
    handleBatchExpendituresAssigned
  } = useDashboardHandlers({
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
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 p-6 flex items-center justify-center">
        <div className="text-white">Loading jobs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 p-6 flex items-center justify-center">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  const { regularJobs, trackedJobs } = categorizeJobs(jobs, searchQuery);
  const { totalJobs, totalProfit, totalRevenue, calculateJobRevenue, calculateJobProfit } = useJobMetrics(regularJobs);

  if (showJobForm) {
    return (
      <div className="min-h-screen bg-gray-950 p-6">
        <div className="max-w-4xl mx-auto">
          <JobForm
            job={editingJob || undefined}
            onSubmit={editingJob ? (jobData) => handleUpdateJob(jobData, editingJob) : handleCreateJob}
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
    <div ref={containerRef} className="container mx-auto p-4 space-y-4">
      <SearchOverlay
        isOpen={searchOpen}
        onClose={() => {
          setSearchOpen(false);
          setSearchQuery('');
        }}
        onSearch={setSearchQuery}
      />

      <DashboardStats
        totalJobs={totalJobs}
        totalRevenue={totalRevenue}
        totalProfit={totalProfit}
        jobs={regularJobs}
        calculateJobRevenue={calculateJobRevenue}
        calculateJobProfit={calculateJobProfit}
        onTotalRevenueChart={() => setTotalRevenueChartOpen(true)}
        onTotalProfitChart={() => setTotalProfitChartOpen(true)}
      />

      <div className="space-y-4">
        <JobsToolbar
          onNewJob={() => {
            setEditingJob(null);
            setShowJobForm(true);
          }}
          onBatchIncome={() => setShowBatchForm(true)}
          onBatchExpenditure={() => setShowBatchExpenditureForm(true)}
        />

        <JobsSection
          regularJobs={regularJobs}
          trackedJobs={trackedJobs}
          collapsedGroups={collapsedGroups}
          loadingStatuses={loadingStatuses}
          onToggleGroup={toggleGroup}
          onEdit={handleEditJob}
          onDelete={handleDeleteJob}
          onUpdateProduced={handleUpdateProduced}
          onImportBOM={handleImportBOM}
        />
      </div>

      {showBatchForm && (
        <BatchTransactionForm
          jobs={jobs}
          onClose={() => setShowBatchForm(false)}
          onTransactionsAssigned={handleBatchTransactionsAssigned}
        />
      )}

      {showBatchExpenditureForm && (
        <BatchExpenditureForm
          jobs={jobs}
          onClose={() => setShowBatchExpenditureForm(false)}
          onTransactionsAssigned={handleBatchExpendituresAssigned}
        />
      )}

      <TransactionChart
        jobs={regularJobs}
        type="total-revenue"
        isOpen={totalRevenueChartOpen}
        onClose={() => setTotalRevenueChartOpen(false)}
      />

      <TransactionChart
        jobs={regularJobs}
        type="total-profit"
        isOpen={totalProfitChartOpen}
        onClose={() => setTotalProfitChartOpen(false)}
      />
    </div>
  );
};

export default Index;
