/**
 * Deeply merges object with another object
 * @param target
 * @param sources
 */
export function deepmerge<T = Record<string, unknown>>(target: T, ...sources: T[]): T;
