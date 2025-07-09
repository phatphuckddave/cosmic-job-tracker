
import { IndBillitemRecord } from '@/lib/pbtypes';
import { IndJob } from '@/lib/types';

export function useMaterialsCalculations(job?: IndJob, billOfMaterials: IndBillitemRecord[] = []) {
  const calculateMissingMaterials = () => {
    if (!job) return [];

    // Create a map of required materials from bill of materials
    const requiredMaterials = new Map<string, number>();
    billOfMaterials.forEach(item => {
      requiredMaterials.set(item.name, item.quantity);
    });

    // Create a map of owned materials from expenditures
    const ownedMaterials = new Map<string, number>();
    job.expenditures?.forEach(transaction => {
      const currentOwned = ownedMaterials.get(transaction.itemName) || 0;
      ownedMaterials.set(transaction.itemName, currentOwned + transaction.quantity);
    });

    // Calculate missing materials
    const missingMaterials: { name: string; quantity: number }[] = [];
    requiredMaterials.forEach((required, materialName) => {
      const owned = ownedMaterials.get(materialName) || 0;
      const missing = required - owned;
      if (missing > 0) {
        missingMaterials.push({ name: materialName, quantity: missing });
      }
    });

    return missingMaterials;
  };

  return {
    calculateMissingMaterials
  };
}
