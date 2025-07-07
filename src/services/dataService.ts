import { IndJob } from '@/lib/types';
import { IndJobRecord, IndJobRecordNoId, IndTransactionRecord, IndTransactionRecordNoId, IndBillitemRecord, IndBillitemRecordNoId } from '@/lib/pbtypes';
import * as jobService from './jobService';
import * as transactionService from './transactionService';
import * as billItemService from './billItemService';
import { adminLogin } from '@/lib/pocketbase';

export class DataService {
  private static instance: DataService;
  private jobs: IndJob[] = [];
  private listeners: Set<() => void> = new Set();
  private loadPromise: Promise<IndJob[]> | null = null;
  private initialized: Promise<void>;

  private constructor() {
    // Initialize with admin login
    this.initialized = adminLogin().catch(error => {
      console.error('Failed to initialize DataService:', error);
      throw error;
    });
  }

  public static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  getJobs(): IndJob[] {
    return [...this.jobs];
  }

  getJob(id: string): IndJob | null {
    return this.jobs.find(job => job.id === id) || null;
  }

  async loadJobs(visibleStatuses?: string[]): Promise<IndJob[]> {
    // Wait for initialization first
    await this.initialized;

    // If there's already a load in progress, return that promise
    if (this.loadPromise) {
      return this.loadPromise;
    }

    // If we already have jobs loaded and no specific statuses requested, return them immediately
    if (this.jobs.length > 0 && !visibleStatuses) {
      return Promise.resolve(this.getJobs());
    }

    // Start a new load
    console.log('Loading jobs from database', visibleStatuses ? `for statuses: ${visibleStatuses.join(', ')}` : '');
    this.loadPromise = jobService.getJobs(visibleStatuses).then(jobs => {
      if (visibleStatuses) {
        // If filtering by statuses, merge with existing jobs
        const existingJobs = this.jobs.filter(job => !visibleStatuses.includes(job.status));
        this.jobs = [...existingJobs, ...jobs];
      } else {
        this.jobs = jobs;
      }
      this.notifyListeners();
      return this.getJobs();
    }).finally(() => {
      this.loadPromise = null;
    });

    return this.loadPromise;
  }

  async createJob(jobData: IndJobRecordNoId): Promise<IndJob> {
    console.log('Creating job:', jobData);
    const newJob = await jobService.createJob(jobData);
    this.jobs.push(newJob);
    this.notifyListeners();
    return newJob;
  }

  async updateJob(id: string, updates: Partial<IndJobRecord>): Promise<IndJob> {
    console.log('Updating job:', id, updates);
    const updatedRecord = await jobService.updateJob(id, updates);

    const jobIndex = this.jobs.findIndex(job => job.id === id);
    if (jobIndex !== -1) {
      this.jobs[jobIndex] = updatedRecord;
      this.notifyListeners();
      return this.jobs[jobIndex];
    }

    throw new Error(`Job with id ${id} not found in local state`);
  }

  async deleteJob(id: string): Promise<void> {
    console.log('Deleting job:', id);
    await jobService.deleteJob(id);

    this.jobs = this.jobs.filter(job => job.id !== id);
    this.notifyListeners();
  }

  async createTransaction(jobId: string, transaction: IndTransactionRecordNoId, type: 'expenditure' | 'income'): Promise<IndJob> {
    console.log('Creating transaction for job:', jobId, transaction, type);

    const job = this.getJob(jobId);
    if (!job) throw new Error(`Job with id ${jobId} not found`);

    // Create the transaction in the database
    transaction.job = jobId;
    const createdTransaction = await transactionService.createTransaction(job, transaction);

    // Update the job's transaction references in the database
    const field = type === 'expenditure' ? 'expenditures' : 'income';
    const currentIds = (job[field] || []).map(tr => tr.id);
    await jobService.updateJob(jobId, {
      [field]: [...currentIds, createdTransaction.id]
    });

    // Fetch fresh job data from the server
    const updatedJob = await jobService.getJob(jobId);
    if (!updatedJob) throw new Error(`Job with id ${jobId} not found after update`);

    // Update local state with fresh data
    const jobIndex = this.jobs.findIndex(j => j.id === jobId);
    if (jobIndex !== -1) {
      this.jobs[jobIndex] = updatedJob;
      this.notifyListeners();
      return this.jobs[jobIndex];
    }

    throw new Error(`Job with id ${jobId} not found in local state`);
  }

  async createMultipleTransactions(jobId: string, transactions: IndTransactionRecordNoId[], type: 'expenditure' | 'income'): Promise<IndJob> {
    console.log('Creating multiple transactions for job:', jobId, transactions.length, type);

    const job = this.getJob(jobId);
    if (!job) throw new Error(`Job with id ${jobId} not found`);

    const createdTransactions: IndTransactionRecord[] = [];

    // Create all transactions
    for (const transaction of transactions) {
      transaction.job = jobId;
      const createdTransaction = await transactionService.createTransaction(job, transaction);
      createdTransactions.push(createdTransaction);
    }

    // Update the job's transaction references in one database call
    const field = type === 'expenditure' ? 'expenditures' : 'income';
    const currentIds = (job[field] || []).map(tr => tr.id);
    const newIds = createdTransactions.map(tr => tr.id);
    await jobService.updateJob(jobId, {
      [field]: [...currentIds, ...newIds]
    });

    // Fetch fresh job data from the server
    const updatedJob = await jobService.getJob(jobId);
    if (!updatedJob) throw new Error(`Job with id ${jobId} not found after update`);

    // Update local state with fresh data
    const jobIndex = this.jobs.findIndex(j => j.id === jobId);
    if (jobIndex !== -1) {
      this.jobs[jobIndex] = updatedJob;
      this.notifyListeners();
      return this.jobs[jobIndex];
    }

    throw new Error(`Job with id ${jobId} not found in local state`);
  }

