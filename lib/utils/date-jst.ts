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

  // 現在のUTC時刻に9時間を加えて日本時間を計算
  const jstMillis = now.getTime() + 9 * 60 * 60 * 1000;
  const jstDate = new Date(jstMillis);

  // 日本時間の年月日を取得
  const year = jstDate.getUTCFullYear();
  const month = jstDate.getUTCMonth();
  const date = jstDate.getUTCDate();

  // 日本時間00:00:00のUTC時刻を計算
  const jstMidnight = new Date(Date.UTC(year, month, date, 0, 0, 0, 0));
  const utcStart = new Date(jstMidnight.getTime() - 9 * 60 * 60 * 1000);

  // 終了時刻は開始時刻の23時間59分59秒999ミリ秒後
  const utcEnd = new Date(utcStart.getTime() + 24 * 60 * 60 * 1000 - 1);

  // Format date string as YYYY-MM-DD
  const dateString = jstDate.toISOString().split('T')[0];

  return {
    startOfDay: utcStart,
    endOfDay: utcEnd,
    dateString,
  };
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

export function isoToDatetime(isoTimestamp: string): string {
  return `${new Date(isoTimestamp).toLocaleDateString()} ${new Date(isoTimestamp).toLocaleTimeString()}`;
}
