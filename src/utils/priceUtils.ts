import { IndTransactionRecordNoId } from "@/lib/pbtypes";

export const parseISKAmount = (iskString: string): number => {
  // Remove "ISK" and any extra whitespace
  const cleanString = iskString.replace(/ISK/gi, '').trim();

  // Handle negative values
  const isNegative = cleanString.startsWith('-');
  const numberString = cleanString.replace(/^-/, '');

  // Remove commas and parse
  const amount = parseFloat(numberString.replace(/,/g, ''));

  return isNegative ? -amount : amount;
};

export const formatISK = (amount: number): string => {
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  // Format with commas and appropriate decimal places
  const formatted = absAmount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });

  return `${sign}${formatted} ISK`;
};

export type PastedTransaction = IndTransactionRecordNoId & {
  assignedJobId?: string;
  isDuplicate?: boolean;
}

export const parseTransactionLine = (line: string): PastedTransaction | null => {
  try {
    const parts = line.split('\t');
    if (parts.length < 6) return null;

    let dateStr, quantityStr, itemName, unitPriceStr, totalAmountStr, buyer, location, corporation, wallet;
    if (parts.length === 8) {
      [dateStr, quantityStr, itemName, unitPriceStr, totalAmountStr, buyer, location, corporation, wallet] = parts;
    } else {
      [dateStr, quantityStr, itemName, unitPriceStr, totalAmountStr, buyer, location] = parts;
    }


    // Parse date (YYYY.MM.DD HH:mm format)
    const [datePart, timePart] = dateStr.split(' ');
    const [year, month, day] = datePart.split('.').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);
    const date = new Date(year, month - 1, day, hour, minute);

    // Parse quantity (remove commas)
    const quantity = parseInt(quantityStr.replace(/,/g, ''));

    // Parse prices
    let unitPrice = parseISKAmount(unitPriceStr);
    let totalPrice = parseISKAmount(totalAmountStr);

    if (totalPrice < 0) {
      totalPrice = -totalPrice;
    }

    return {
      date: date.toISOString(),
      quantity,
      itemName,
      unitPrice,
      totalPrice,
      buyer,
      location,
      corporation,
      wallet
    };
  } catch (error) {
    console.error('Error parsing transaction line:', line, error);
    return null;
  }
};