  async updateTransaction(jobId: string, transactionId: string, updates: Partial<IndTransactionRecord>): Promise<IndJob> {
    console.log('Updating transaction:', transactionId, updates);

    const job = this.getJob(jobId);
    if (!job) throw new Error(`Job with id ${jobId} not found`);

    const updatedTransaction = await transactionService.updateTransaction(job, transactionId, updates);

    // Fetch fresh job data from the server
    const updatedJob = await jobService.getJob(jobId);
    if (!updatedJob) throw new Error(`Job with id ${jobId} not found after update`);

    // Update local state with fresh data
    const jobIndex = this.jobs.findIndex(j => j.id === jobId);
    if (jobIndex !== -1) {
      this.jobs[jobIndex] = updatedJob;
      this.notifyListeners();
      return this.jobs[jobIndex];
    }

    throw new Error(`Job with id ${jobId} not found in local state`);
  }

  async deleteTransaction(jobId: string, transactionId: string): Promise<IndJob> {
    console.log('Deleting transaction:', transactionId);

    const job = this.getJob(jobId);
    if (!job) throw new Error(`Job with id ${jobId} not found`);

    await transactionService.deleteTransaction(job, transactionId);

    // Fetch fresh job data from the server
    const updatedJob = await jobService.getJob(jobId);
    if (!updatedJob) throw new Error(`Job with id ${jobId} not found after update`);

    // Update local state with fresh data
    const jobIndex = this.jobs.findIndex(j => j.id === jobId);
    if (jobIndex !== -1) {
      this.jobs[jobIndex] = updatedJob;
      this.notifyListeners();
      return this.jobs[jobIndex];
    }

    throw new Error(`Job with id ${jobId} not found in local state`);
  }

  async createBillItem(jobId: string, billItem: IndBillitemRecordNoId, type: 'billOfMaterials' | 'consumedMaterials'): Promise<IndJob> {
    console.log('Creating bill item for job:', jobId, billItem, type);

    const job = this.getJob(jobId);
    if (!job) throw new Error(`Job with id ${jobId} not found`);

    const createdBillItem = await billItemService.addBillItem(jobId, billItem);

    // Update the job's bill item references
    const currentIds = (job[type] || []).map(item => item.id);
    await jobService.updateJob(jobId, {
      [type]: [...currentIds, createdBillItem.id]
    });

    // Fetch fresh job data from the server
    const updatedJob = await jobService.getJob(jobId);
    if (!updatedJob) throw new Error(`Job with id ${jobId} not found after update`);

    // Update local state with fresh data
    const jobIndex = this.jobs.findIndex(j => j.id === jobId);
    if (jobIndex !== -1) {
      this.jobs[jobIndex] = updatedJob;
      this.notifyListeners();
      return this.jobs[jobIndex];
    }

    throw new Error(`Job with id ${jobId} not found in local state`);
  }

  async createMultipleBillItems(jobId: string, billItems: IndBillitemRecordNoId[], type: 'billOfMaterials' | 'consumedMaterials'): Promise<IndJob> {
    console.log('Creating multiple bill items for job:', jobId, billItems.length, type);

    const job = this.getJob(jobId);
    if (!job) throw new Error(`Job with id ${jobId} not found`);

    // Delete existing bill items
    const existingItemIds = job[type].map(item => item.id);
    if (existingItemIds.length > 0) {
      await billItemService.deleteBillItems(existingItemIds);
    }

    const createdBillItems: IndBillitemRecord[] = [];

    // Create all bill items
    for (const billItem of billItems) {
      const createdBillItem = await billItemService.addBillItem(jobId, billItem);
      createdBillItems.push(createdBillItem);
    }

    // Update the job's bill item references with ONLY the new IDs
    const newIds = createdBillItems.map(item => item.id);
    await jobService.updateJob(jobId, {
      [type]: newIds // Replace instead of append
    });

    // Fetch fresh job data from the server
    const updatedJob = await jobService.getJob(jobId);
    if (!updatedJob) throw new Error(`Job with id ${jobId} not found after update`);

    // Update local state with fresh data
    const jobIndex = this.jobs.findIndex(j => j.id === jobId);
    if (jobIndex !== -1) {
      this.jobs[jobIndex] = updatedJob;
      this.notifyListeners();
      return this.jobs[jobIndex];
    }

    throw new Error(`Job with id ${jobId} not found in local state`);
  }
}

// Export singleton instance
export const dataService = DataService.getInstance();
