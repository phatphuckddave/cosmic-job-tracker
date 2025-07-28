import { useMemo } from 'react';
import { IndJob } from '@/lib/types';

export const useJobCardMetrics = (job: IndJob) => {
  return useMemo(() => {
    // Sort transactions once and cache the results
    const sortedExpenditures = [...job.expenditures].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const sortedIncome = [...job.income].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Calculate core metrics
    const totalExpenditure = job.expenditures.reduce((sum, tx) => sum + tx.totalPrice, 0);
    const totalIncome = job.income.reduce((sum, tx) => sum + tx.totalPrice, 0);
    const profit = totalIncome - totalExpenditure;
    const margin = totalIncome > 0 ? ((profit / totalIncome) * 100) : 0;

    // Performance metrics calculation
    const itemsSold = job.income.reduce((sum, tx) => sum + tx.quantity, 0);
    const produced = job.produced || 0;
    const showPerformanceIndicator = produced > 0 && itemsSold > 0 && job.projectedRevenue > 0;

    let performancePercentage = 0;
    if (showPerformanceIndicator) {
      const expectedPPU = job.projectedRevenue / produced;
      const actualPPU = totalIncome / itemsSold;
      performancePercentage = (actualPPU / expectedPPU) * 100;
    }

    return {
      sortedExpenditures,
      sortedIncome,
      totalExpenditure,
      totalIncome,
      profit,
      margin,
      itemsSold,
      produced,
      showPerformanceIndicator,
      performancePercentage
    };
  }, [
    job.expenditures,
    job.income,
    job.produced,
    job.projectedRevenue
  ]);
};