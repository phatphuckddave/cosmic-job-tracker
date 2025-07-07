/**
 * Formats a number as ISK currency
 */
export function formatISK(amount: number): string {
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));
  
  const sign = amount < 0 ? '-' : '';
  return `${sign}${formatted} ISK`;
}

/**
 * Parses ISK string back to number
 */
export function parseISK(iskString: string): number {
  // Remove ISK, commas, and extra spaces, handle negative
  const cleaned = iskString.replace(/[^\d.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Formats a number with proper thousands separators
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}