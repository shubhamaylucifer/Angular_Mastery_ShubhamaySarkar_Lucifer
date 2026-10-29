/**
 * ============================================================================
 * FILE: auth.guards.ts
 * ============================================================================
 * WHAT IS THIS?
 *   Four FUNCTIONAL route guards. A guard is a function the router runs BEFORE
 *   (or while leaving) a route and that answers true/false (or a redirect).
 *     - authGuard          : CanActivateFn      "may I enter this page?"
 *     - adminChildGuard    : CanActivateChildFn "may I enter any child page?"
 *     - unsavedChangesGuard: CanDeactivateFn    "may I LEAVE this page?"
 *     - adminMatchGuard    : CanMatchFn         "should this route even exist for me?"
 *
 * REAL-WORLD ANALOGY:
 *   Bouncers at different doors of a club: front door (CanActivate), VIP corridor
 *   (CanActivateChild), exit door asking "did you pay your tab?" (CanDeactivate),
 *   and a hidden door that only appears for members (CanMatch).
 *
 * WHY DO WE NEED THEM?
 *   Keeps logged-out users away from private pages and protects users from
 *   losing typed data by accident.
 *
 * COMMON BEGINNER MISTAKE:
 *   Treating guards as security. They run in the browser - hackers skip them.
 *   Always re-check permissions on the server.
 * ============================================================================
 */
import { inject } from '@angular/core';
import {
  CanActivateChildFn,
  CanActivateFn,
  CanDeactivateFn,
  CanMatchFn,
  Router,
} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LogService } from '../services/log.service';

/** Any logged-in user passes; others are redirected to the guard-demo page. */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const log = inject(LogService);
  if (auth.isLoggedIn()) {
    log.success('router', `authGuard: allowed -> ${state.url}`);
    return true;
  }
  log.warn('router', `authGuard: BLOCKED ${state.url} (not logged in)`);
  // Returning a UrlTree tells the router "cancel this and go there instead".
  return router.createUrlTree(['/07-routing/login-required'], { queryParams: { from: state.url } });
};

/** Runs for every child of the route it is placed on. Only ADMIN passes. */
export const adminChildGuard: CanActivateChildFn = (_route, state) => {
  const auth = inject(AuthService);
  const log = inject(LogService);
  const ok = auth.role() === 'ADMIN';
  log[ok ? 'success' : 'warn']('router', `adminChildGuard: ${ok ? 'allowed' : 'BLOCKED'} ${state.url}`);
  return ok || inject(Router).createUrlTree(['/07-routing/login-required']);
};

/** Components that want to warn about unsaved work implement this interface. */
export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean;
}

/** `CanDeactivateFn<T>` receives the component instance being left. */
export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (component) => {
  if (!component.hasUnsavedChanges()) {
    return true;
  }
  // `confirm` is the browser's native OK/Cancel dialog.
  return confirm('You have unsaved changes. Are you sure you want to leave?');
};

/**
 * CanMatch decides whether a route definition is even considered. If it
 * returns false the router keeps looking at the NEXT matching route - perfect
 * for "admin version of /dashboard vs normal version of /dashboard".
 */
export const adminMatchGuard: CanMatchFn = () => inject(AuthService).role() === 'ADMIN';
