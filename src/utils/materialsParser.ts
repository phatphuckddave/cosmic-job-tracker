
import { IndBillitemRecordNoId } from '@/lib/pbtypes';

export const parseBillOfMaterials = (text: string): IndBillitemRecordNoId[] => {
  const lines = text.split('\n').filter(line => line.trim());
  const materials: IndBillitemRecordNoId[] = [];

  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    if (parts.length >= 2) {
      const name = parts.slice(0, -1).join(' ');
      const quantity = parseInt(parts[parts.length - 1]);
      if (name && !isNaN(quantity)) {
        materials.push({ name, quantity });
      }
    }
  }

  return materials;
};

export const parseConsumedMaterials = (text: string): IndBillitemRecordNoId[] => {
  const lines = text.split('\n').filter(line => line.trim());
  const materials: IndBillitemRecordNoId[] = [];

  for (const line of lines) {
    const parts = line.trim().split('\t');
    if (parts.length >= 2) {
      const name = parts[0];
      const quantity = parseInt(parts[1]);
      if (name && !isNaN(quantity)) {
        materials.push({ name, quantity });
      }
    }
  }

  return materials;
};
