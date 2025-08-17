/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 *
 * * @module DateParser
 * @description Provides a utility function to format date strings into a standard `YYYY-MM-DD` format.
 */

/**
 * Converts a specific Japanese date string format into an ISO 8601-like string.
 * * This function handles common Japanese date notations like `YYYY年MM月DD日`, `YYYY年MM月`, and `YYYY年`.
 * It removes extraneous characters such as "頃", "以降", "上旬", "中旬", and "下旬" to standardize the format.
 * If the input string matches a known pattern, it is converted to `YYYY-MM-DD` format.
 * For unknown formats, an empty string is returned.
 *
 * @param {string} salesDate - A Japanese date string (e.g., "2024年05月15日頃").
 * @returns {string} The converted date string in `YYYY-MM-DD` format, or an empty string if conversion fails.
 *
 * @example
 * ```ts
 * parseSalesDate("2024年05月15日"); // "2024-05-15"
 * parseSalesDate("2024年05月"); // "2024-05-01"
 * parseSalesDate("2024年"); // "2024-01-01"
 * parseSalesDate("2024年上旬"); // "2024-01-01"
 * parseSalesDate("不明"); // ""
 * ```
 */
export function parseSalesDate(salesDate: string): string {
  // Removes unnecessary characters like "頃" (around), "以降" (after), "上旬" (early), etc.
  const cleanedDate = salesDate.replace(/(頃|以降|上旬|中旬|下旬)/g, "");

  // Matches "YYYY年MM月DD日" format
  if (/^\d{4}年\d{2}月\d{2}日$/.test(cleanedDate)) {
    return cleanedDate.replace(/年|月/g, "-").replace(/日/, "");
  }

  // Matches "YYYY年MM月" format, converts to `YYYY-MM-01`
  if (/^\d{4}年\d{2}月$/.test(cleanedDate)) {
    return cleanedDate.replace(/年/, "-").replace(/月/, "-01");
  }

  // Matches "YYYY年" format, converts to `YYYY-01-01`
  if (/^\d{4}年$/.test(cleanedDate)) {
    return cleanedDate.replace(/年/, "-01-01");
  }

  // Returns an empty string for any unknown format
  return "";
}
