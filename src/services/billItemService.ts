import { IndBillitemRecord, IndBillitemRecordNoId } from "@/lib/pbtypes";
import { pb } from "@/lib/pocketbase";

export async function addBillItem(
	jobId: string,
	billItem: IndBillitemRecordNoId
): Promise<IndBillitemRecord> {
	console.log('Adding bill item:', billItem);
	// Set the job ID in the bill item record
	const billItemWithJob = {
		...billItem,
		job: jobId
	};
	return await pb.collection<IndBillitemRecord>('ind_billItem').create(billItemWithJob);
}

export async function deleteBillItem(id: string): Promise<void> {
	console.log('Deleting bill item:', id);
	await pb.collection('ind_billItem').delete(id);
}

export async function deleteBillItems(ids: string[]): Promise<void> {
	console.log('Deleting bill items:', ids);
	// Delete items in parallel for better performance
	await Promise.all(ids.map(id => deleteBillItem(id)));
}
