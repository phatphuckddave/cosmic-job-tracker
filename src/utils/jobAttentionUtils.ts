
import { IndJob } from '@/lib/types';

export function jobNeedsAttention(job: IndJob): boolean {
  // Acquisition jobs need attention when all materials are satisfied
  if (job.status === 'Acquisition') {
    if (!job.billOfMaterials || job.billOfMaterials.length === 0) {
      return false;
    }

    // Create a map of required materials from bill of materials
    const requiredMaterials = new Map<string, number>();
    job.billOfMaterials.forEach(item => {
      requiredMaterials.set(item.name, item.quantity);
    });

    // Create a map of owned materials from expenditures
    const ownedMaterials = new Map<string, number>();
    job.expenditures?.forEach(transaction => {
      const currentOwned = ownedMaterials.get(transaction.itemName) || 0;
      ownedMaterials.set(transaction.itemName, currentOwned + transaction.quantity);
    });

    // Check if all materials are satisfied
    let allMaterialsSatisfied = true;
    requiredMaterials.forEach((required, materialName) => {
      const owned = ownedMaterials.get(materialName) || 0;
      if (owned < required) {
        allMaterialsSatisfied = false;
      }
    });

    return allMaterialsSatisfied;
  }

  // Running jobs need attention when they have finished (start date + runtime > current time)
  if (job.status === 'Running') {
    if (!job.jobStart || !job.runtime) {
      return false;
    }

    const startTime = new Date(job.jobStart).getTime();
    const runtimeMs = job.runtime * 1000; // Convert seconds to milliseconds
    const finishTime = startTime + runtimeMs;
    const currentTime = Date.now();

    return currentTime >= finishTime;
  }

  // Selling jobs need attention when sold count reaches produced count
  if (job.status === 'Selling') {
    const produced = job.produced || 0;
    const sold = job.income?.reduce((sum, tx) => sum + tx.quantity, 0) || 0;
    return sold >= produced && produced > 0;
  }

  return false;
}

export function getAttentionGlowClasses(): string {
  return 'ring-2 ring-yellow-400/50 shadow-lg shadow-yellow-400/20 animate-pulse';
}
