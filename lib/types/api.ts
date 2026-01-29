/**
 * Discriminated union type for API responses
 * Properly models success/failure states with type safety
 */
export type ApiResponse<T> =
  | { success: true; data: T; error?: never }
  | { success: false; data?: never; error: string };
