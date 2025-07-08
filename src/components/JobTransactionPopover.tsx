
import { useState } from 'react';
import { IndJob } from '@/lib/types';
import { formatISK } from '@/utils/priceUtils';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface JobTransactionPopoverProps {
  job: IndJob;
  type: 'costs' | 'revenue' | 'profit';
  children: React.ReactNode;
}

const JobTransactionPopover: React.FC<JobTransactionPopoverProps> = ({
  job,
  type,
  children
}) => {
  const [sortDescending, setSortDescending] = useState(true);

  const getTransactions = () => {
    switch (type) {
      case 'costs':
        return job.expenditures || [];
      case 'revenue':
        return job.income || [];
      case 'profit':
        return [...(job.expenditures || []), ...(job.income || [])];
      default:
        return [];
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'costs':
        return 'Cost Breakdown';
      case 'revenue':
        return 'Revenue Breakdown';
      case 'profit':
        return 'Transaction History';
      default:
        return 'Transactions';
    }
  };

  const transactions = getTransactions()
    .map(transaction => ({
      ...transaction,
      displayValue: type === 'costs' ? transaction.totalPrice :
        type === 'revenue' ? transaction.totalPrice :
          transaction.totalPrice
    }))
    .filter(transaction => transaction.displayValue !== 0)
    .sort((a, b) => {
      const aValue = Math.abs(a.displayValue);
      const bValue = Math.abs(b.displayValue);
      return sortDescending ? bValue - aValue : aValue - bValue;
    });

  const toggleSort = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSortDescending(!sortDescending);
  };

  const getTransactionColor = (transaction: any) => {
    if (type === 'profit') {
      // For profit view, show costs as red and revenue as green
      const isExpenditure = (job.expenditures || []).some(exp => exp.id === transaction.id);
      return isExpenditure ? 'text-red-400' : 'text-green-400';
    }
    return type === 'costs' ? 'text-red-400' : 'text-green-400';
  };

  const formatTransactionValue = (transaction: any) => {
    if (type === 'profit') {
      const isExpenditure = (job.expenditures || []).some(exp => exp.id === transaction.id);
      return isExpenditure ? `-${formatISK(transaction.totalPrice)}` : formatISK(transaction.totalPrice);
    }
    return formatISK(transaction.displayValue);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-[30rem] bg-gray-800/95 border-gray-600 text-white max-h-[40rem] overflow-y-auto">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-white flex items-center justify-between">
            <span>{getTitle()}</span>
            <button
              onClick={toggleSort}
              className="flex items-center gap-1 text-sm font-normal text-gray-300 hover:text-white transition-colors"
              title="Click to toggle sort order"
              data-no-navigate
            >
              Sort {sortDescending ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </CardTitle>
          <div className="text-sm text-gray-400">
            {job.outputItem} (ID: {job.id})
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {transactions.length === 0 ? (
            <p className="text-gray-400 text-sm">No transactions to display</p>
          ) : (
            transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex justify-between items-center p-2 rounded hover:bg-gray-700/50 transition-colors border-l-2 border-l-gray-600"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate" title={transaction.itemName}>
                    {transaction.itemName}
                  </div>
                  <div className="text-xs text-gray-400">
                    Qty: {transaction.quantity.toLocaleString()} • {new Date(transaction.date).toLocaleDateString()}
                  </div>
                </div>
                <div className={`text-sm font-medium ml-2 ${getTransactionColor(transaction)}`}>
                  {formatTransactionValue(transaction)}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </PopoverContent>
    </Popover>
  );
};

export default JobTransactionPopover;
