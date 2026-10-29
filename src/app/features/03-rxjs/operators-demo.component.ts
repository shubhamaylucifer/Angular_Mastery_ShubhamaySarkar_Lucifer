/**
 * ============================================================================
 * FILE: operators-demo.component.ts   (Module 03 - combination/filtering/accumulation/resilience)
 * ============================================================================
 * WHAT IS THIS?
 *   Hands-on buttons for the most-asked RxJS operators grouped by purpose:
 *   a typeahead (debounceTime + distinctUntilChanged + switchMap), combination
 *   (combineLatest, withLatestFrom, forkJoin, zip, merge, concat, race),
 *   filtering (filter, take, takeWhile, first, throttleTime, auditTime),
 *   accumulation (scan vs reduce, map, pairwise, bufferTime) and
 *   resilience (catchError, retry with backoff, timeout, finalize).
 *
 * REAL-WORLD ANALOGY:
 *   Operators are stations on a factory conveyor belt. Each station takes items
 *   from the previous one, changes/filters/combines them and passes them on.
 *
 * WHY DO WE NEED IT?
 *   Without operators you would write manual timers, flags and nested callbacks.
 *
 * COMMON BEGINNER MISTAKE:
 *   Putting side effects in map(). `map` should be PURE. Use `tap` for logging.
 * ============================================================================
 */
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  Observable, auditTime, bufferTime, catchError, combineLatest, concat, debounceTime, distinctUntilChanged,
  filter, finalize, first, forkJoin, interval, map, merge, of, pairwise, race, reduce, retry, scan, switchMap,
  take, takeWhile, tap, throttleTime, throwError, timeout, timer, withLatestFrom, zip,
} from 'rxjs';
import { LogService } from '../../core/services/log.service';

const SRC = '03-rxjs';
const WORDS = ['angular', 'rxjs', 'signals', 'router', 'forms', 'directive', 'pipe', 'resolver', 'service', 'standalone'];

