/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 *
 * @module ArrayUtils
 * @description
 * Provides utility functions for array manipulation.
 */

/**
 * Shuffles the elements of an array using the Fisher-Yates (Knuth) shuffle algorithm.
 *
 * This function creates and returns a new array with its elements randomly rearranged.
 * The original array remains unmodified.
 *
 * @template T - The type of elements in the array.
 * @param {T[]} array - The array to shuffle.
 * @returns {T[]} A new array with the elements randomly shuffled.
 *
 * @example
 * ```ts
 * const numbers = [1, 2, 3, 4, 5];
 * const shuffledNumbers = shuffleArray(numbers);
 * console.log(shuffledNumbers); // Example output: [3, 1, 5, 4, 2]
 * ```
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
