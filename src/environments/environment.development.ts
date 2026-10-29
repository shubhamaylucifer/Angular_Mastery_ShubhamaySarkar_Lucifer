/**
 * ============================================================================
 * FILE: environment.development.ts  (used by `ng serve` / development builds)
 * ============================================================================
 * WHAT IS THIS?
 *   The development twin of `environment.ts`. Same shape, different values.
 *
 * REAL-WORLD ANALOGY:
 *   The "practice" SIM card from `environment.ts`'s phone analogy.
 *
 * WHY DO WE NEED IT?
 *   So you can use verbose logging and a test API locally without risking
 *   production data.
 *
 * COMMON BEGINNER MISTAKE:
 *   Adding a new property here but forgetting to add it to `environment.ts`.
 *   The production build then fails (or worse - `undefined` at runtime).
 *   Keep both files' shapes identical.
 * ============================================================================
 */
export const environment = {
  production: false,
  apiUrl: 'https://jsonplaceholder.typicode.com',
  envName: 'development',
} as const;
