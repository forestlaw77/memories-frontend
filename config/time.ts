/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is dual-licensed:
 * - For non-commercial use: MIT License (see LICENSE-NC.txt)
 * - For commercial use: Requires a separate commercial license (contact author)
 *
 * You may not use this software for commercial purposes under the MIT License.
 */

/** One second in milliseconds */
export const SECOND_MS = 1000;

/** One minute in milliseconds */
export const MINUTE_MS = 60 * SECOND_MS;

/** Five minutes in milliseconds */
export const FIVE_MINUTES_MS = 5 * MINUTE_MS;

/** Ten minutes in milliseconds */
export const TEN_MINUTES_MS = 10 * MINUTE_MS;

export const STALE_TIME_SHORT = FIVE_MINUTES_MS;
export const GC_TIME_STANDARD = TEN_MINUTES_MS;

/** Session expiration time in seconds (used by NextAuth `session.maxAge`) */
export const SESSION_MAX_AGE_SEC = 30 * 60; // 1800 sec = 30 min

/** Session expiration time in milliseconds (for internal use) */
export const SESSION_MAX_AGE_MS = SESSION_MAX_AGE_SEC * SECOND_MS;

/** Session expiration time in minutes (for internal use) */
export const SESSION_MAX_AGE_MIN = SESSION_MAX_AGE_SEC / 60; // in minutes

/** Session update time in seconds (used by NextAuth `session.updateAge`) */
export const SESSION_UPDATE_AGE_SEC = 5 * 60; // 300 sec = 5 min

export const toMS = {
  second: (s: number): number => s * SECOND_MS,
  minute: (m: number): number => m * MINUTE_MS,
};
