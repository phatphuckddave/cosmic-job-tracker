import { IndJob } from '@/lib/types';
import type { IndJobRecord, IndJobRecordNoId } from '../lib/pbtypes';
import { pb } from '../lib/pocketbase';

export type { IndJobRecord as Job } from '../lib/pbtypes';
export type { IndTransactionRecord as Transaction } from '../lib/pbtypes';
export type { IndBillitemRecord as BillItem } from '../lib/pbtypes';

export async function createJob(job: IndJobRecordNoId): Promise<IndJob> {
  console.log('Creating job:', job);
  const newJob = await pb.collection<IndJobRecord>('ind_job').create(job)
  return await getJob(newJob.id);
}

const expand = 'billOfMaterials,consumedMaterials,expenditures,income';

export async function getJobs(): Promise<IndJob[]> {
  console.log('Getting jobs');
  // const result = await pb.collection<IndJobRecord>('ind_job').getFullList();
  const result = await pb.collection('ind_job').getFullList(10000, { expand });
  const jobs: IndJob[] = [];
  for (const job of result) {
    jobs.push({
      ...job,
      billOfMaterials: job.expand["billOfMaterials"] || [],
      consumedMaterials: job.expand["consumedMaterials"] || [],
      expenditures: job.expand["expenditures"] || [],
      income: job.expand["income"] || []
    });
  }
  return jobs;
}

export async function getJob(id: string): Promise<IndJob | null> {
  console.log('Getting job:', id);
  try {
    const job = await pb.collection('ind_job').getOne(id, { expand });
    return {
      ...job,
      billOfMaterials: job.expand["billOfMaterials"] || [],
      consumedMaterials: job.expand["consumedMaterials"] || [],
      expenditures: job.expand["expenditures"] || [],
      income: job.expand["income"] || []
    };
  } catch (e) {
    if (e.status === 404) return null;
    throw e;
  }
}

export async function updateJob(id: string, updates: Partial<IndJobRecord>): Promise<IndJob> {
  console.log('Updating job:', id, updates);
  await pb.collection<IndJobRecord>('ind_job').update(id, updates)
  return getJob(id);
}

export async function deleteJob(id: string): Promise<void> {
  console.log('Deleting job:', id);
  await pb.collection<IndJobRecord>('ind_job').delete(id);
}
