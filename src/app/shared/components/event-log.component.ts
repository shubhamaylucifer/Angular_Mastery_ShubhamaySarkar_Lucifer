/**
 * ============================================================================
 * FILE: event-log.component.ts
 * ============================================================================
 * WHAT IS THIS?
 *   The live, on-screen "console" at the bottom of each page. It prints every
 *   line that demos send to `LogService`.
 *
 * REAL-WORLD ANALOGY:
 *   A flight recorder / the scrolling ticker on a news channel.
 *
 * WHY DO WE NEED IT?
 *   Many Angular concepts are about ORDER and TIMING (lifecycle hooks,
 *   RxJS emissions). Seeing them as text lines makes them concrete.
 *
 * COMMON BEGINNER MISTAKE:
 *   Expecting old lines to vanish. Use "Clear" before each experiment.
 * ============================================================================
 */
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { LogService } from '../../core/services/log.service';

@Component({
  selector: 'app-event-log',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="log" aria-label="Event log">
      <header>
        <strong>Event Log</strong>
        <span class="muted">({{ lines().length }} lines)</span>
        <button class="btn" type="button" (click)="clear()">Clear</button>
      </header>
      <!-- role="log" + aria-live: screen readers announce new lines politely. -->
      <div class="body mono" role="log" aria-live="polite" tabindex="0">
        @for (e of lines(); track e.id) {
          <div [class]="'line ' + e.level">
            <span class="t">{{ e.time }}</span>
            <span class="s">[{{ e.source }}]</span>
            {{ e.message }}
          </div>
        } @empty {
          <div class="muted">Nothing yet - interact with the demo above.</div>
        }
      </div>
    </section>
  `,
  styles: `
    .log { background: #0e1322; color: #d8def0; border-radius: 10px; overflow: hidden; margin-top: 1rem; }
    header { display: flex; gap: .5rem; align-items: center; padding: .4rem .8rem; background: #1a2140; }
    header .btn { margin-left: auto; padding: .1rem .5rem; font-size: .75rem; }
    .body { max-height: 230px; overflow: auto; padding: .5rem .8rem; font-size: .8rem; }
    .t { color: #7482ad; margin-right: .4rem; }
    .s { color: #8fb3ff; margin-right: .4rem; }
    .success { color: #7ee2a8; } .warn { color: #ffd479; } .error { color: #ff8f85; }
    .muted { color: #8a93b2; }
  `,
})
export class EventLogComponent {
  private readonly logService = inject(LogService);

  /** Optional: show only lines whose `source` equals this value. */
  readonly source = input<string | null>(null);

  /** Newest first, filtered by `source` when provided. */
  readonly lines = computed(() => {
    const src = this.source();
    const all = this.logService.entries();
    return (src ? all.filter((e) => e.source === src) : all).slice().reverse();
  });

  clear(): void {
    this.logService.clear(this.source() ?? undefined);
  }
}
