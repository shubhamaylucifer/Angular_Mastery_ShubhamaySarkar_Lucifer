/**
 * ============================================================================
 * FILE: global-error-handler.ts
 * ============================================================================
 * WHAT IS THIS?
 *   A replacement for Angular's built-in `ErrorHandler`. Angular calls
 *   `handleError()` for any uncaught exception thrown in templates, event
 *   handlers, lifecycle hooks, signals/effects and (via zone / global
 *   listeners) async code.
 *
 * REAL-WORLD ANALOGY:
 *   The smoke detector of a building: it doesn't prevent fires but makes sure
 *   somebody hears about every one.
 *
 * WHY DO WE NEED IT?
 *   By default errors only appear in the DevTools console - users see a frozen
 *   screen and you never learn about it. Here we log, show a toast and (in real
 *   projects) would send the error to Sentry / Application Insights.
 *
 * COMMON BEGINNER MISTAKE:
 *   Thinking this catches HTTP errors. A failing HTTP call is a *handled*
 *   Observable error - use an interceptor / catchError for those.
 * ============================================================================
 */
import { ErrorHandler, Injectable, inject } from '@angular/core';
import { LogService } from '../services/log.service';
import { ToastService } from '../services/toast.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly log = inject(LogService);
  private readonly toast = inject(ToastService);

  handleError(error: unknown): void {
    const message = error instanceof Error ? error.message : String(error);
    this.log.error('global-error-handler', `Caught: ${message}`);
    this.toast.show(`Unexpected error: ${message}`, 'error', 6000);
    console.error(error); // keep the full stack trace for developers
  }
}
