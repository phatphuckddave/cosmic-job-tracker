
import { useMemo } from 'react';
import { IndJob } from '@/lib/types';

export const useJobMetrics = (jobs: IndJob[]) => {
  // Memoize individual job calculations to avoid recalculating on every render
  const calculateJobRevenue = useMemo(() => (job: IndJob) => {
    return job.income.reduce((sum, tx) => sum + tx.totalPrice, 0);
  }, []);

  const calculateJobProfit = useMemo(() => (job: IndJob) => {
    const expenditure = job.expenditures.reduce((sum, tx) => sum + tx.totalPrice, 0);
    const income = job.income.reduce((sum, tx) => sum + tx.totalPrice, 0);
    return income - expenditure;
  }, []);

  // Memoize expensive aggregation calculations - only recalculate when jobs actually change
  const metrics = useMemo(() => {
    const totalJobs = jobs.length;
    
    // Single pass through jobs to calculate both revenue and profit
    let totalRevenue = 0;
    let totalProfit = 0;
    
    for (const job of jobs) {
      const expenditure = job.expenditures.reduce((sum, tx) => sum + tx.totalPrice, 0);
      const income = job.income.reduce((sum, tx) => sum + tx.totalPrice, 0);
      
      totalRevenue += income;
      totalProfit += (income - expenditure);
    }

    return {
      totalJobs,
      totalRevenue,
      totalProfit
    };
  }, [jobs]);

  return {
    ...metrics,
    calculateJobRevenue,
    calculateJobProfit
  };
};