@Component({
  selector: 'app-rx-operators-demo',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h3>Typeahead: debounceTime + distinctUntilChanged + switchMap</h3>
    <label for="search">Type quickly (e.g. "ro"): only the final text, after 400ms of silence, triggers a "search".</label>
    <input id="search" [formControl]="search" placeholder="search words..." />
    <p>Results: <strong>{{ results().join(', ') || '-' }}</strong></p>

    <h3>Combination</h3>
    <div class="row">
      <button class="btn" type="button" (click)="combineLatestDemo()">combineLatest</button>
      <button class="btn" type="button" (click)="withLatestFromDemo()">withLatestFrom</button>
      <button class="btn" type="button" (click)="forkJoinDemo()">forkJoin</button>
      <button class="btn" type="button" (click)="zipDemo()">zip</button>
      <button class="btn" type="button" (click)="mergeDemo()">merge</button>
      <button class="btn" type="button" (click)="concatDemo()">concat</button>
      <button class="btn" type="button" (click)="raceDemo()">race</button>
    </div>

    <h3>Filtering &amp; rate limiting</h3>
    <div class="row">
      <button class="btn" type="button" (click)="filterTakeDemo()">filter + take + first</button>
      <button class="btn" type="button" (click)="takeWhileDemo()">takeWhile</button>
      <button class="btn" type="button" (click)="rateLimitDemo()">throttleTime vs auditTime</button>
    </div>

    <h3>Accumulation &amp; transformation</h3>
    <div class="row">
      <button class="btn" type="button" (click)="scanReduceDemo()">scan vs reduce</button>
      <button class="btn" type="button" (click)="pairwiseDemo()">pairwise</button>
      <button class="btn" type="button" (click)="bufferDemo()">bufferTime (1s)</button>
    </div>

    <h3>Resilience</h3>
    <div class="row">
      <button class="btn" type="button" (click)="catchErrorDemo()">catchError</button>
      <button class="btn" type="button" (click)="retryDemo()">retry + exponential backoff</button>
      <button class="btn" type="button" (click)="timeoutDemo()">timeout</button>
    </div>
  `,
})
export class RxOperatorsDemoComponent {
  private readonly log = inject(LogService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly search = new FormControl('', { nonNullable: true });
  protected readonly results = signal<string[]>([]);

  constructor() {
    this.search.valueChanges
      .pipe(
        debounceTime(400), // wait until the user pauses for 400ms
        map((t) => t.trim().toLowerCase()),
        distinctUntilChanged(), // ignore if same as last accepted text
        tap((t) => this.log.info(SRC, `typeahead: searching "${t}"`)),
        // switchMap cancels an in-flight search when a newer text arrives.
        switchMap((t) => of(t ? WORDS.filter((w) => w.includes(t)) : []).pipe(
          // pretend the server takes 200ms
          switchMap((r) => timer(200).pipe(map(() => r))))),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((r) => this.results.set(r));
  }

  /** Helper: subscribe and log every notification (next / error / complete). */
  private show<T>(label: string, source$: Observable<T>): void {
    source$.pipe(finalize(() => this.log.info(SRC, `${label}: (finalize - stream ended)`))).subscribe({
      next: (v) => this.log.info(SRC, `${label}: next ${JSON.stringify(v)}`),
      error: (e: unknown) => this.log.error(SRC, `${label}: error ${(e as Error).message}`),
      complete: () => this.log.success(SRC, `${label}: complete`),
    });
  }

  // ---------------- Combination ----------------
  protected combineLatestDemo(): void {
    // Emits whenever EITHER input emits, once both have emitted at least once.
    this.show('combineLatest', combineLatest([interval(300).pipe(take(3), map((i) => `A${i}`)), interval(500).pipe(take(2), map((i) => `B${i}`))]));
  }
  protected withLatestFromDemo(): void {
    // Only the SOURCE (left) triggers output; it grabs the latest of the other.
    this.show('withLatestFrom', interval(400).pipe(take(4), withLatestFrom(interval(150).pipe(map((i) => `ctx${i}`))), map(([a, b]) => `${a}+${b}`)));
  }
  protected forkJoinDemo(): void {
    // Waits for ALL to complete, then emits the LAST value of each (like Promise.all).
    this.show('forkJoin', forkJoin({ user: timer(300).pipe(map(() => 'user')), posts: timer(600).pipe(map(() => ['p1', 'p2'])) }));
  }
  protected zipDemo(): void {
    // Pairs values by index: 1st with 1st, 2nd with 2nd...
    this.show('zip', zip(interval(200).pipe(take(3)), of('x', 'y', 'z', 'w')));
  }
  protected mergeDemo(): void {
    // Interleaves values as they arrive.
    this.show('merge', merge(interval(300).pipe(take(3), map((i) => `fast${i}`)), interval(500).pipe(take(2), map((i) => `slow${i}`))));
  }
  protected concatDemo(): void {
    // Second source starts only after the first completes.
    this.show('concat', concat(interval(200).pipe(take(2), map((i) => `first${i}`)), of('second-starts-after-first-completes')));
  }
  protected raceDemo(): void {
    // The first source to emit WINS; the other is unsubscribed.
    this.show('race', race(timer(600).pipe(map(() => 'slow')), timer(250).pipe(map(() => 'fast WINS'))));
  }

  // ---------------- Filtering ----------------
  protected filterTakeDemo(): void {
    this.show('filter+take(2)', interval(100).pipe(filter((n) => n % 2 === 0), take(2)));
    this.show('first(n>3)', interval(100).pipe(first((n) => n > 3)));
  }
  protected takeWhileDemo(): void { this.show('takeWhile(n<4)', interval(150).pipe(takeWhile((n) => n < 4))); }

  protected rateLimitDemo(): void {
    // A burst of numbers every 100ms for 1s, filtered two ways.
    const burst$ = interval(100).pipe(take(10));
    this.show('throttleTime(350)  (first in window)', burst$.pipe(throttleTime(350)));
    this.show('auditTime(350)     (last in window)', burst$.pipe(auditTime(350)));
  }

  // ---------------- Accumulation ----------------
  protected scanReduceDemo(): void {
    const src$ = of(1, 2, 3, 4);
    this.show('scan   (emits running total each time)', src$.pipe(scan((acc, v) => acc + v, 0)));
    this.show('reduce (emits ONLY the final total on complete)', src$.pipe(reduce((acc, v) => acc + v, 0)));
  }
  protected pairwiseDemo(): void { this.show('pairwise', of(1, 4, 9, 16).pipe(pairwise(), map(([a, b]) => `${a}->${b} (diff ${b - a})`))); }
  protected bufferDemo(): void { this.show('bufferTime(1000)', interval(250).pipe(take(10), bufferTime(1000))); }

  // ---------------- Resilience ----------------
  protected catchErrorDemo(): void {
    this.show('catchError', throwError(() => new Error('boom')).pipe(catchError((e: Error) => of(`recovered from "${e.message}" with fallback`))));
  }
  protected retryDemo(): void {
    let attempts = 0;
    const flaky$ = new Observable<string>((sub) => {
      attempts++;
      this.log.warn(SRC, `flaky source: attempt ${attempts}`);
      if (attempts < 4) sub.error(new Error(`fail #${attempts}`)); else { sub.next('success on attempt 4'); sub.complete(); }
    });
    this.show('retry', flaky$.pipe(retry({
      count: 3,
      delay: (_e, i) => { const wait = 300 * 2 ** (i - 1); this.log.info(SRC, `  backing off ${wait}ms`); return timer(wait); },
    })));
  }
  protected timeoutDemo(): void { this.show('timeout(500)', timer(1500).pipe(timeout(500))); }
}
