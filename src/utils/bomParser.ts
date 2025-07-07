import { IndBillitemRecord } from '@/types';

/**
 * Parses Bill of Materials from tab-separated format
 * Expected format: "Isogen\t2,400" or "Isogen	2,400"
 */
export function parseBOMData(data: string): Omit<IndBillitemRecord, 'id' | 'created' | 'updated'>[] {
  const lines = data.trim().split('\n').filter(line => line.trim());
  const items: Omit<IndBillitemRecord, 'id' | 'created' | 'updated'>[] = [];

  for (const line of lines) {
    try {
      const parts = line.split('\t');
      if (parts.length >= 2) {
        const [name, quantityStr] = parts;
        const quantity = parseInt(quantityStr.replace(/,/g, ''), 10);
        
        if (name.trim() && !isNaN(quantity)) {
          items.push({
            name: name.trim(),
            quantity: quantity,
          });
        }
      }
    } catch (error) {
      console.warn('Failed to parse BOM line:', line, error);
    }
  }

  return items;
}

/**
 * Exports Bill of Materials to tab-separated format
 */
export function exportBOMData(items: IndBillitemRecord[]): string {
  return items
    .map(item => `${item.name}\t${item.quantity.toLocaleString()}`)
    .join('\n');
}