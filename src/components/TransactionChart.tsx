import React, { useState } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatISK } from '@/utils/priceUtils';
import { IndJob } from '@/lib/types';
import { format, parseISO } from 'date-fns';

interface TransactionChartProps {
  job?: IndJob;
  jobs?: IndJob[];
  type: 'costs' | 'revenue' | 'profit' | 'overview' | 'total-revenue' | 'total-profit';
  isOpen: boolean;
  onClose: () => void;
}

const TransactionChart: React.FC<TransactionChartProps> = ({
  job,
  jobs,
  type,
  isOpen,
  onClose
}) => {
  const [hiddenLines, setHiddenLines] = useState<Set<string>>(new Set());

  const toggleLine = (dataKey: string) => {
    const newHidden = new Set(hiddenLines);
    if (newHidden.has(dataKey)) {
      newHidden.delete(dataKey);
    } else {
      newHidden.add(dataKey);
    }
    setHiddenLines(newHidden);
  };

  const getSmartTimeFormat = (transactions: any[]) => {
    if (transactions.length === 0) return 'day';
    
    // Calculate time span
    const dates = transactions.map(tx => new Date(tx.date));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    const timeSpanDays = Math.max((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24), 1);
    
    // Calculate transaction density per day
    const transactionsPerDay = transactions.length / timeSpanDays;
    
    // Smart scoping: if many transactions per day or short timespan with multiple transactions, use hourly
    if ((transactionsPerDay > 5 && timeSpanDays < 7) || (transactions.length > 3 && timeSpanDays <= 1)) {
      return 'hour';
    }
    return 'day';
  };

  const getJobChartData = (job: IndJob) => {
    // Combine all transactions and group by date
    const allTransactions = [
      ...job.expenditures.map(tx => ({ ...tx, type: 'expenditure' })),
      ...job.income.map(tx => ({ ...tx, type: 'income' }))
    ];

    const timeFormat = getSmartTimeFormat(allTransactions);
    
    // Group by appropriate time unit
    const dateMap = new Map<string, { costs: number; revenue: number; date: string }>();

    allTransactions.forEach(tx => {
      const dateStr = timeFormat === 'hour' 
        ? format(parseISO(tx.date), 'yyyy-MM-dd HH:00')
        : format(parseISO(tx.date), 'yyyy-MM-dd');
      
      if (!dateMap.has(dateStr)) {
        dateMap.set(dateStr, { costs: 0, revenue: 0, date: dateStr });
      }
      const entry = dateMap.get(dateStr)!;
      if (tx.type === 'expenditure') {
        entry.costs += tx.totalPrice;
      } else {
        entry.revenue += tx.totalPrice;
      }
    });

    // Convert to array and calculate profit
    const sortedData = Array.from(dateMap.values())
      .map(entry => ({
        ...entry,
        profit: entry.revenue - entry.costs,
        formattedDate: timeFormat === 'hour'
          ? format(new Date(entry.date), 'MMM dd HH:mm')
          : format(new Date(entry.date), 'MMM dd')
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Add cumulative values
    let cumulativeCosts = 0;
    let cumulativeRevenue = 0;
    let cumulativeProfit = 0;

    return sortedData.map(entry => {
      cumulativeCosts += entry.costs;
      cumulativeRevenue += entry.revenue;
      cumulativeProfit += entry.profit;
      return {
        ...entry,
        cumulativeCosts,
        cumulativeRevenue,
        cumulativeProfit
      };
    });
  };

  const getOverviewChartData = (jobs: IndJob[]) => {
    // Combine all transactions from all jobs
    const allTransactions = jobs.flatMap(job => [
      ...job.expenditures.map(tx => ({ ...tx, type: 'expenditure' })),
      ...job.income.map(tx => ({ ...tx, type: 'income' }))
    ]);

    const timeFormat = getSmartTimeFormat(allTransactions);
    const dateMap = new Map<string, { revenue: number; profit: number; date: string }>();

    allTransactions.forEach(tx => {
      const dateStr = timeFormat === 'hour' 
        ? format(parseISO(tx.date), 'yyyy-MM-dd HH:00')
        : format(parseISO(tx.date), 'yyyy-MM-dd');
      
      if (!dateMap.has(dateStr)) {
        dateMap.set(dateStr, { revenue: 0, profit: 0, date: dateStr });
      }
      const entry = dateMap.get(dateStr)!;
      if (tx.type === 'income') {
        entry.revenue += tx.totalPrice;
        entry.profit += tx.totalPrice;
      } else {
        entry.profit -= tx.totalPrice;
      }
    });

    const sortedData = Array.from(dateMap.values())
      .map(entry => ({
        ...entry,
        formattedDate: timeFormat === 'hour'
          ? format(new Date(entry.date), 'MMM dd HH:mm')
          : format(new Date(entry.date), 'MMM dd')
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Add cumulative values
    let cumulativeRevenue = 0;
    let cumulativeProfit = 0;

    return sortedData.map(entry => {
      cumulativeRevenue += entry.revenue;
      cumulativeProfit += entry.profit;
      return {
        ...entry,
        cumulativeRevenue,
        cumulativeProfit
      };
    });
  };

  const formatTooltipValue = (value: number) => formatISK(value);

  const data = (type === 'overview' || type === 'total-revenue' || type === 'total-profit') && jobs ? getOverviewChartData(jobs) : job ? getJobChartData(job) : [];

  const getTitle = () => {
    if (type === 'overview') return 'Overview - Revenue & Profit Over Time';
    if (type === 'total-revenue') return 'Total Revenue Over Time';
    if (type === 'total-profit') return 'Total Profit Over Time';
    if (job) {
      switch (type) {
        case 'costs': return `${job.outputItem} - Costs Over Time`;
        case 'revenue': return `${job.outputItem} - Revenue Over Time`;
        case 'profit': return `${job.outputItem} - Costs, Revenue & Profit Over Time`;
        default: return `${job.outputItem} - Transaction History`;
      }
    }
    return 'Transaction History';
  };

  const renderChart = () => {
    if (type === 'total-revenue') {
      return (
        <AreaChart data={data} margin={{ top: 20, right: 80, left: 80, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="formattedDate" stroke="#9CA3AF" />
          <YAxis stroke="#9CA3AF" tickFormatter={formatTooltipValue} width={70} />
          <Tooltip 
            formatter={formatTooltipValue}
            labelStyle={{ color: '#F3F4F6' }}
            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="cumulativeRevenue"
            stroke="#10B981"
            fill="#10B981"
            fillOpacity={0.3}
            name="Cumulative Revenue"
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#059669"
            strokeWidth={2}
            name="Revenue per Day"
            dot={false}
          />
        </AreaChart>
      );
    }

    if (type === 'total-profit') {
      return (
        <AreaChart data={data} margin={{ top: 20, right: 80, left: 80, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="formattedDate" stroke="#9CA3AF" />
          <YAxis stroke="#9CA3AF" tickFormatter={formatTooltipValue} width={70} />
          <Tooltip 
            formatter={formatTooltipValue}
            labelStyle={{ color: '#F3F4F6' }}
            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="cumulativeProfit"
            stroke="#3B82F6"
            fill="#3B82F6"
            fillOpacity={0.3}
            name="Cumulative Profit"
          />
          <Line
            type="monotone"
            dataKey="profit"
            stroke="#1E40AF"
            strokeWidth={2}
            name="Profit per Day"
            dot={false}
          />
        </AreaChart>
      );
    }

    if (type === 'overview') {
      return (
        <AreaChart data={data} margin={{ top: 20, right: 80, left: 80, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="formattedDate" stroke="#9CA3AF" />
          <YAxis stroke="#9CA3AF" tickFormatter={formatTooltipValue} width={70} />
          <Tooltip 
            formatter={formatTooltipValue}
            labelStyle={{ color: '#F3F4F6' }}
            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="cumulativeRevenue"
            stroke="#10B981"
            fill="#10B981"
            fillOpacity={0.3}
            name="Cumulative Revenue"
          />
          <Area
            type="monotone"
            dataKey="cumulativeProfit"
            stroke="#3B82F6"
            fill="#3B82F6"
            fillOpacity={0.3}
            name="Cumulative Profit"
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#059669"
            strokeWidth={2}
            name="Revenue per Day"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="profit"
            stroke="#1E40AF"
            strokeWidth={2}
            name="Profit per Day"
            dot={false}
          />
        </AreaChart>
      );
    }

    if (type === 'costs') {
      return (
        <AreaChart data={data} margin={{ top: 20, right: 80, left: 80, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="formattedDate" stroke="#9CA3AF" />
          <YAxis stroke="#9CA3AF" tickFormatter={formatTooltipValue} width={70} />
          <Tooltip 
            formatter={formatTooltipValue}
            labelStyle={{ color: '#F3F4F6' }}
            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="cumulativeCosts"
            stroke="#EF4444"
            fill="#EF4444"
            fillOpacity={0.3}
            name="Cumulative Costs"
          />
          <Line
            type="monotone"
            dataKey="costs"
            stroke="#DC2626"
            strokeWidth={2}
            name="Costs per Day"
            dot={false}
          />
        </AreaChart>
      );
    }

    if (type === 'revenue') {
      return (
        <AreaChart data={data} margin={{ top: 20, right: 80, left: 80, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="formattedDate" stroke="#9CA3AF" />
          <YAxis stroke="#9CA3AF" tickFormatter={formatTooltipValue} width={70} />
          <Tooltip 
            formatter={formatTooltipValue}
            labelStyle={{ color: '#F3F4F6' }}
            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="cumulativeRevenue"
            stroke="#10B981"
            fill="#10B981"
            fillOpacity={0.3}
            name="Cumulative Revenue"
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#059669"
            strokeWidth={2}
            name="Revenue per Day"
            dot={false}
          />
        </AreaChart>
      );
    }

    // Profit chart - entire job view
    return (
      <AreaChart data={data} margin={{ top: 20, right: 80, left: 80, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="formattedDate" stroke="#9CA3AF" />
        <YAxis stroke="#9CA3AF" tickFormatter={formatTooltipValue} width={70} />
        <Tooltip 
          formatter={formatTooltipValue}
          labelStyle={{ color: '#F3F4F6' }}
          contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
        />
        <Legend />
        <Area
          type="monotone"
          dataKey="cumulativeCosts"
          stroke="#EF4444"
          fill="#EF4444"
          fillOpacity={0.3}
          name="Cumulative Costs"
        />
        <Area
          type="monotone"
          dataKey="cumulativeRevenue"
          stroke="#10B981"
          fill="#10B981"
          fillOpacity={0.3}
          name="Cumulative Revenue"
        />
        <Line
          type="monotone"
          dataKey="profit"
          stroke="#3B82F6"
          strokeWidth={2}
          name="Profit per Day"
          dot={false}
        />
      </AreaChart>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
      }
    }}>
      <DialogContent className="max-w-6xl w-[90vw] h-[80vh] bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">{getTitle()}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 h-full">
          <ResponsiveContainer width="100%" height="90%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }} 
            className="border-gray-600"
            data-no-navigate
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionChart;