/**
 * Removes empty parameters from an object
 * @param {Object} params - The object to clean
 * @returns {Object} - A new object with all empty values removed
 */
export function removeEmptyParams(params = {}) {
  return Object.entries(params).reduce((acc, [key, value]) => {
    // Keep the value if:
    // 1. It's not null or undefined
    // 2. It's not an empty string
    // 3. If it's a number (including 0), keep it
    if (
      value !== null && 
      value !== undefined && 
      (value !== "" || value === 0)
    ) {
      acc[key] = value;
    }
    return acc;
  }, {});
}

export function normalizeDateString(dateString: string): string {
  // Match the date string up to the milliseconds and discard the rest
  const match = dateString.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3})/);
  if (match) {
    return match[0]; // Returns "2025-04-06T04:49:33.348"
  }
  return dateString; // Fallback to original string if no match
}

export function parseDateSafely(dateString?: string): Date | null {
  if (!dateString) return null;
  const normalized = normalizeDateString(dateString);
  const date = new Date(normalized);
  return isNaN(date.getTime()) ? null : date;
}