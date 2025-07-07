import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { IndJob, IndJobStatusOptions } from '@/types';
import { EditableField } from './EditableField';
import { TransactionImportForm } from './TransactionImportForm';
import { BOMManager } from './BOMManager';
import { formatISK } from '@/utils/currency';
import { Trash2, ChevronDown, ChevronRight } from 'lucide-react';

interface JobCardProps {
  job: IndJob;
  onUpdate: (id: string, updates: Partial<IndJob>) => void;
  onDelete: (id: string) => void;
  onImportTransactions: (jobId: string, transactions: any[], type: 'income' | 'expenditure') => void;
  onImportBOM: (jobId: string, items: any[]) => void;
}

export function JobCard({ 
  job, 
  onUpdate, 
  onDelete, 
  onImportTransactions, 
  onImportBOM 
}: JobCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const statusOptions = Object.values(IndJobStatusOptions).map(status => ({
    value: status,
    label: status
  }));

  const totalIncome = (job.income || []).reduce((sum, tx) => sum + tx.totalPrice, 0);
  const totalExpenditure = (job.expenditures || []).reduce((sum, tx) => sum + Math.abs(tx.totalPrice), 0);
  const actualProfit = totalIncome - totalExpenditure;
  const projectedProfit = (job.projectedRevenue || 0) - (job.projectedCost || 0);

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

  const getProfitColor = (profit: number) => {
    if (profit > 0) return 'text-eve-profit';
    if (profit < 0) return 'text-eve-loss';
    return 'text-eve-neutral';
  };

  return (
    <Card className="bg-gradient-to-br from-card to-card/80 border-border/50 shadow-card">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <EditableField
              value={job.outputItem}
              onSave={(value) => onUpdate(job.id, { outputItem: value as string })}
              placeholder="Output Item"
              className="text-lg font-semibold"
            />
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Quantity:</span>
                <EditableField
                  value={job.outputQuantity}
                  onSave={(value) => onUpdate(job.id, { outputQuantity: value as number })}
                  type="number"
                  className="font-mono"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Produced:</span>
                <EditableField
                  value={job.produced}
                  onSave={(value) => onUpdate(job.id, { produced: value as number })}
                  type="number"
                  placeholder="0"
                  className="font-mono"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(job.status)}>
              <EditableField
                value={job.status}
                onSave={(value) => onUpdate(job.id, { status: value as IndJobStatusOptions })}
                type="select"
                options={statusOptions}
                className="bg-transparent border-none p-0 h-auto"
              />
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(job.id)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Financial Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Total Income</div>
            <div className="font-mono text-sm text-eve-profit">{formatISK(totalIncome)}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Total Costs</div>
            <div className="font-mono text-sm text-eve-loss">{formatISK(totalExpenditure)}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Actual Profit</div>
            <div className={`font-mono text-sm ${getProfitColor(actualProfit)}`}>
              {formatISK(actualProfit)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Projected Profit</div>
            <div className={`font-mono text-sm ${getProfitColor(projectedProfit)}`}>
              {formatISK(projectedProfit)}
            </div>
          </div>
        </div>

        {/* Projected Finances */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-muted-foreground">Projected Cost:</span>
            <EditableField
              value={job.projectedCost}
              onSave={(value) => onUpdate(job.id, { projectedCost: value as number })}
              type="number"
              placeholder="0"
              formatDisplay={(val) => val ? formatISK(val as number) : 'Click to set'}
              className="font-mono"
            />
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Projected Revenue:</span>
            <EditableField
              value={job.projectedRevenue}
              onSave={(value) => onUpdate(job.id, { projectedRevenue: value as number })}
              type="number"
              placeholder="0"
              formatDisplay={(val) => val ? formatISK(val as number) : 'Click to set'}
              className="font-mono"
            />
          </div>
        </div>

        {/* Job Dates */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Job Start:</span>
            <EditableField
              value={job.jobStart?.split('T')[0]}
              onSave={(value) => onUpdate(job.id, { jobStart: value ? new Date(value as string).toISOString() : undefined })}
              type="date"
              placeholder="Not set"
            />
          </div>
          <div>
            <span className="text-muted-foreground">Job End:</span>
            <EditableField
              value={job.jobEnd?.split('T')[0]}
              onSave={(value) => onUpdate(job.id, { jobEnd: value ? new Date(value as string).toISOString() : undefined })}
              type="date"
              placeholder="Not set"
            />
          </div>
        </div>

        {/* Expandable Details */}
        <Collapsible open={showDetails} onOpenChange={setShowDetails}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between">
              <span>Detailed Management</span>
              {showDetails ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-6 mt-4">
            {/* BOM Management */}
            <BOMManager
              job={job}
              onImport={(items) => onImportBOM(job.id, items)}
              onUpdate={onUpdate}
            />

            {/* Transaction Import Forms */}
            <div className="grid gap-6">
              <TransactionImportForm
                type="expenditure"
                title="Import Expenditure Transactions"
                existingTransactions={job.expenditures || []}
                onImport={(transactions) => onImportTransactions(job.id, transactions, 'expenditure')}
              />
              <TransactionImportForm
                type="income"
                title="Import Income Transactions"
                existingTransactions={job.income || []}
                onImport={(transactions) => onImportTransactions(job.id, transactions, 'income')}
              />
            </div>

            {/* Transaction Lists */}
            {(job.expenditures?.length || 0) > 0 && (
              <div>
                <h4 className="font-medium mb-2">Expenditures ({job.expenditures?.length})</h4>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {job.expenditures?.map((tx) => (
                    <div key={tx.id} className="flex justify-between text-sm p-2 bg-muted rounded">
                      <span>{tx.quantity} × {tx.itemName}</span>
                      <span className="font-mono text-eve-loss">{formatISK(tx.totalPrice)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(job.income?.length || 0) > 0 && (
              <div>
                <h4 className="font-medium mb-2">Income ({job.income?.length})</h4>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {job.income?.map((tx) => (
                    <div key={tx.id} className="flex justify-between text-sm p-2 bg-muted rounded">
                      <span>{tx.quantity} × {tx.itemName}</span>
                      <span className="font-mono text-eve-profit">{formatISK(tx.totalPrice)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}