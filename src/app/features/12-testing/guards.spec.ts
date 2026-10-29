/**
 * ============================================================================
 * FILE: guards.spec.ts   (Module 12 - Router & Guard testing)
 * ============================================================================
 * WHAT IS THIS?
 *   Tests for our functional route guards using `RouterTestingHarness`.
 *   The harness is a tiny fake "browser window" with a real router inside:
 *   you call `harness.navigateByUrl('/private')` and look at where you landed.
 *
 * REAL-WORLD ANALOGY:
 *   A crash-test dummy for doors. Instead of waiting for a real person to try
 *   the club door, we send a dummy at it and check whether the bouncer let it in.
 *
 * WHY DO WE NEED IT?
 *   Guards decide who can see which page. A silent bug means private pages leak
 *   or users get locked out. Tests prove each door behaves.
 *
 * COMMON BEGINNER MISTAKE:
 *   Calling the guard function directly outside an injection context. Guards use
 *   `inject()`, which only works while Angular is running them. Navigating with
 *   the harness runs them correctly for you.
 * ============================================================================
 */
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  adminMatchGuard,
  authGuard,
  HasUnsavedChanges,
  unsavedChangesGuard,
} from '../../core/guards/auth.guards';
import { AuthService } from '../../core/services/auth.service';

// Tiny throw-away components that only exist for the test routes.
@Component({ selector: 'home-stub', template: 'HOME' })
class HomeStub {}
@Component({ selector: 'private-stub', template: 'PRIVATE' })
class PrivateStub {}
@Component({ selector: 'login-stub', template: 'LOGIN-REQUIRED' })
class LoginRequiredStub {}
@Component({ selector: 'admin-stub', template: 'ADMIN-AREA' })
class AdminStub {}
@Component({ selector: 'fallback-stub', template: 'PUBLIC-FALLBACK' })
class FallbackStub {}
@Component({ selector: 'form-stub', template: 'FORM' })
class FormStub implements HasUnsavedChanges {
  dirty = false;
  hasUnsavedChanges(): boolean {
    return this.dirty;
  }
}

describe('Route guards (RouterTestingHarness)', () => {
  let auth: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        // Same shape as the real app, but with our stub components.
        provideRouter([
          { path: '', component: HomeStub },
          { path: 'private', component: PrivateStub, canActivate: [authGuard] },
          { path: '07-routing/login-required', component: LoginRequiredStub },
          // Two routes share the path: CanMatch picks the first one that says yes.
          { path: 'dash', component: AdminStub, canMatch: [adminMatchGuard] },
          { path: 'dash', component: FallbackStub },
          { path: 'form', component: FormStub, canDeactivate: [unsavedChangesGuard] },
        ]),
      ],
    });
    auth = TestBed.inject(AuthService);
  });

  afterEach(() => vi.restoreAllMocks());

  it('authGuard redirects a logged-out visitor', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/private');
    expect(TestBed.inject(Router).url).toContain('/07-routing/login-required');
    expect(harness.routeNativeElement?.textContent).toContain('LOGIN-REQUIRED');
  });

  it('authGuard lets a logged-in user through', async () => {
    auth.login('EDITOR');
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl('/private', PrivateStub);
    expect(component).toBeInstanceOf(PrivateStub);
  });

  it('adminMatchGuard picks the admin route only for ADMIN', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/dash');
    expect(harness.routeNativeElement?.textContent).toContain('PUBLIC-FALLBACK');

    auth.login('ADMIN');
    await harness.navigateByUrl('/');
    await harness.navigateByUrl('/dash');
    expect(harness.routeNativeElement?.textContent).toContain('ADMIN-AREA');
  });

  it('unsavedChangesGuard asks before leaving a dirty form and can cancel', async () => {
    const confirmSpy = vi.spyOn(globalThis, 'confirm').mockReturnValue(false);
    const harness = await RouterTestingHarness.create();
    const form = await harness.navigateByUrl('/form', FormStub);
    form.dirty = true;

    await harness.navigateByUrl('/');
    expect(confirmSpy).toHaveBeenCalledTimes(1);
    // User pressed "Cancel" -> we are still on the form.
    expect(TestBed.inject(Router).url).toBe('/form');
  });

  it('unsavedChangesGuard stays silent when the form is clean', async () => {
    const confirmSpy = vi.spyOn(globalThis, 'confirm').mockReturnValue(false);
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/form', FormStub);
    await harness.navigateByUrl('/');
    expect(confirmSpy).not.toHaveBeenCalled();
    expect(TestBed.inject(Router).url).toBe('/');
  });
});
