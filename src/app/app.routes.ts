/**
 * ============================================================================
 * FILE: app.routes.ts
 * ============================================================================
 * WHAT IS THIS?
 *   The top-level route table: URL path -> which component to show.
 *   Every feature is LAZY LOADED with `loadComponent` / `loadChildren`: its
 *   code is only downloaded when you first visit it.
 *
 * REAL-WORLD ANALOGY:
 *   A hotel directory: "Room 07 -> Routing". Rooms are built (downloaded) only
 *   when a guest asks for them.
 *
 * WHY DO WE NEED IT?
 *   Small first download = fast start. Without lazy loading all 13 modules are
 *   in one big bundle.
 *
 * COMMON BEGINNER MISTAKE:
 *   Placing the `**` wildcard route BEFORE other routes. The router uses the
 *   first match, so `**` must always be LAST.
 * ============================================================================
 */
import { Routes } from '@angular/router';

export const routes: Routes = [
  // Home page - also lazy loaded.
  { path: '', pathMatch: 'full', title: 'Welcome', loadComponent: () => import('./features/home.component').then((m) => m.HomeComponent) },

  // `import()` is a dynamic import -> the bundler makes a separate chunk file.
  { path: '01-components', title: '01 Components', loadComponent: () => import('./features/01-components/components-page.component').then((m) => m.ComponentsPageComponent) },
  { path: '02-signals', title: '02 Signals', loadComponent: () => import('./features/02-signals/signals-page.component').then((m) => m.SignalsPageComponent) },
  { path: '03-rxjs', title: '03 RxJS', loadComponent: () => import('./features/03-rxjs/rxjs-page.component').then((m) => m.RxjsPageComponent) },
  { path: '04-directives-pipes', title: '04 Directives & Pipes', loadComponent: () => import('./features/04-directives-pipes/directives-pipes-page.component').then((m) => m.DirectivesPipesPageComponent) },
  { path: '05-forms', title: '05 Forms', loadComponent: () => import('./features/05-forms/forms-page.component').then((m) => m.FormsPageComponent) },
  { path: '06-dependency-injection', title: '06 Dependency Injection', loadComponent: () => import('./features/06-dependency-injection/di-page.component').then((m) => m.DiPageComponent) },

  // loadChildren: the feature owns its own nested route table (Module 07).
  // `data.preload` is read by our SelectivePreloadingStrategy.
  { path: '07-routing', data: { preload: true }, loadChildren: () => import('./features/07-routing/routing.routes').then((m) => m.ROUTING_ROUTES) },

  { path: '08-http', title: '08 HTTP', loadComponent: () => import('./features/08-http/http-page.component').then((m) => m.HttpPageComponent) },
  { path: '09-performance', title: '09 Performance', loadComponent: () => import('./features/09-performance/performance-page.component').then((m) => m.PerformancePageComponent) },
  { path: '10-security-a11y-i18n', title: '10 Security, a11y, i18n', loadComponent: () => import('./features/10-security-a11y-i18n/security-page.component').then((m) => m.SecurityPageComponent) },
  { path: '11-ssr', title: '11 SSR & Hydration', loadComponent: () => import('./features/11-ssr/ssr-page.component').then((m) => m.SsrPageComponent) },
  { path: '12-testing', title: '12 Testing', loadComponent: () => import('./features/12-testing/testing-page.component').then((m) => m.TestingPageComponent) },
  { path: '13-enterprise', title: '13 Enterprise', loadComponent: () => import('./features/13-enterprise/enterprise-page.component').then((m) => m.EnterprisePageComponent) },

  // Wildcard 404 - MUST be last.
  { path: '**', title: 'Not found', loadComponent: () => import('./features/not-found.component').then((m) => m.NotFoundComponent) },
];
