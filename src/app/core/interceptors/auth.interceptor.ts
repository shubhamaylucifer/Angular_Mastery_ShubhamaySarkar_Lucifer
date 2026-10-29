/**
 * ============================================================================
 * FILE: auth.interceptor.ts
 * ============================================================================
 * WHAT IS THIS?
 *   A FUNCTIONAL HTTP interceptor: a function that sees every outgoing HTTP
 *   request and may modify it before it leaves the app. This one attaches the
 *   login token: `Authorization: Bearer <token>`.
 *
 * REAL-WORLD ANALOGY:
 *   Airport security + boarding pass check. Every passenger (request) walks
 *   through the same checkpoint where a badge (token) is attached.
 *
 * WHY DO WE NEED IT?
 *   Otherwise you would write `headers: { Authorization: ... }` in every single
 *   `http.get()` call across the app - and forget one.
 *
 * COMMON BEGINNER MISTAKE:
 *   Mutating `req` directly. Requests are IMMUTABLE; use `req.clone({...})`
 *   to create a modified copy, then pass the copy to `next()`.
 * ============================================================================
 */
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { LogService } from '../services/log.service';
import { SKIP_AUTH } from './http-context';

/**
 * `HttpInterceptorFn` = type of a function `(req, next) => Observable<event>`.
 *  - `req`  : the outgoing request (read-only)
 *  - `next` : "pass the request on to the next interceptor / the network"
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Functional interceptors run in an "injection context", so inject() works.
  const auth = inject(AuthService);
  const log = inject(LogService);

  // Public endpoint? A caller can mark it with the SKIP_AUTH context token.
  if (req.context.get(SKIP_AUTH)) {
    log.info('http', `auth: skipped for ${req.method} ${req.url} (SKIP_AUTH)`);
    return next(req);
  }

  const token = auth.token();
  if (!token) {
    return next(req); // not logged in -> nothing to attach
  }

  log.info('http', `auth: attached Bearer token to ${req.method} ${req.url}`);
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
