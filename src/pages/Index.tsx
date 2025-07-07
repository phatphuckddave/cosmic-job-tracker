import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useJobs } from '@/hooks/useDataService';
import { IndJob, IndJobStatusOptions, CollapsedSections } from '@/types';
import { JobCard } from '@/components/JobCard';
import { CreateJobDialog } from '@/components/CreateJobDialog';
import { BatchTransactionImport } from '@/components/BatchTransactionImport';
import { formatISK } from '@/utils/currency';
import { ChevronDown, ChevronRight, Factory } from 'lucide-react';

const Index = () => {
  const { 
    jobs, 
    loading, 
    error, 
    createJob, 
    updateJob, 
    deleteJob, 
    createMultipleTransactions,
    createMultipleBillItems 
  } = useJobs();

  // User preferences for collapsed sections
  const [collapsedSections, setCollapsedSections] = useState<CollapsedSections>(() => {
    const stored = localStorage.getItem('eve-industry-collapsed-sections');
    return stored ? JSON.parse(stored) : {};
  });

  useEffect(() => {
    localStorage.setItem('eve-industry-collapsed-sections', JSON.stringify(collapsedSections));
  }, [collapsedSections]);

  const toggleSection = (status: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [status]: !prev[status]
    }));
  };

  // Group jobs by status
  const jobsByStatus = jobs.reduce((acc, job) => {
    if (!acc[job.status]) {
      acc[job.status] = [];
    }
    acc[job.status].push(job);
    return acc;
  }, {} as Record<IndJobStatusOptions, IndJob[]>);

  // Calculate totals (excluding Tracked jobs)
  const totals = jobs
    .filter(job => job.status !== IndJobStatusOptions.Tracked)
    .reduce((acc, job) => {
      const income = (job.income || []).reduce((sum, tx) => sum + tx.totalPrice, 0);
      const expenditure = (job.expenditures || []).reduce((sum, tx) => sum + Math.abs(tx.totalPrice), 0);
      const projectedRevenue = job.projectedRevenue || 0;
      const projectedCost = job.projectedCost || 0;
      
      acc.totalIncome += income;
      acc.totalExpenditure += expenditure;
      acc.projectedRevenue += projectedRevenue;
      acc.projectedCost += projectedCost;
      
      return acc;
    }, {
      totalIncome: 0,
      totalExpenditure: 0,
      projectedRevenue: 0,
      projectedCost: 0,
    });

  const actualProfit = totals.totalIncome - totals.totalExpenditure;
  const projectedProfit = totals.projectedRevenue - totals.projectedCost;

  const handleCreateJob = (jobData: Omit<IndJob, 'id' | 'created' | 'updated'>) => {
    createJob(jobData);
  };

  const handleUpdateJob = (id: string, updates: Partial<IndJob>) => {
    updateJob(id, updates);
  };

  const handleDeleteJob = (id: string) => {
    deleteJob(id);
  };

  const handleImportTransactions = (jobId: string, transactions: any[], type: 'income' | 'expenditure') => {
    createMultipleTransactions(jobId, transactions, type);
  };

  const handleImportBOM = (jobId: string, items: any[]) => {
    createMultipleBillItems(jobId, items);
  };

  const handleBatchImport = (jobId: string, transactions: any[]) => {
    createMultipleTransactions(jobId, transactions, 'income');
  };

  const getStatusColor = (status: IndJobStatusOptions) => {
    switch (status) {
      case IndJobStatusOptions.Planned: return 'bg-blue-500/20 text-blue-400';
      case IndJobStatusOptions.Acquisition: return 'bg-orange-500/20 text-orange-400';
      case IndJobStatusOptions.Running: return 'bg-green-500/20 text-green-400';
      case IndJobStatusOptions.Done: return 'bg-purple-500/20 text-purple-400';
      case IndJobStatusOptions.Selling: return 'bg-yellow-500/20 text-yellow-400';
      case IndJobStatusOptions.Closed: return 'bg-gray-500/20 text-gray-400';
      case IndJobStatusOptions.Tracked: return 'bg-cyan-500/20 text-cyan-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Factory className="h-12 w-12 mx-auto mb-4 animate-pulse text-primary" />
          <p className="text-muted-foreground">Loading industry jobs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Error: {error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Factory className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  EVE Industry Manager
                </h1>
                <p className="text-sm text-muted-foreground">Manufacturing & Sales Tracking</p>
              </div>
            </div>
            
            {/* Global Statistics */}
            <div className="hidden md:flex items-center gap-6 text-sm">
              <div className="text-center">
                <div className="font-mono text-eve-profit">{formatISK(totals.totalIncome)}</div>
                <div className="text-xs text-muted-foreground">Total Income</div>
              </div>
              <div className="text-center">
                <div className="font-mono text-eve-loss">{formatISK(totals.totalExpenditure)}</div>
                <div className="text-xs text-muted-foreground">Total Costs</div>
              </div>
              <div className="text-center">
                <div className={`font-mono ${actualProfit >= 0 ? 'text-eve-profit' : 'text-eve-loss'}`}>
                  {formatISK(actualProfit)}
                </div>
                <div className="text-xs text-muted-foreground">Net Profit</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Action Panel */}
        <div className="grid gap-4 md:grid-cols-2">
          <CreateJobDialog onCreateJob={handleCreateJob} />
          <BatchTransactionImport jobs={jobs} onImport={handleBatchImport} />
        </div>

        {/* Mobile Statistics */}
        <div className="md:hidden grid grid-cols-3 gap-4 p-4 bg-card rounded-lg">
          <div className="text-center">
            <div className="font-mono text-sm text-eve-profit">{formatISK(totals.totalIncome)}</div>
            <div className="text-xs text-muted-foreground">Income</div>
          </div>
          <div className="text-center">
            <div className="font-mono text-sm text-eve-loss">{formatISK(totals.totalExpenditure)}</div>
            <div className="text-xs text-muted-foreground">Costs</div>
          </div>
          <div className="text-center">
            <div className={`font-mono text-sm ${actualProfit >= 0 ? 'text-eve-profit' : 'text-eve-loss'}`}>
              {formatISK(actualProfit)}
            </div>
            <div className="text-xs text-muted-foreground">Profit</div>
          </div>
        </div>

        {/* Jobs by Status */}
        <div className="space-y-4">
          {Object.values(IndJobStatusOptions).map(status => {
            const statusJobs = jobsByStatus[status] || [];
            const isCollapsed = collapsedSections[status];
            
            if (statusJobs.length === 0) return null;

            return (
              <Collapsible key={status} open={!isCollapsed} onOpenChange={() => toggleSection(status)}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-4 h-auto">
                    <div className="flex items-center gap-3">
                      {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      <Badge className={getStatusColor(status)}>{status}</Badge>
                      <span className="font-medium">{statusJobs.length} jobs</span>
                    </div>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="grid gap-4 mt-4 md:grid-cols-2 lg:grid-cols-3">
                    {statusJobs.map(job => (
                      <JobCard
                        key={job.id}
                        job={job}
                        onUpdate={handleUpdateJob}
                        onDelete={handleDeleteJob}
                        onImportTransactions={handleImportTransactions}
                        onImportBOM={handleImportBOM}
                      />
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>

        {/* Empty State */}
        {jobs.length === 0 && (
          <div className="text-center py-12">
            <Factory className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Industry Jobs</h3>
            <p className="text-muted-foreground mb-6">Create your first manufacturing job to get started.</p>
            <CreateJobDialog onCreateJob={handleCreateJob} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
