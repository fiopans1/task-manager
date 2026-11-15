import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge conditional class names and resolve Tailwind conflicts.
 * Every visual component should use this helper instead of string templates.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
