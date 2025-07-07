import { IndTransactionRecord } from '@/types';
import { parseISK } from './currency';

/**
 * Parses EVE Online transaction data from clipboard format
 * Expected format: "2025.07.04 10:58	357	Isogen	699 ISK	-249,543 ISK	Shocker Killer	Uitra VI - Moon 4 - State War Academy	Primorium	Master Wallet"
 */
export function parseTransactionData(data: string): Omit<IndTransactionRecord, 'id' | 'created' | 'updated' | 'job'>[] {
  const lines = data.trim().split('\n').filter(line => line.trim());
  const transactions: Omit<IndTransactionRecord, 'id' | 'created' | 'updated' | 'job'>[] = [];

  for (const line of lines) {
    try {
      const parts = line.split('\t');
      if (parts.length >= 6) {
        const [dateTime, quantity, itemName, unitPriceStr, totalPriceStr, buyer, location, corporation, wallet] = parts;
        
        // Parse date - convert EVE format (2025.07.04 10:58) to ISO
        const [datePart, timePart] = dateTime.split(' ');
        const [year, month, day] = datePart.split('.');
        const isoDate = `${year}-${month}-${day}T${timePart || '00:00'}:00.000Z`;

        const parsedTransaction: Omit<IndTransactionRecord, 'id' | 'created' | 'updated' | 'job'> = {
          date: isoDate,
          quantity: parseInt(quantity.replace(/,/g, ''), 10),
          itemName: itemName.trim(),
          unitPrice: parseISK(unitPriceStr),
          totalPrice: parseISK(totalPriceStr),
          buyer: buyer?.trim(),
          location: location?.trim(),
          corporation: corporation?.trim(),
          wallet: wallet?.trim(),
        };

        transactions.push(parsedTransaction);
      }
    } catch (error) {
      console.warn('Failed to parse transaction line:', line, error);
    }
  }

  return transactions;
}

/**
 * Checks if two transactions are duplicates based on all fields
 */
export function isDuplicateTransaction(
  t1: Omit<IndTransactionRecord, 'id' | 'created' | 'updated'>,
  t2: Omit<IndTransactionRecord, 'id' | 'created' | 'updated'>
): boolean {
  return (
    t1.date === t2.date &&
    t1.quantity === t2.quantity &&
    t1.itemName === t2.itemName &&
    t1.unitPrice === t2.unitPrice &&
    t1.totalPrice === t2.totalPrice &&
    t1.buyer === t2.buyer &&
    t1.location === t2.location &&
    t1.corporation === t2.corporation &&
    t1.wallet === t2.wallet
  );
}

/**
 * Removes duplicate transactions from a list
 */
export function deduplicateTransactions(
  existing: IndTransactionRecord[],
  newTransactions: Omit<IndTransactionRecord, 'id' | 'created' | 'updated' | 'job'>[]
): Omit<IndTransactionRecord, 'id' | 'created' | 'updated' | 'job'>[] {
  return newTransactions.filter(newTx => {
    return !existing.some(existingTx => 
      isDuplicateTransaction(
        { ...existingTx, job: undefined },
        newTx
      )
    );
  });
}