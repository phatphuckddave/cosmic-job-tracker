import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, Factory, TrendingUp, Briefcase, FileText, Settings, BarChart3 } from 'lucide-react';
import { IndTransactionRecordNoId, IndJobRecordNoId } from '@/lib/pbtypes';
import { formatISK } from '@/utils/priceUtils';
import { getStatusPriority } from '@/utils/jobStatusUtils';
import JobForm from '@/components/JobForm';
import JobGroup from '@/components/JobGroup';
import { IndJob } from '@/lib/types';
import BatchTransactionForm from '@/components/BatchTransactionForm';
import { useJobs } from '@/hooks/useDataService';
import { useJobMetrics } from '@/hooks/useJobMetrics';
import SearchOverlay from '@/components/SearchOverlay';
import RecapPopover from '@/components/RecapPopover';
import TransactionChart from '@/components/TransactionChart';

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
  const [totalRevenueChartOpen, setTotalRevenueChartOpen] = useState(false);
  const [totalProfitChartOpen, setTotalProfitChartOpen] = useState(false);
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

  const { totalJobs, totalProfit, totalRevenue, calculateJobRevenue, calculateJobProfit } = useJobMetrics(regularJobs);

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

    if (collapsedGroups[status]) {
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
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 ml-auto"
                onClick={() => setTotalRevenueChartOpen(true)}
              >
                <BarChart3 className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RecapPopover
              title="Revenue Breakdown"
              jobs={regularJobs}
              calculateJobValue={calculateJobRevenue}
            >
              <div className="text-2xl font-bold text-green-400 cursor-pointer hover:text-green-300 transition-colors">
                {formatISK(totalRevenue)}
              </div>
            </RecapPopover>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-700 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Total Profit
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 ml-auto"
                onClick={() => setTotalProfitChartOpen(true)}
              >
                <BarChart3 className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RecapPopover
              title="Profit Breakdown"
              jobs={regularJobs}
              calculateJobValue={calculateJobProfit}
            >
              <div className={`text-2xl font-bold cursor-pointer transition-colors ${totalProfit >= 0 ? 'text-green-400 hover:text-green-300' : 'text-red-400 hover:text-red-300'}`}>
                {formatISK(totalProfit)}
              </div>
            </RecapPopover>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Jobs</h2>
          <div className="flex gap-2">
            <SalesTaxConfig />
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
            <JobGroup
              key={status}
              status={status}
              jobs={statusJobs}
              isCollapsed={collapsedGroups[status] || false}
              onToggle={toggleGroup}
              onEdit={handleEditJob}
              onDelete={handleDeleteJob}
              onUpdateProduced={handleUpdateProduced}
              onImportBOM={handleImportBOM}
            />
          ))}
        </div>
      </div>

      {trackedJobs.length > 0 && (
        <div className="space-y-4 mt-8 pt-8 border-t border-gray-700">
          <JobGroup
            status="Tracked"
            jobs={trackedJobs}
            isCollapsed={collapsedGroups['Tracked'] || false}
            onToggle={toggleGroup}
            onEdit={handleEditJob}
            onDelete={handleDeleteJob}
            onUpdateProduced={handleUpdateProduced}
            onImportBOM={handleImportBOM}
            isTracked={true}
          />
        </div>
      )}

      {showBatchForm && (
        <BatchTransactionForm
          jobs={jobs}
          onClose={() => setShowBatchForm(false)}
          onTransactionsAssigned={handleBatchTransactionsAssigned}
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

const SalesTaxConfig = () => {
  const [salesTax, setSalesTax] = useState(() => {
    return localStorage.getItem('salesTax') || '0';
  });
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = () => {
    localStorage.setItem('salesTax', salesTax);
    setIsOpen(false);
    // Trigger a re-render of job cards by dispatching a storage event
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'salesTax',
      newValue: salesTax
    }));
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="border-gray-600 hover:bg-gray-800"
        >
          <Settings className="w-4 h-4 mr-2" />
          Tax Config
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-gray-900 border-gray-700 text-white">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="salesTax" className="text-sm font-medium text-gray-300">
              Sales Tax (%)
            </Label>
            <Input
              id="salesTax"
              type="number"
              value={salesTax}
              onChange={(e) => setSalesTax(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSave();
                }
              }}
              placeholder="0"
              min="0"
              max="100"
              step="0.1"
              className="bg-gray-800 border-gray-600 text-white"
            />
            <p className="text-xs text-gray-400">
              Applied to minimum price calculations
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default Index;
