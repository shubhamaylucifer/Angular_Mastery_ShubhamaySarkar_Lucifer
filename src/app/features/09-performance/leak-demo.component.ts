/**
 * ============================================================================
 * FILE: leak-demo.component.ts   (Module 09 - memory leak prevention)
 * ============================================================================
 * WHAT IS THIS?
 *   Two child components that subscribe to a 500 ms ticker:
 *    - LeakyChild  : subscribes and NEVER unsubscribes -> keeps running after
 *                    the component is destroyed (a memory + CPU leak).
 *    - SafeChild   : uses takeUntilDestroyed() / DestroyRef -> stops on destroy.
 *
 * REAL-WORLD ANALOGY:
 *   Leaving a tap running when you leave the house. Water (memory/CPU) keeps
 *   flowing though nobody is using it.
 *
 * WHY DO WE NEED IT?
 *   Long-lived Observables (interval, websockets, store streams, router events)
 *   never complete on their own. Each forgotten subscription keeps its component
 *   alive and slows the app over time.
 *
 * COMMON BEGINNER MISTAKE:
 *   Thinking Angular unsubscribes for you. It does for `async` pipe, toSignal
 *   and HttpClient (which completes) - NOT for your manual .subscribe().
 * ============================================================================
 */
import { ChangeDetectionStrategy, Component, DestroyRef, OnDestroy, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';
import { LogService } from '../../core/services/log.service';

const SRC = '09-performance';
/** Global counter of ticks delivered to dead components: the "leak meter". */
export const leakMeter = signal(0);

@Component({ selector: 'app-leaky-child', changeDetection: ChangeDetectionStrategy.OnPush, template: `<span class="badge Advanced">Leaky child alive</span>` })
export class LeakyChildComponent implements OnDestroy {
  private alive = true;
  constructor() {
    // BAD: no unsubscribe. The callback closure keeps `this` in memory forever.
    interval(500).subscribe(() => { if (!this.alive) leakMeter.update((n) => n + 1); });
  }
  /** Marks the component dead; the subscription above keeps running anyway (the leak). */
  ngOnDestroy(): void { this.alive = false; }
}

@Component({ selector: 'app-safe-child', changeDetection: ChangeDetectionStrategy.OnPush, template: `<span class="badge Beginner">Safe child alive</span>` })
export class SafeChildComponent {
  private readonly log = inject(LogService);
  private readonly destroyRef = inject(DestroyRef);
  private ticks = 0;
  constructor() {
    // GOOD: takeUntilDestroyed() completes the stream when this component is destroyed.
    interval(500).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.ticks++);
    // DestroyRef.onDestroy: register ANY cleanup callback (timers, listeners...).
    this.destroyRef.onDestroy(() => this.log.success(SRC, `SafeChild destroyed after ${this.ticks} ticks - subscription cleaned up`));
  }
}

@Component({
  selector: 'app-leak-demo',
  imports: [LeakyChildComponent, SafeChildComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="row">
      <button class="btn" type="button" (click)="toggle()">{{ show() ? 'Destroy both children' : 'Create both children' }}</button>
      <button class="btn" type="button" (click)="resetMeter()">Reset meter</button>
    </div>
    @if (show()) { <app-leaky-child /> <app-safe-child /> }
    <p>Ticks delivered to <strong>destroyed</strong> leaky components: <strong class="err">{{ meter() }}</strong>
      <span class="muted"> (keeps climbing after you click "Destroy" = LEAK; the safe child stops)</span></p>
  `,
})
export class LeakDemoComponent {
  protected readonly show = signal(true);
  protected readonly meter = leakMeter;
  private readonly log = inject(LogService);
  protected toggle(): void {
    this.show.update((v) => !v);
    this.log.info(SRC, this.show() ? 'children created' : 'children destroyed - watch the leak meter!');
  }
  protected resetMeter(): void { leakMeter.set(0); }
}

