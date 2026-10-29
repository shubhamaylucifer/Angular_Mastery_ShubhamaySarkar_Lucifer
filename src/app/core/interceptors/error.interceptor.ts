/**
 * ============================================================================
 * FILE: error.interceptor.ts
 * ============================================================================
 * WHAT IS THIS?
 *   Catches every FAILED HTTP response in one place, shows a toast and logs it.
 *
 * REAL-WORLD ANALOGY:
 *   The complaints desk at the end of an assembly line - whichever station
 *   fails, the problem is reported to the same desk.
 *
 * WHY DO WE NEED IT?
 *   Consistent, friendly messages without try/catch scattered everywhere.
 *   NOTE: this handles HTTP failures only. Bugs in your own code are handled
 *   by the global ErrorHandler (see global-error-handler.ts).
 *
 * COMMON BEGINNER MISTAKE:
 *   Forgetting `throwError`/re-throw. If you swallow the error the component's
 *   own error callback never runs and it may spin forever.
 * ============================================================================
 */
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { LogService } from '../services/log.service';
import { ToastService } from '../services/toast.service';
import { SILENT_ERRORS } from './http-context';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const log = inject(LogService);
  const toast = inject(ToastService);

  return next(req).pipe(
    // catchError runs only when the stream fails.
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && !req.context.get(SILENT_ERRORS)) {
        const text = err.status === 0
          ? 'Network error - are you offline?'
          : `Server said ${err.status}: ${err.statusText || 'error'}`;
        log.error('http', `error interceptor: ${req.method} ${req.url} -> ${text}`);
        toast.show(text, 'error');
      }
      // Re-throw so the caller can still react.
      return throwError(() => err);
    }),
  );
};
