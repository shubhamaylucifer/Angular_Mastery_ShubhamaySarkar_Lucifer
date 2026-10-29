/**
 * ============================================================================
 * FILE: environment.ts  (the PRODUCTION environment - used by `ng build`)
 * ============================================================================
 * WHAT IS THIS?
 *   A tiny object holding settings that change between "my laptop" (development)
 *   and "the real website" (production): API addresses, feature switches, etc.
 *
 * REAL-WORLD ANALOGY:
 *   Think of a phone with two SIM cards. Same phone (same code), but which SIM
 *   (settings) is used depends on where you are. At build time Angular swaps the
 *   SIM for you.
 *
 * WHY DO WE NEED IT?
 *   Without it you would hard-code `http://localhost:3000` inside services and
 *   forget to change it before deploying -> the live site calls your laptop!
 *
 * COMMON BEGINNER MISTAKE:
 *   Putting SECRETS (passwords, private API keys) here. These files are bundled
 *   into the JavaScript that every visitor downloads. They are NOT secret.
 *
 * HOW THE SWAP WORKS (angular.json -> "fileReplacements"):
 *   In the "development" build configuration we told Angular:
 *       replace  src/environments/environment.ts
 *       with     src/environments/environment.development.ts
 *   so every `import { environment } from '.../environment'` silently receives
 *   the development values. Your code never changes - only the file behind it.
 * ============================================================================
 */
export const environment = {
  /** `true` => optimised, minified build. Used to switch off noisy debug logs. */
  production: true,
  /** A free fake REST API we use for all HTTP demos. */
  apiUrl: 'https://jsonplaceholder.typicode.com',
  /** Human-readable label shown in the header so you can SEE which file won. */
  envName: 'production',
} as const;
