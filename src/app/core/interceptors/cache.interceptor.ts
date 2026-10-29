/**
 * ============================================================================
 * FILE: cache.interceptor.ts
 * ============================================================================
 * WHAT IS THIS?
 *   An interceptor that remembers GET responses. The 2nd identical request is
 *   answered from memory with RxJS `of()` - no network trip at all.
 *
 * REAL-WORLD ANALOGY:
 *   A librarian who photocopies a popular page. Next visitor gets the copy
 *   instead of walking to the archive.
 *
 * WHY DO WE NEED IT?
 *   Fewer network calls = faster screens and lower server bills.
 *
 * COMMON BEGINNER MISTAKE:
 *   Caching everything forever. Stale data confuses users. We use an opt-in
 *   token (CACHEABLE) plus a time-to-live (TTL).
 * ============================================================================
 */
import { HttpEvent, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { LogService } from '../services/log.service';
import { CACHEABLE } from './http-context';

/** Module-level Map: lives as long as the page is open. key = URL. */
const cache = new Map<string, { response: HttpResponse<unknown>; storedAt: number }>();
const TTL_MS = 15_000;

export const clearHttpCache = (): void => cache.clear();

export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  const log = inject(LogService);

  // Only cache GETs that opted in.
  if (req.method !== 'GET' || !req.context.get(CACHEABLE)) {
    return next(req);
  }

  const hit = cache.get(req.urlWithParams);
  if (hit && Date.now() - hit.storedAt < TTL_MS) {
    log.success('http', `cache: HIT  ${req.urlWithParams} (no network call)`);
    // `of(x)` creates an Observable that instantly emits x and completes.
    return of(hit.response.clone()) as Observable<HttpEvent<unknown>>;
  }

  log.info('http', `cache: MISS ${req.urlWithParams}`);
  return next(req).pipe(
    // `tap` = peek at values without changing them (a side effect).
    tap((event) => {
      if (event instanceof HttpResponse) {
        cache.set(req.urlWithParams, { response: event, storedAt: Date.now() });
      }
    }),
  );
};
