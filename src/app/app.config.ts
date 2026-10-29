/**
 * ============================================================================
 * FILE: app.config.ts
 * ============================================================================
 * WHAT IS THIS?
 *   The application's "wiring diagram": a list of providers (services & router
 *   features) available to the whole app. `main.ts` hands it to
 *   `bootstrapApplication`.
 *
 * REAL-WORLD ANALOGY:
 *   The building's fuse box. Every global capability (HTTP, routing, error
 *   handling) is a switch that you turn on here.
 *
 * WHY DO WE NEED IT?
 *   Standalone apps have no AppModule. This object REPLACES the old
 *   `@NgModule({ providers, imports })` of the root module.
 *
 * COMMON BEGINNER MISTAKE:
 *   Re-providing `provideHttpClient()` in a lazy route and wondering why
 *   interceptors vanish. Provide global things ONCE, here.
 * ============================================================================
 */
import {
  ApplicationConfig,
  ErrorHandler,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import {
  PreloadingStrategy,
  TitleStrategy,
  provideRouter,
  withComponentInputBinding,
  withPreloading,
  withViewTransitions,
} from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import { GlobalErrorHandler } from './core/error/global-error-handler';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { cacheInterceptor } from './core/interceptors/cache.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { retryInterceptor } from './core/interceptors/retry.interceptor';
import { AppTitleStrategy, SelectivePreloadingStrategy } from './core/router/router-strategies';
import { AppConfigService } from './core/services/app-config.service';

export const appConfig: ApplicationConfig = {
  providers: [
    // Logs uncaught errors from window "error"/"unhandledrejection" to ErrorHandler.
    provideBrowserGlobalErrorListeners(),

    // ZONELESS: Angular updates the screen only when a signal changes or an
    // event fires - no zone.js monkey-patching. (Module 02 explains this.)
    provideZonelessChangeDetection(),

    // ROUTER with 3 opt-in features (Module 07):
    //  - withComponentInputBinding : URL params become component inputs
    //  - withViewTransitions       : animated page changes
    //  - withPreloading            : background-download flagged lazy chunks
    provideRouter(routes, withComponentInputBinding(), withViewTransitions(), withPreloading(SelectivePreloadingStrategy)),
    { provide: TitleStrategy, useClass: AppTitleStrategy },
    { provide: PreloadingStrategy, useExisting: SelectivePreloadingStrategy },

    // HTTP: interceptors run top-to-bottom for requests, bottom-to-top for responses.
    provideHttpClient(
      withFetch(), // use the modern `fetch` API (also required for SSR)
      withInterceptors([authInterceptor, cacheInterceptor, retryInterceptor, errorInterceptor]),
    ),

    // Replace Angular's default error handler with ours (Module 13).
    { provide: ErrorHandler, useClass: GlobalErrorHandler },

    // Needed by @angular/animations triggers (Module 13). Loads lazily.
    provideAnimationsAsync(),

    // Runs BEFORE the first screen renders; Angular waits for the promise.
    provideAppInitializer(() => inject(AppConfigService).load()),
  ],
};
