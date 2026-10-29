/**
 * ============================================================================
 * FILE: http-context.ts
 * ============================================================================
 * WHAT IS THIS?
 *   "Sticky notes" you can attach to an HTTP request so that interceptors know
 *   how to treat it. Each note type is an `HttpContextToken`.
 *
 * REAL-WORLD ANALOGY:
 *   A "FRAGILE - handle with care" sticker on a parcel. The parcel's content is
 *   unchanged, but every sorting-centre worker (interceptor) reads the sticker.
 *
 * WHY DO WE NEED IT?
 *   Some endpoints are public (login page) and must NOT get a bearer token.
 *   Headers would be sent to the server; a context token stays inside Angular.
 *
 * COMMON BEGINNER MISTAKE:
 *   Using a custom HTTP header (e.g. `X-Skip-Auth`) as a flag. That leaks
 *   internal details to the network. Use HttpContext for in-app metadata.
 * ============================================================================
 */
import { HttpContextToken } from '@angular/common/http';

/** `true` => the auth interceptor will NOT attach the Authorization header. */
export const SKIP_AUTH = new HttpContextToken<boolean>(() => false);

/** `true` => the caching interceptor may store and reuse the response. */
export const CACHEABLE = new HttpContextToken<boolean>(() => false);

/** `true` => the retry interceptor will retry failed calls (with back-off). */
export const RETRY_ENABLED = new HttpContextToken<boolean>(() => false);

/** `true` => the error interceptor will stay quiet (the caller handles it). */
export const SILENT_ERRORS = new HttpContextToken<boolean>(() => false);
