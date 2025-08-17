/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 *
 * @module DateTimeFormatter
 * @description Provides a utility function for formatting date and time.
 */

/**
 * Formats a Date object or a date string into a standardized string format.
 *
 * This function takes a `Date` object or a date-parsable string and converts it
 * into an ISO 8601-like format, specifically `"YYYY-MM-DDTHH:mm:ss"`.
 * The time zone information is removed to provide a consistent, local-time representation.
 *
 * @param {Date | string} date - The date to be formatted. Can be a `Date` object or a string.
 * @returns {string} The formatted date and time string in "YYYY-MM-DDTHH:mm:ss" format.
 *
 * @example
 * ```ts
 * const now = new Date();
 * formatDateTime(now); // "2025-07-28T14:30:00" (example output)
 *
 * formatDateTime("2024-01-01T09:00:00.000Z"); // "2024-01-01T09:00:00"
 * ```
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().slice(0, 19); // "2025-07-28T14:30:00"
}
