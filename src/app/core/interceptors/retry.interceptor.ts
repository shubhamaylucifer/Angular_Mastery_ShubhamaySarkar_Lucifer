/**
 * ============================================================================
 * FILE: retry.interceptor.ts
 * ============================================================================
 * WHAT IS THIS?
 *   Automatically re-sends a failed request, waiting longer each time
 *   (exponential back-off: 500ms, 1s, 2s ...).
 *
 * REAL-WORLD ANALOGY:
 *   Calling a busy friend. You wait a bit, call again; if still busy you wait
 *   even longer - you don't redial 100 times per second.
 *
 * WHY DO WE NEED IT?
 *   Networks hiccup. A brief 503 often succeeds on the 2nd try. Back-off stops
 *   you from hammering a struggling server.
 *
 * COMMON BEGINNER MISTAKE:
 *   Retrying POST requests blindly - you may create the order twice! Only
 *   retry idempotent calls (GET). We also require an explicit opt-in token.
 * ============================================================================
 */
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { retry, timer } from 'rxjs';
import { LogService } from '../services/log.service';
import { RETRY_ENABLED } from './http-context';

export const retryInterceptor: HttpInterceptorFn = (req, next) => {
  const log = inject(LogService);
  if (!req.context.get(RETRY_ENABLED)) {
    return next(req);
  }

  return next(req).pipe(
    // retry() re-subscribes to the source (= re-sends the request) on error.
    retry({
      count: 3,
      // `delay` may return an Observable; the retry happens when it emits.
      delay: (_error, retryIndex) => {
        // retryIndex starts at 1 -> 500, 1000, 2000 ms
        const wait = 500 * 2 ** (retryIndex - 1);
        log.warn('http', `retry #${retryIndex} for ${req.url} in ${wait}ms`);
        return timer(wait);
      },
    }),
  );
};
