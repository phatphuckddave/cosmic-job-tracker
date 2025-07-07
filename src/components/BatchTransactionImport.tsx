import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { parseTransactionData } from '@/utils/transactionParser';
import { IndJob, IndTransactionRecord, IndJobStatusOptions } from '@/types';
import { formatISK } from '@/utils/currency';

interface BatchTransactionImportProps {
  jobs: IndJob[];
  onImport: (jobId: string, transactions: Omit<IndTransactionRecord, 'id' | 'created' | 'updated' | 'job'>[]) => void;
}

export function BatchTransactionImport({ jobs, onImport }: BatchTransactionImportProps) {
  const [rawData, setRawData] = useState('');
  const [groupedTransactions, setGroupedTransactions] = useState<Record<string, Omit<IndTransactionRecord, 'id' | 'created' | 'updated' | 'job'>[]>>({});
  const [jobAssignments, setJobAssignments] = useState<Record<string, string>>({});

  // Filter jobs to only show Running, Selling, and Tracked
  const eligibleJobs = jobs.filter(job => 
    job.status === IndJobStatusOptions.Running ||
    job.status === IndJobStatusOptions.Selling ||
    job.status === IndJobStatusOptions.Tracked
  );

  const handleDataChange = (value: string) => {
    setRawData(value);
    
    if (value.trim()) {
      const parsed = parseTransactionData(value);
      
      // Group transactions by item name
      const grouped = parsed.reduce((acc, tx) => {
        if (!acc[tx.itemName]) {
          acc[tx.itemName] = [];
        }
        acc[tx.itemName].push(tx);
        return acc;
      }, {} as Record<string, Omit<IndTransactionRecord, 'id' | 'created' | 'updated' | 'job'>[]>);
      
      setGroupedTransactions(grouped);
      
      // Auto-assign to jobs if there's an exact match
      const autoAssignments: Record<string, string> = {};
      Object.keys(grouped).forEach(itemName => {
        const matchingJob = eligibleJobs.find(job => 
          job.outputItem.toLowerCase() === itemName.toLowerCase()
        );
        if (matchingJob) {
          autoAssignments[itemName] = matchingJob.id;
        }
      });
      setJobAssignments(autoAssignments);
    } else {
      setGroupedTransactions({});
      setJobAssignments({});
    }
  };

  const handleAssignmentChange = (itemName: string, jobId: string) => {
    setJobAssignments(prev => ({
      ...prev,
      [itemName]: jobId
    }));
  };

  const handleImportAll = () => {
    Object.entries(groupedTransactions).forEach(([itemName, transactions]) => {
      const assignedJobId = jobAssignments[itemName];
      if (assignedJobId) {
        onImport(assignedJobId, transactions);
      }
    });
    
    // Clear after import
    setRawData('');
    setGroupedTransactions({});
    setJobAssignments({});
  };

  const handleClear = () => {
    setRawData('');
    setGroupedTransactions({});
    setJobAssignments({});
  };

  const totalAssigned = Object.values(jobAssignments).filter(Boolean).length;
  const totalGroups = Object.keys(groupedTransactions).length;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          Batch Import Sales Transactions
          {totalGroups > 0 && (
            <Badge variant="secondary">
              {totalAssigned}/{totalGroups} assigned
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Textarea
            placeholder="Paste sales transaction data here..."
            value={rawData}
            onChange={(e) => handleDataChange(e.target.value)}
            className="min-h-[120px] font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground mt-1">
            This will group transactions by item name and allow you to assign them to Running/Selling/Tracked jobs.
          </p>
        </div>

        {Object.keys(groupedTransactions).length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium">Transaction Groups:</h4>
            {Object.entries(groupedTransactions).map(([itemName, transactions]) => {
              const totalValue = transactions.reduce((sum, tx) => sum + tx.totalPrice, 0);
              const totalQuantity = transactions.reduce((sum, tx) => sum + tx.quantity, 0);
              
              return (
                <div key={itemName} className="p-4 border rounded-lg space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-medium">{itemName}</h5>
                      <p className="text-sm text-muted-foreground">
                        {transactions.length} transactions, {totalQuantity.toLocaleString()} units, {formatISK(totalValue)}
                      </p>
                    </div>
                    <Select 
                      value={jobAssignments[itemName] || ""} 
                      onValueChange={(value) => handleAssignmentChange(itemName, value)}
                    >
                      <SelectTrigger className="w-64">
                        <SelectValue placeholder="Assign to job..." />
                      </SelectTrigger>
                      <SelectContent>
                        {eligibleJobs.map(job => (
                          <SelectItem key={job.id} value={job.id}>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant="outline" 
                                className={
                                  job.status === IndJobStatusOptions.Running ? 'text-green-400' :
                                  job.status === IndJobStatusOptions.Selling ? 'text-yellow-400' :
                                  'text-cyan-400'
                                }
                              >
                                {job.status}
                              </Badge>
                              {job.outputItem}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="max-h-24 overflow-y-auto">
                    {transactions.slice(0, 3).map((tx, index) => (
                      <div key={index} className="text-xs text-muted-foreground">
                        {tx.quantity} × {formatISK(tx.unitPrice)} = {formatISK(tx.totalPrice)} ({new Date(tx.date).toLocaleDateString()})
                      </div>
                    ))}
                    {transactions.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        ... and {transactions.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {totalGroups > 0 && (
          <div className="flex gap-2">
            <Button 
              onClick={handleImportAll} 
              disabled={totalAssigned === 0}
              className="flex-1"
            >
              Import {totalAssigned} Groups
            </Button>
            <Button onClick={handleClear} variant="outline">
              Clear
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}