/**
 * ============================================================================
 * FILE: routing-pages.ts   (small routed components for Module 07)
 * ============================================================================
 * WHAT IS THIS?
 *   The destinations used by routing.routes.ts. Each shows one concept:
 *   signal inputs bound from the URL (`id`, `page`, `section`, resolved `user`),
 *   guards' outcomes, and the unsaved-changes prompt.
 *
 * REAL-WORLD ANALOGY:
 *   Rooms inside the wing; the router is the corridor map.
 *
 * WHY DO WE NEED IT?
 *   With `withComponentInputBinding()` components DON'T need ActivatedRoute:
 *   the URL is just inputs.
 *
 * COMMON BEGINNER MISTAKE:
 *   Path params are always STRINGS ("3", not 3). Use a `transform: numberAttribute`.
 * ============================================================================
 */
import { ChangeDetectionStrategy, Component, inject, input, numberAttribute, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HasUnsavedChanges } from '../../core/guards/auth.guards';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-routing-overview',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p>Pick a link above to try each router feature. Current outlet: <code>overview</code>.</p>
    <a routerLink="/07-routing/users/42" [queryParams]="{ page: 2 }">Example: users/42?page=2</a>
  `,
})
export class OverviewComponent {}

@Component({
  selector: 'app-user-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="stack">
      <div>Path param <code>:id</code> as input: <strong>{{ id() }}</strong> (type {{ typeofId }})</div>
      <div>Static route <code>data.section</code> as input: <strong>{{ section() }}</strong></div>
      <div>Resolved <code>user</code> as input: <strong>{{ user()?.name }}</strong> ({{ user()?.email }})</div>
      <div>Query param <code>?page</code>: <strong>{{ page() }}</strong></div>
    </div>
  `,
})
export class UserDetailComponent {
  /** :id from the URL. transform converts the string to a number. */
  readonly id = input.required({ transform: numberAttribute });
  /** static `data: { section: 'users' }` from the route config. */
  readonly section = input<string>();
  /** value produced by the `userResolver`. */
  readonly user = input<User>();
  /** optional ?page=... query param. */
  readonly page = input<string>('1');
  protected readonly typeofId = 'number (after transform)';
}

@Component({
  selector: 'app-list',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p>Query param <code>?page=</code> as a signal input: <strong>{{ page() }}</strong></p>
    <div class="row">
      <a class="btn" routerLink="." [queryParams]="{ page: 1 }">page 1</a>
      <a class="btn" routerLink="." [queryParams]="{ page: 2 }">page 2</a>
      <a class="btn" routerLink="." [queryParams]="{ page: 3 }" queryParamsHandling="merge">page 3 (merge)</a>
    </div>
  `,
})
export class ListComponent {
  readonly page = input('1');
}

@Component({ selector: 'app-secret', changeDetection: ChangeDetectionStrategy.OnPush, template: `<p class="ok">Welcome to the secret page - authGuard (CanActivate) let you in.</p>` })
export class SecretComponent {}

@Component({ selector: 'app-admin-dashboard', changeDetection: ChangeDetectionStrategy.OnPush, template: `<p class="ok">Admin dashboard - CanActivateChild allowed you (role ADMIN).</p>` })
export class AdminDashboardComponent {}

@Component({ selector: 'app-admin-home', changeDetection: ChangeDetectionStrategy.OnPush, template: `<p class="ok">ADMIN version of /home (CanMatch picked this route).</p>` })
export class AdminHomeComponent {}

@Component({ selector: 'app-user-home', changeDetection: ChangeDetectionStrategy.OnPush, template: `<p>Regular version of /home. Log in as Admin and come back - a different component renders for the SAME URL.</p>` })
export class UserHomeComponent {}

@Component({
  selector: 'app-login-required',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p class="warn">You were redirected here by a guard (from: <code>{{ from() ?? 'n/a' }}</code>). Use the header buttons to log in, then retry.</p>`,
})
export class LoginRequiredComponent {
  readonly from = input<string>();
}

@Component({
  selector: 'app-editor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label for="ed">Type something, then click another link (CanDeactivate asks for confirmation):</label>
    <textarea id="ed" rows="3" (input)="dirty.set(true)"></textarea>
    <button class="btn" type="button" (click)="dirty.set(false)">Save (clears unsaved flag)</button>
    <p class="muted">unsaved: {{ dirty() }}</p>
  `,
})
export class EditorComponent implements HasUnsavedChanges {
  protected readonly dirty = signal(false);
  hasUnsavedChanges(): boolean { return this.dirty(); }
}

@Component({
  selector: 'app-help-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<aside class="box"><strong>Help panel</strong> - rendered in the NAMED outlet "side" (URL: <code>(side:help)</code>). Logged in: {{ auth.isLoggedIn() }}</aside>`,
})
export class HelpPanelComponent {
  protected readonly auth = inject(AuthService);
}
