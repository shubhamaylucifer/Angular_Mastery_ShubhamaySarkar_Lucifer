/**
 * ============================================================================
 * FILE: flattening-demo.component.ts   (Module 03 - switchMap/mergeMap/concatMap/exhaustMap)
 * ============================================================================
 * WHAT IS THIS?
 *   A race-condition simulator. Each click starts a fake "request" taking a
 *   random 400-1400 ms. Four copies run side by side, one per flattening
 *   operator, so you can SEE how they treat overlapping requests.
 *
 * REAL-WORLD ANALOGY (a restaurant kitchen receiving orders):
 *   switchMap  = the chef throws away the old dish when a new order arrives.
 *   mergeMap   = hire many chefs - all dishes cook in parallel, finish in any order.
 *   concatMap  = one chef, orders in a queue, strictly one after the other.
 *   exhaustMap = chef IGNORES new orders while busy (stops double-click on "Login").
 *
 * WHY DO WE NEED IT?
 *   When an outer event (click, keystroke) triggers an inner async call, you
 *   must decide what happens if the next event arrives before the first call ends.
 *
 * COMMON BEGINNER MISTAKE:
 *   Nesting subscribe() inside subscribe(). Use one of these operators instead -
 *   they handle subscription and cleanup for you.
 * ============================================================================
 */
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, OperatorFunction, Subject, concatMap, exhaustMap, finalize, map, mergeMap, switchMap, timer } from 'rxjs';
import { LogService } from '../../core/services/log.service';

const SRC = '03-rxjs';
type OperatorFn = (project: (n: number) => Observable<string>) => OperatorFunction<number, string>;

interface Lane {
  readonly name: string;
  readonly hint: string;
  readonly clicks: Subject<number>;
  readonly lines: ReturnType<typeof signal<string[]>>;
}

@Component({
  selector: 'app-rx-flatten-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="row">
      <button class="btn primary" type="button" (click)="click()">Click! (send request #{{ n() }})</button>
      <button class="btn" type="button" (click)="burst()">Burst: 3 quick clicks</button>
      <button class="btn danger" type="button" (click)="clearLanes()">Clear</button>
    </div>
    <div class="grid-2">
      @for (l of lanes; track l.name) {
        <div class="box">
          <strong>{{ l.name }}</strong> <span class="muted">- {{ l.hint }}</span>
          <ul class="plain mono">
            @for (line of l.lines(); track $index) { <li>{{ line }}</li> } @empty { <li class="muted">(no activity)</li> }
          </ul>
        </div>
      }
    </div>
  `,
})
export class RxFlattenDemoComponent {
  private readonly log = inject(LogService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly n = signal(1);
  private t0 = Date.now();

  protected readonly lanes: Lane[] = [
    this.makeLane('switchMap', 'cancels the previous', (fn) => switchMap(fn)),
    this.makeLane('mergeMap', 'all in parallel', (fn) => mergeMap(fn)),
    this.makeLane('concatMap', 'queued, in order', (fn) => concatMap(fn)),
    this.makeLane('exhaustMap', 'ignores while busy', (fn) => exhaustMap(fn)),
  ];

  /** Builds one lane: clicks$ -> <operator>(fakeRequest) -> lines. */
  private makeLane(name: string, hint: string, op: OperatorFn): Lane {
    const clicks = new Subject<number>();
    const lines = signal<string[]>([]);
    const push = (s: string): void => lines.update((l) => [...l, `${((Date.now() - this.t0) / 1000).toFixed(1)}s ${s}`]);

    // The "inner" async work: waits a random time and emits a result.
    const request = (id: number): Observable<string> => {
      const ms = 400 + Math.floor(Math.random() * 1000);
      push(`-> request #${id} started (${ms}ms)`);
      return timer(ms).pipe(
        map(() => `result of #${id}`),
        // finalize runs on complete OR cancel; that's how we SEE switchMap cancelling.
        finalize(() => push(`   (#${id} finished or was cancelled)`)),
      );
    };

    clicks
      .pipe(op(request), takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => { push(`OK ${result}`); this.log.info(SRC, `${name}: ${result}`); });

    return { name, hint, clicks, lines };
  }

  protected click(): void {
    const id = this.n();
    this.n.update((v) => v + 1);
    this.lanes.forEach((l) => l.clicks.next(id));
  }
  protected burst(): void { this.click(); setTimeout(() => this.click(), 150); setTimeout(() => this.click(), 300); }
  protected clearLanes(): void { this.t0 = Date.now(); this.lanes.forEach((l) => l.lines.set([])); }
}
