
import { IndBillitemRecord } from '@/lib/pbtypes';

export const exportBillOfMaterials = (billOfMaterials: IndBillitemRecord[]): string => {
  return billOfMaterials.map(item => `${item.name} ${item.quantity}`).join('\n');
};

export const exportConsumedMaterials = (consumedMaterials: IndBillitemRecord[]): string => {
  return consumedMaterials.map(item => `${item.name}\t${item.quantity}`).join('\n');
};

export const exportMissingMaterials = (missingMaterials: { name: string; quantity: number }[]): string => {
  return missingMaterials.map(item => `${item.name}\t${item.quantity}`).join('\n');
};
