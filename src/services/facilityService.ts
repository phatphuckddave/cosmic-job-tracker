import type { IndFacilityRecord, IndFacilityResponse } from '../lib/pbtypes';
import { pb } from '../lib/pocketbase';

export type { IndFacilityRecord as Facility } from '../lib/pbtypes';

export async function getFacilities(): Promise<IndFacilityResponse[]> {
  const result = await pb.collection('ind_facility').getFullList();
  return result as IndFacilityResponse[];
}

export async function getFacility(id: string): Promise<IndFacilityResponse | null> {
  try {
    return await pb.collection('ind_facility').getOne(id) as IndFacilityResponse;
  } catch (e) {
    if (e.status === 404) return null;
    throw e;
  }
}

export async function createFacility(facility: Omit<IndFacilityRecord, 'id' | 'created' | 'updated'>): Promise<IndFacilityResponse> {
  return await pb.collection('ind_facility').create(facility) as IndFacilityResponse;
}

export async function updateFacility(id: string, updates: Partial<IndFacilityRecord>): Promise<IndFacilityResponse> {
  return await pb.collection('ind_facility').update(id, updates) as IndFacilityResponse;
}

export async function deleteFacility(id: string): Promise<void> {
  await pb.collection('ind_facility').delete(id);
}
