
import { IndJob } from '@/lib/types';

export const useJobMetrics = (jobs: IndJob[]) => {
  const calculateJobRevenue = (job: IndJob) =>
    job.income.reduce((sum, tx) => sum + tx.totalPrice, 0);

  const calculateJobProfit = (job: IndJob) => {
    const expenditure = job.expenditures.reduce((sum, tx) => sum + tx.totalPrice, 0);
    const income = job.income.reduce((sum, tx) => sum + tx.totalPrice, 0);
    return income - expenditure;
  };

  const totalJobs = jobs.length;

  const totalProfit = jobs.reduce((sum, job) => {
    const expenditure = job.expenditures.reduce((sum, tx) => sum + tx.totalPrice, 0);
    const income = job.income.reduce((sum, tx) => sum + tx.totalPrice, 0);
    return sum + (income - expenditure);
  }, 0);

  const totalRevenue = jobs.reduce((sum, job) =>
    sum + job.income.reduce((sum, tx) => sum + tx.totalPrice, 0), 0
  );

  return {
    totalJobs,
    totalProfit,
    totalRevenue,
    calculateJobRevenue,
    calculateJobProfit
  };
};
