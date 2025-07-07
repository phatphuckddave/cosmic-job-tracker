import { IndJob } from '@/lib/types';
import type { IndTransactionRecord, IndTransactionRecordNoId } from '../lib/pbtypes';
import { pb } from '../lib/pocketbase';
import { updateJob } from './jobService';

export async function createTransaction(
	job: IndJob,
	transaction: IndTransactionRecordNoId,
): Promise<IndTransactionRecord> {
	console.log('Creating transaction:', transaction);
	// Create the transaction
	transaction.job = job.id;
	const createdTransaction = await pb.collection<IndTransactionRecord>('ind_transaction').create(transaction);
	return createdTransaction;
}

export async function updateTransaction(
	job: IndJob,
	transactionId: string,
	updates: Partial<IndTransactionRecord>
): Promise<IndTransactionRecord> {
	console.log('Updating transaction:', transactionId, updates);
	const updatedTransaction = await pb.collection<IndTransactionRecord>('ind_transaction').update(transactionId, updates);
	return updatedTransaction;
}

export async function deleteTransaction(job: IndJob, transactionId: string): Promise<void> {
	console.log('Deleting transaction:', transactionId);
	// Delete the transaction
	await pb.collection<IndTransactionRecord>('ind_transaction').delete(transactionId);

	// Remove from both expenditures and income arrays
	const expenditures = job.expenditures.filter(ex => ex.id !== transactionId);
	const income = job.income.filter(pero => pero.id !== transactionId);

	await updateJob(job.id, {
		expenditures: expenditures.map(ex => ex.id),
		income: income.map(pero => pero.id)
	});
}
