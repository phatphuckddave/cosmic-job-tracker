import { IndJob, IndTransactionRecord, IndBillitemRecord } from '@/types';

type DataChangeListener = () => void;

class DataService {
  private static instance: DataService;
  private jobs: IndJob[] = [];
  private listeners: DataChangeListener[] = [];

  private constructor() {
    this.loadJobs();
  }

  public static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  subscribe(listener: DataChangeListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  loadJobs() {
    const stored = localStorage.getItem('eve-industry-jobs');
    if (stored) {
      try {
        this.jobs = JSON.parse(stored);
      } catch (error) {
        console.error('Failed to load jobs from localStorage:', error);
        this.jobs = [];
      }
    }
  }

  private saveJobs() {
    localStorage.setItem('eve-industry-jobs', JSON.stringify(this.jobs));
  }

  getJobs(): IndJob[] {
    return [...this.jobs];
  }

  getJob(id: string): IndJob | undefined {
    return this.jobs.find(job => job.id === id);
  }

  createJob(job: Omit<IndJob, 'id' | 'created' | 'updated'>): IndJob {
    const newJob: IndJob = {
      ...job,
      id: crypto.randomUUID(),
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      billOfMaterials: job.billOfMaterials || [],
      consumedMaterials: job.consumedMaterials || [],
      expenditures: job.expenditures || [],
      income: job.income || [],
    };
    
    this.jobs.push(newJob);
    this.saveJobs();
    this.notifyListeners();
    return newJob;
  }

  updateJob(id: string, updates: Partial<IndJob>): IndJob | null {
    const index = this.jobs.findIndex(job => job.id === id);
    if (index === -1) return null;

    this.jobs[index] = {
      ...this.jobs[index],
      ...updates,
      updated: new Date().toISOString(),
    };
    
    this.saveJobs();
    this.notifyListeners();
    return this.jobs[index];
  }

  deleteJob(id: string): boolean {
    const index = this.jobs.findIndex(job => job.id === id);
    if (index === -1) return false;

    this.jobs.splice(index, 1);
    this.saveJobs();
    this.notifyListeners();
    return true;
  }

  createTransaction(jobId: string, transaction: Omit<IndTransactionRecord, 'id' | 'created' | 'updated' | 'job'>, type: 'income' | 'expenditure'): IndTransactionRecord | null {
    const job = this.getJob(jobId);
    if (!job) return null;

    const newTransaction: IndTransactionRecord = {
      ...transaction,
      id: crypto.randomUUID(),
      job: jobId,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    };

    if (type === 'income') {
      job.income = job.income || [];
      job.income.push(newTransaction);
    } else {
      job.expenditures = job.expenditures || [];
      job.expenditures.push(newTransaction);
    }

    this.updateJob(jobId, job);
    return newTransaction;
  }

  createMultipleTransactions(jobId: string, transactions: Omit<IndTransactionRecord, 'id' | 'created' | 'updated' | 'job'>[], type: 'income' | 'expenditure'): IndTransactionRecord[] {
    const job = this.getJob(jobId);
    if (!job) return [];

    const newTransactions = transactions.map(transaction => ({
      ...transaction,
      id: crypto.randomUUID(),
      job: jobId,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    }));

    if (type === 'income') {
      job.income = job.income || [];
      job.income.push(...newTransactions);
    } else {
      job.expenditures = job.expenditures || [];
      job.expenditures.push(...newTransactions);
    }

    this.updateJob(jobId, job);
    return newTransactions;
  }

  updateTransaction(transactionId: string, updates: Partial<IndTransactionRecord>): IndTransactionRecord | null {
    for (const job of this.jobs) {
      // Check income transactions
      if (job.income) {
        const incomeIndex = job.income.findIndex(t => t.id === transactionId);
        if (incomeIndex !== -1) {
          job.income[incomeIndex] = {
            ...job.income[incomeIndex],
            ...updates,
            updated: new Date().toISOString(),
          };
          this.updateJob(job.id, job);
          return job.income[incomeIndex];
        }
      }

      // Check expenditure transactions
      if (job.expenditures) {
        const expIndex = job.expenditures.findIndex(t => t.id === transactionId);
        if (expIndex !== -1) {
          job.expenditures[expIndex] = {
            ...job.expenditures[expIndex],
            ...updates,
            updated: new Date().toISOString(),
          };
          this.updateJob(job.id, job);
          return job.expenditures[expIndex];
        }
      }
    }
    return null;
  }

  deleteTransaction(transactionId: string): boolean {
    for (const job of this.jobs) {
      // Check income transactions
      if (job.income) {
        const incomeIndex = job.income.findIndex(t => t.id === transactionId);
        if (incomeIndex !== -1) {
          job.income.splice(incomeIndex, 1);
          this.updateJob(job.id, job);
          return true;
        }
      }

      // Check expenditure transactions
      if (job.expenditures) {
        const expIndex = job.expenditures.findIndex(t => t.id === transactionId);
        if (expIndex !== -1) {
          job.expenditures.splice(expIndex, 1);
          this.updateJob(job.id, job);
          return true;
        }
      }
    }
    return false;
  }

  createBillItem(jobId: string, billItem: Omit<IndBillitemRecord, 'id' | 'created' | 'updated'>): IndBillitemRecord | null {
    const job = this.getJob(jobId);
    if (!job) return null;

    const newBillItem: IndBillitemRecord = {
      ...billItem,
      id: crypto.randomUUID(),
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    };

    job.billOfMaterials = job.billOfMaterials || [];
    job.billOfMaterials.push(newBillItem);
    this.updateJob(jobId, job);
    return newBillItem;
  }

  createMultipleBillItems(jobId: string, billItems: Omit<IndBillitemRecord, 'id' | 'created' | 'updated'>[]): IndBillitemRecord[] {
    const job = this.getJob(jobId);
    if (!job) return [];

    const newBillItems = billItems.map(item => ({
      ...item,
      id: crypto.randomUUID(),
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    }));

    job.billOfMaterials = job.billOfMaterials || [];
    job.billOfMaterials.push(...newBillItems);
    this.updateJob(jobId, job);
    return newBillItems;
  }
}

export const dataService = DataService.getInstance();