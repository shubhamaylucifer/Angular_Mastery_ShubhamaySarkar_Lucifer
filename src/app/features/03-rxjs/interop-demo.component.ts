/**
 * ============================================================================
 * FILE: interop-demo.component.ts   (Module 03 - RxJS <-> Signals)
 * ============================================================================
 * WHAT IS THIS?
 *   toSignal(): Observable -> Signal.   toObservable(): Signal -> Observable.
 *
 * REAL-WORLD ANALOGY:
 *   A power adapter between two countries' sockets. RxJS (streams over time)
 *   and Signals (a current value) speak different "plugs"; these functions
 *   convert between them.
 *
 * WHY DO WE NEED IT?
 *   Router, HttpClient and forms still give Observables; templates and
 *   computed() love signals. Interop lets you mix the two worlds.
 *
 * COMMON BEGINNER MISTAKE:
 *   Forgetting that a Signal ALWAYS has a value. toSignal() of an async stream
 *   is `undefined` until the first emission - pass `initialValue` to avoid
 *   `T | undefined`. Also toSignal must be called in an injection context
 *   (constructor / field initialiser); it auto-unsubscribes for you.
 * ============================================================================
 */
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, interval, map, switchMap, of, timer } from 'rxjs';
import { LogService } from '../../core/services/log.service';

const SRC = '03-rxjs';

@Component({
  selector: 'app-rx-interop-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid-2">
      <div class="box stack">
        <h3>toSignal()</h3>
        <p>A ticking Observable read like a signal: <strong>{{ seconds() }}</strong>s</p>
        <p class="muted">No async pipe, no manual unsubscribe.</p>
      </div>
      <div class="box stack">
        <h3>toObservable()</h3>
        <label for="q">Type; the signal is turned into a stream and debounced 400ms</label>
        <input id="q" [value]="query()" (input)="query.set($any($event.target).value)" />
        <p>Search result: <strong>{{ result() }}</strong></p>
      </div>
    </div>
  `,
})
export class RxInteropDemoComponent {
  private readonly log = inject(LogService);

  /** Observable -> Signal. `initialValue` makes the type `number` (not `number | undefined`). */
  protected readonly seconds = toSignal(interval(1000).pipe(map((n) => n + 1)), { initialValue: 0 });

  protected readonly query = signal('');
  /** Signal -> Observable, then use RxJS operators that signals don't have (debounce, switchMap). */
  private readonly result$ = toObservable(this.query).pipe(
    debounceTime(400),
    switchMap((q) => (q ? timer(200).pipe(map(() => `pretend results for "${q}"`)) : of('(empty)'))),
  );
  protected readonly result = toSignal(this.result$, { initialValue: '(empty)' });

  constructor() {
    this.log.info(SRC, 'interop demo created: toSignal/toObservable clean up automatically on destroy');
  }
}
