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
    console.log('Parsing transaction line:', line);
    const parts = line.split('\t');
    console.log('Split parts:', parts, 'Length:', parts.length);
    
    if (parts.length < 6) {
      console.log('Not enough parts, skipping line');
      return null;
    }

    let dateStr, quantityStr, itemName, unitPriceStr, totalAmountStr, buyer, location, corporation, wallet;
    
    // Handle both 7 and 8+ column formats
    if (parts.length >= 7) {
      [dateStr, quantityStr, itemName, unitPriceStr, totalAmountStr, buyer, location] = parts;
      if (parts.length >= 8) {
        corporation = parts[7];
      }
      if (parts.length >= 9) {
        wallet = parts[8];
      }
    } else {
      console.log('Unexpected number of columns:', parts.length);
      return null;
    }

    console.log('Extracted values:', { dateStr, quantityStr, itemName, unitPriceStr, totalAmountStr, buyer, location });

    // Parse date (YYYY.MM.DD HH:mm format)
    const [datePart, timePart] = dateStr.split(' ');
    if (!datePart || !timePart) {
      console.log('Invalid date format:', dateStr);
      return null;
    }
    
    const [year, month, day] = datePart.split('.').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);
    
    if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hour) || isNaN(minute)) {
      console.log('Invalid date components:', { year, month, day, hour, minute });
      return null;
    }
    
    const date = new Date(year, month - 1, day, hour, minute);

    // Parse quantity (remove commas)
    const quantity = parseInt(quantityStr.replace(/,/g, ''));
    if (isNaN(quantity)) {
      console.log('Invalid quantity:', quantityStr);
      return null;
    }

    // Parse prices
    let unitPrice = parseISKAmount(unitPriceStr);
    let totalPrice = parseISKAmount(totalAmountStr);
    
    console.log('Parsed prices:', { unitPrice, totalPrice });
    
    if (isNaN(unitPrice) || isNaN(totalPrice)) {
      console.log('Invalid price values:', { unitPrice, totalPrice });
      return null;
    }

    // Keep the original sign for expenditures (negative values)
    // The batch expenditure form will handle the conversion

    const result = {
      date: date.toISOString(),
      quantity,
      itemName: itemName.trim(),
      unitPrice,
      totalPrice,
      buyer: buyer?.trim() || '',
      location: location?.trim() || '',
      corporation: corporation?.trim(),
      wallet: wallet?.trim()
    };
    
    console.log('Successfully parsed transaction:', result);
    return result;
  } catch (error) {
    console.error('Error parsing transaction line:', line, error);
    return null;
  }
};
