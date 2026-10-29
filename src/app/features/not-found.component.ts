/**
 * ============================================================================
 * FILE: not-found.component.ts
 * ============================================================================
 * WHAT IS THIS?   The 404 page shown by the `**` wildcard route.
 * ANALOGY         "Sorry, no such room" at the hotel desk.
 * WHY?            Without it, a mistyped URL shows a blank screen.
 * MISTAKE         Returning HTTP 200 for 404 pages in SSR (bad for SEO).
 * ============================================================================
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1>404 - Page not found</h1>
    <p>That URL matched the <code>**</code> wildcard route.</p>
    <a routerLink="/">Back to start</a>
  `,
})
export class NotFoundComponent {}
