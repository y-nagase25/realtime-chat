/**
 * Utility functions for JST (Japan Standard Time) date handling and formatting
 */

export interface JSTDateRange {
  startOfDay: Date;
  endOfDay: Date;
  dateString: string; // YYYY-MM-DD
}

/**
 * Calculate start and end of current day in JST timezone (UTC+9)
 *
 * @returns {JSTDateRange} Date range for current JST day with start/end timestamps
 *
 * @example
 * const { startOfDay, endOfDay, dateString } = getJSTDayRange();
 * // If current JST time is 2025-12-02 14:30:00
 * // Returns:
 * // - startOfDay: 2025-12-02 00:00:00 JST (2025-12-01 15:00:00 UTC)
 * // - endOfDay: 2025-12-03 00:00:00 JST (2025-12-02 15:00:00 UTC)
 * // - dateString: "2025-12-02"
 */
export function getJSTDayRange(): JSTDateRange {
  const now = new Date();
  const JST_OFFSET_MINUTES = 9 * 60; // JST is UTC+9 hours

  // Convert current time to JST by adjusting for timezone offset
  // getTimezoneOffset() returns the offset in minutes (e.g., -540 for JST)
  const jstNow = new Date(now.getTime() + (JST_OFFSET_MINUTES - now.getTimezoneOffset()) * 60000);

  // Get start of day in JST (00:00:00)
  // Create UTC date with JST date components
  const startOfDay = new Date(
    Date.UTC(jstNow.getFullYear(), jstNow.getMonth(), jstNow.getDate(), 0, 0, 0, 0)
  );

  // Adjust back to UTC by subtracting JST offset
  startOfDay.setHours(startOfDay.getHours() - 9);

  // End of day is exactly 24 hours after start
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

  // Format date string as YYYY-MM-DD
  const dateString = jstNow.toISOString().split('T')[0];

  return { startOfDay, endOfDay, dateString };
}

/**
 * Format a number with thousands separator
 *
 * @param {number} value - Number to format
 * @returns {string} Formatted string with comma separators (e.g., "1,234")
 *
 * @example
 * formatNumber(1234); // Returns "1,234"
 * formatNumber(1234567); // Returns "1,234,567"
 * formatNumber(0); // Returns "0"
 */
export function formatNumber(value: number): string {
  return value.toLocaleString('en-US');
}
