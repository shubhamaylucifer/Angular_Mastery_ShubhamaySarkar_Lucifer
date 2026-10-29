/**
 * ============================================================================
 * FILE: app.ts  (the ROOT component, "AppComponent")
 * ============================================================================
 * WHAT IS THIS?
 *   The outermost component. It draws the permanent "shell": sidebar menu,
 *   breadcrumb header, the area where routed pages appear (<router-outlet>),
 *   and the toast pop-ups.
 *
 * REAL-WORLD ANALOGY:
 *   The frame of a TV: the frame stays, the channel (routed page) changes.
 *
 * WHY DO WE NEED IT?
 *   Every Angular app needs one root component to bootstrap. Everything else is
 *   nested inside it.
 *
 * COMMON BEGINNER MISTAKE:
 *   Forgetting to add RouterOutlet/RouterLink to `imports`. The template then
 *   throws "'router-outlet' is not a known element".
 * ============================================================================
 */
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { NAV_ITEMS } from './core/nav.config';
import { AuthService } from './core/services/auth.service';
import { AppConfigService } from './core/services/app-config.service';
import { ToastContainerComponent } from './shared/components/toast-container.component';
import { environment } from '../environments/environment';
import { UserRole } from './models/user.model';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ToastContainerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly nav = NAV_ITEMS;
  protected readonly auth = inject(AuthService);
  protected readonly cfg = inject(AppConfigService).config;
  protected readonly envName = environment.envName;
  private readonly router = inject(Router);

  /** Group the flat nav list by level so the sidebar shows 3 headings. */
  protected readonly groups = (['Beginner', 'Intermediate', 'Advanced'] as const).map((level) => ({
    level,
    items: NAV_ITEMS.filter((n) => n.level === level),
  }));

  /**
   * `router.events` is an Observable of everything the router does.
   * We keep only "navigation finished" events, take the URL, and turn the
   * stream into a signal so the template can read `url()` directly.
   */
  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  /** "/07-routing/users/3?x=1" -> ["Home", "07 Routing & Guards", "users", "3"] */
  protected readonly crumbs = computed(() => {
    const segments = this.url().split('?')[0]!.split('/').filter(Boolean);
    const out: { label: string; link: string }[] = [{ label: 'Home', link: '/' }];
    let link = '';
    for (const seg of segments) {
      link += `/${seg}`;
      const match = this.nav.find((n) => n.path === seg);
      out.push({ label: match?.title ?? decodeURIComponent(seg), link });
    }
    return out;
  });

  protected login(role: UserRole): void { this.auth.login(role); }
}
