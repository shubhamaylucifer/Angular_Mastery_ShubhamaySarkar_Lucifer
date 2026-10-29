/**
 * ============================================================================
 * FILE: routing.routes.ts   (Module 07 - the feature's OWN route table)
 * ============================================================================
 * WHAT IS THIS?
 *   Child routes loaded lazily via `loadChildren` from app.routes.ts. Shows:
 *   nested children, redirects, path params, query params, static `data`,
 *   resolvers (ResolveFn), all four functional guards, a named secondary
 *   outlet, and a wildcard inside the feature.
 *
 * REAL-WORLD ANALOGY:
 *   A floor plan of ONE building wing, handed out only when you enter that wing.
 *
 * WHY DO WE NEED IT?
 *   Feature teams own their URLs; the main app doesn't need to know them.
 *
 * COMMON BEGINNER MISTAKE:
 *   Relative vs absolute links. Inside a lazy feature, `routerLink="users"` is
 *   RELATIVE to the current route; `'/07-routing/users'` is ABSOLUTE.
 * ============================================================================
 */
import { inject } from '@angular/core';
import { ResolveFn, Routes } from '@angular/router';
import { adminChildGuard, adminMatchGuard, authGuard, unsavedChangesGuard } from '../../core/guards/auth.guards';
import { LogService } from '../../core/services/log.service';
import { User } from '../../models/user.model';

/**
 * ResolveFn: runs BEFORE the route activates; the returned data is available as
 * a route-data signal input (`user`) thanks to withComponentInputBinding().
 */
export const userResolver: ResolveFn<User> = (route) => {
  const id = Number(route.paramMap.get('id'));
  inject(LogService).info('07-routing', `userResolver: pre-loading user ${id} before the page appears`);
  return { id, name: `Resolved User ${id}`, email: `user${id}@example.com`, role: 'GUEST' };
};

export const ROUTING_ROUTES: Routes = [
  {
    path: '',
    title: '07 Routing',
    loadComponent: () => import('./routing-shell.component').then((m) => m.RoutingShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'overview' }, // redirect
      { path: 'overview', title: 'Routing overview', loadComponent: () => import('./routing-pages').then((m) => m.OverviewComponent) },

      // :id is a PATH PARAM; `data` is STATIC route data. Both arrive as signal inputs.
      {
        path: 'users/:id',
        title: 'User details',
        data: { section: 'users', feature: 'static route data' },
        resolve: { user: userResolver },
        loadComponent: () => import('./routing-pages').then((m) => m.UserDetailComponent),
      },
      // ?page=2 is a QUERY PARAM (read with an input named `page`).
      { path: 'list', title: 'List', loadComponent: () => import('./routing-pages').then((m) => m.ListComponent) },

      // CanActivate: must be logged in.
      { path: 'secret', canActivate: [authGuard], title: 'Secret', loadComponent: () => import('./routing-pages').then((m) => m.SecretComponent) },

      // CanActivateChild guards every child under /admin.
      {
        path: 'admin',
        canActivateChild: [adminChildGuard],
        children: [
          { path: 'dashboard', title: 'Admin dashboard', loadComponent: () => import('./routing-pages').then((m) => m.AdminDashboardComponent) },
        ],
      },

      // CanMatch: two routes with the SAME path; the first whose guard passes wins.
      { path: 'home', canMatch: [adminMatchGuard], loadComponent: () => import('./routing-pages').then((m) => m.AdminHomeComponent) },
      { path: 'home', loadComponent: () => import('./routing-pages').then((m) => m.UserHomeComponent) },

      // CanDeactivate: warns before leaving with unsaved changes.
      { path: 'editor', canDeactivate: [unsavedChangesGuard], title: 'Editor', loadComponent: () => import('./routing-pages').then((m) => m.EditorComponent) },

      { path: 'login-required', title: 'Login required', loadComponent: () => import('./routing-pages').then((m) => m.LoginRequiredComponent) },

      // NAMED (secondary) outlet: rendered in <router-outlet name="side">.
      { path: 'help', outlet: 'side', loadComponent: () => import('./routing-pages').then((m) => m.HelpPanelComponent) },

      { path: '**', loadComponent: () => import('./routing-pages').then((m) => m.OverviewComponent) },
    ],
  },
];
