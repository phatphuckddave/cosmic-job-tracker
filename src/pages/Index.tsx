import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Factory, TrendingUp, Briefcase, FileText } from 'lucide-react';
import { IndTransactionRecordNoId, IndJobRecordNoId, IndJobStatusOptions } from '@/lib/pbtypes';
import { formatISK } from '@/utils/priceUtils';
import JobCard from '@/components/JobCard';
import JobForm from '@/components/JobForm';
import { IndJob } from '@/lib/types';
import BatchTransactionForm from '@/components/BatchTransactionForm';
import { useJobs } from '@/hooks/useDataService';
import SearchOverlay from '@/components/SearchOverlay';

const Index = () => {
  const {
    jobs,
    loading,
    error,
    createJob,
    updateJob,
    deleteJob,
    createMultipleTransactions,
    createMultipleBillItems,
    loadJobsForStatuses
  } = useJobs();

  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState<IndJob | null>(null);
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('jobGroupsCollapsed');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  const getStatusPriority = (status: IndJobStatusOptions): number => {
    switch (status) {
      case 'Planned': return 6;
      case 'Acquisition': return 1;
      case 'Running': return 2;
      case 'Done': return 3;
      case 'Selling': return 4;
      case 'Closed': return 5;
      case 'Tracked': return 7;
      default: return 0;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Planned': return 'bg-gray-600';
      case 'Acquisition': return 'bg-yellow-600';
      case 'Running': return 'bg-blue-600';
      case 'Done': return 'bg-purple-600';
      case 'Selling': return 'bg-orange-600';
      case 'Closed': return 'bg-green-600';
      case 'Tracked': return 'bg-cyan-600';
      default: return 'bg-gray-600';
    }
  };

  const filterJobs = (jobs: IndJob[]) => {
    if (!searchQuery) return jobs;
    const query = searchQuery.toLowerCase();
    return jobs.filter(job => 
      job.outputItem.toLowerCase().includes(query)
    );
  };

  const sortedJobs = [...jobs].sort((a, b) => {
    const priorityA = getStatusPriority(a.status);
    const priorityB = getStatusPriority(b.status);
    if (priorityA === priorityB) {
      return new Date(b.created || '').getTime() - new Date(a.created || '').getTime();
    }
    return priorityA - priorityB;
  });

  const regularJobs = filterJobs(sortedJobs.filter(job => job.status !== 'Tracked'));
  const trackedJobs = filterJobs(sortedJobs.filter(job => job.status === 'Tracked'));

  const totalJobs = regularJobs.length;
  const totalProfit = regularJobs.reduce((sum, job) => {
    const expenditure = job.expenditures.reduce((sum, tx) => sum + tx.totalPrice, 0);
    const income = job.income.reduce((sum, tx) => sum + tx.totalPrice, 0);
    return sum + (income - expenditure);
  }, 0);

  const totalRevenue = regularJobs.reduce((sum, job) =>
    sum + job.income.reduce((sum, tx) => sum + tx.totalPrice, 0), 0
  );

  const handleCreateJob = async (jobData: IndJobRecordNoId) => {
    try {
      await createJob(jobData);
      setShowJobForm(false);
    } catch (error) {
      console.error('Error creating job:', error);
    }
  };

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

  const jobGroups = regularJobs.reduce((groups, job) => {
    const status = job.status;
    if (!groups[status]) {
      groups[status] = [];
    }
    groups[status].push(job);
    return groups;
  }, {} as Record<string, IndJob[]>);

  const toggleGroup = (status: string) => {
    const newState = { ...collapsedGroups, [status]: !collapsedGroups[status] };
    setCollapsedGroups(newState);
    localStorage.setItem('jobGroupsCollapsed', JSON.stringify(newState));
    
    // Load jobs for newly opened groups
    if (collapsedGroups[status]) {
      // Group is becoming visible, load jobs for this status
      loadJobsForStatuses([status]);
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

  if (showJobForm) {
    return (
      <div className="min-h-screen bg-gray-950 p-6">
        <div className="max-w-4xl mx-auto">
          <JobForm
            job={editingJob || undefined}
            onSubmit={editingJob ? handleUpdateJob : handleCreateJob}
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
    <div className="container mx-auto p-4 space-y-4">
      <SearchOverlay
        isOpen={searchOpen}
        onClose={() => {
          setSearchOpen(false);
          setSearchQuery('');
        }}
        onSearch={setSearchQuery}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-900 border-gray-700 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Factory className="w-5 h-5" />
              Active Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalJobs}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-700 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{formatISK(totalRevenue)}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-700 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Total Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatISK(totalProfit)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Jobs</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowBatchForm(true)}
              className="border-gray-600 hover:bg-gray-800"
            >
              <FileText className="w-4 h-4 mr-2" />
              Batch Assign
            </Button>
            <Button
              onClick={() => {
                setEditingJob(null);
                setShowJobForm(true);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Job
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {Object.entries(jobGroups).map(([status, statusJobs]) => (
            <div key={status} className="space-y-4">
              <div
                className={`${getStatusColor(status)} rounded-lg cursor-pointer select-none transition-colors hover:opacity-90`}
                onClick={() => toggleGroup(status)}
              >
                <div className="flex items-center justify-between p-4">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-3">
                    <span>{status}</span>
                    <span className="text-gray-200 text-lg">({statusJobs.length} jobs)</span>
                  </h3>
                  <div className={`text-white text-lg transition-transform ${collapsedGroups[status] ? '-rotate-90' : 'rotate-0'}`}>
                    ⌄
                  </div>
                </div>
              </div>

              {!collapsedGroups[status] && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {statusJobs.map(job => (
                    <JobCard
                      key={job.id}
                      job={job}
                      onEdit={handleEditJob}
                      onDelete={handleDeleteJob}
                      onUpdateProduced={handleUpdateProduced}
                      onImportBOM={handleImportBOM}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {trackedJobs.length > 0 && (
        <div className="space-y-4 mt-8 pt-8 border-t border-gray-700">
          <div
            className="bg-cyan-600 rounded-lg cursor-pointer select-none transition-colors hover:opacity-90"
            onClick={() => toggleGroup('Tracked')}
          >
            <div className="flex items-center justify-between p-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <span>Tracked Transactions</span>
                <span className="text-gray-200 text-lg">({trackedJobs.length} jobs)</span>
              </h2>
              <div className={`text-white text-lg transition-transform ${collapsedGroups['Tracked'] ? '-rotate-90' : 'rotate-0'}`}>
                ⌄
              </div>
            </div>
          </div>

          {!collapsedGroups['Tracked'] && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trackedJobs.map(job => (
                <JobCard
                  key={job.id}
                  job={job}
                  onEdit={handleEditJob}
                  onDelete={handleDeleteJob}
                  onUpdateProduced={handleUpdateProduced}
                  onImportBOM={handleImportBOM}
                  isTracked={true}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {showBatchForm && (
        <BatchTransactionForm
          jobs={jobs}
          onClose={() => setShowBatchForm(false)}
          onTransactionsAssigned={handleBatchTransactionsAssigned}
        />
      )}
    </div>
  );
};

export default Index;
