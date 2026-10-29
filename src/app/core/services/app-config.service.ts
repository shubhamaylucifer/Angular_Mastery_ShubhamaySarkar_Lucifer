/**
 * ============================================================================
 * FILE: app-config.service.ts
 * ============================================================================
 * WHAT IS THIS?
 *   A service holding runtime configuration (feature flags, app title) that is
 *   fetched BEFORE the app screen appears, using `provideAppInitializer()`.
 *
 * REAL-WORLD ANALOGY:
 *   A pilot's pre-flight checklist: the plane doesn't take off until every item
 *   is ticked.
 *
 * WHY DO WE NEED IT?
 *   Some settings live on a server (so ops can change them without rebuilding).
 *   Components need them synchronously at start-up, so we wait for them first.
 *
 * COMMON BEGINNER MISTAKE:
 *   Making the initializer slow. The user stares at a blank page until it
 *   finishes - keep it tiny and have a timeout/fallback.
 * ============================================================================
 */
import { Injectable, inject, signal } from '@angular/core';
import { delay, firstValueFrom, of } from 'rxjs';
import { LogService } from './log.service';

export interface RuntimeConfig {
  readonly appTitle: string;
  readonly featureFlags: Readonly<Record<string, boolean>>;
  readonly loadedAt: string;
}

@Injectable({ providedIn: 'root' })
export class AppConfigService {
  private readonly log = inject(LogService);
  private readonly _config = signal<RuntimeConfig | null>(null);
  readonly config = this._config.asReadonly();

  /** Pretend to fetch JSON from a server (300 ms) and store it. */
  async load(): Promise<void> {
    this.log.info('app-initializer', 'Fetching runtime config BEFORE app starts...');
    // `firstValueFrom` turns an Observable into a Promise (first emitted value).
    const cfg = await firstValueFrom(
      of<RuntimeConfig>({
        appTitle: 'Angular Mastery Showcase',
        featureFlags: { betaBanner: true, darkMode: false },
        loadedAt: new Date().toLocaleTimeString(),
      }).pipe(delay(300)),
    );
    this._config.set(cfg);
    this.log.success('app-initializer', `Config loaded at ${cfg.loadedAt}`);
  }
}
