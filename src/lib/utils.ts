/**
 * @file src/lib/utils.ts
 * @description Tailwind CSS class merging and conditional styling utility.
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merges conditional and static Tailwind CSS class names cleanly using clsx and tailwind-merge.
 * 
 * @param {ClassValue[]} inputs List of class strings, objects, or arrays
 * @returns {string} The resolved and merged class name string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
