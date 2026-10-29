/**
 * ============================================================================
 * FILE: routing-shell.component.ts   (Module 07 shell with nested outlets)
 * ============================================================================
 * WHAT IS THIS?
 *   The parent component of the routing feature: shows links (RouterLink,
 *   RouterLinkActive), a primary <router-outlet> and a NAMED outlet.
 *
 * REAL-WORLD ANALOGY:
 *   The lobby of the wing: signs pointing to each room, a main stage and a side
 *   panel that can show something independently.
 *
 * WHY DO WE NEED IT?
 *   Nested routes need a parent with its own <router-outlet> for children.
 *
 * COMMON BEGINNER MISTAKE:
 *   Forgetting that a nested route needs its OWN <router-outlet> in the parent.
 * ============================================================================
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FeaturePageComponent } from '../../shared/components/feature-page.component';

@Component({
  selector: 'app-routing-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FeaturePageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-feature-page
      title="07 Routing, Navigation & Guards"
      subtitle="Turn URLs into screens (and protect them)."
      level="Intermediate"
      source="07-routing"
      [bullets]="bullets"
    >
      <nav class="card row" aria-label="Routing demos">
        <a class="btn" routerLink="overview" routerLinkActive="primary">overview</a>
        <a class="btn" [routerLink]="['users', 7]" [queryParams]="{ page: 3 }" routerLinkActive="primary">users/7?page=3</a>
        <a class="btn" routerLink="list" [queryParams]="{ page: 1 }" routerLinkActive="primary">list?page</a>
        <a class="btn" routerLink="secret" routerLinkActive="primary">secret (authGuard)</a>
        <a class="btn" routerLink="admin/dashboard" routerLinkActive="primary">admin/dashboard (CanActivateChild)</a>
        <a class="btn" routerLink="home" routerLinkActive="primary">home (CanMatch)</a>
        <a class="btn" routerLink="editor" routerLinkActive="primary">editor (CanDeactivate)</a>
        <a class="btn" routerLink="does-not-exist">wildcard</a>
        <!-- Open a named outlet at the same time without leaving the main page. -->
        <a class="btn" [routerLink]="[{ outlets: { side: ['help'] } }]">open help (named outlet)</a>
        <a class="btn" [routerLink]="[{ outlets: { side: null } }]">close help</a>
      </nav>

      <div class="grid-2">
        <section class="card"><h2>Primary outlet</h2><router-outlet /></section>
        <section class="card"><h2>Named outlet "side"</h2><router-outlet name="side" /></section>
      </div>
    </app-feature-page>
  `,
})
export class RoutingShellComponent {
  protected readonly bullets = [
    'Routes map URL segments to components. This whole feature is lazy loaded with loadChildren.',
    'withComponentInputBinding() turns :id, ?page and route data into plain signal inputs — no ActivatedRoute needed.',
    'authGuard (CanActivate) blocks /secret until you log in; adminChildGuard protects everything under /admin.',
    'CanMatch lets the SAME URL (/home) render different components for different roles.',
    'CanDeactivate asks before leaving the editor with unsaved text. Resolvers pre-load data before the page shows.',
    'Look at the browser tab title (TitleStrategy) and the animated page change (withViewTransitions).',
  ];
}
