/**
 * ============================================================================
 * FILE: async-rxjs.spec.ts   (ASYNC + RxJS MARBLE testing)
 * ============================================================================
 * WHAT IS THIS?
 *   Testing time-based code two ways:
 *    1. FAKE TIMERS - make setTimeout/interval/debounce run instantly.
 *    2. MARBLE DIAGRAMS with RxJS `TestScheduler` - draw streams as text.
 *
 * REAL-WORLD ANALOGY:
 *   Fast-forwarding a video instead of watching 10 real minutes. Marbles are the
 *   storyboard of that video, one character per frame.
 *
 * WHY DO WE NEED IT?
 *   Real waiting makes tests slow and flaky. Virtual time makes them instant
 *   and exact.
 *
 * IMPORTANT FOR THIS REPO:
 *   Classic Angular tests use `fakeAsync()` + `tick()`. Those rely on Zone.js,
 *   and Angular's own typings say fakeAsync "cannot be used with the Vitest test
 *   runner" (the default runner in modern Angular, and this app is zoneless).
 *   The Vitest equivalent is `vi.useFakeTimers()` + `vi.advanceTimersByTime()`:
 *       fakeAsync(() => { ...; tick(500); })   <==>   vi.advanceTimersByTime(500)
 *   If you work in a Karma/Jasmine + zone.js project, use fakeAsync/tick/flush.
 *
 * MARBLE SYNTAX:
 *   -   one frame (1 virtual ms) of time      a, b, c  emitted values
 *   |   complete                              #        error
 *   ^   subscription point (hot)               ()      emit in the SAME frame
 *   '-a-b-c|' = nothing, a, nothing, b, nothing, c, complete.
 *
 * COMMON BEGINNER MISTAKE:
 *   Using real `await new Promise(r => setTimeout(r, 1000))` in tests.
 * ============================================================================
 */
import { Subject, debounceTime, delay, map, of, switchMap, timer } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('Fake timers (Vitest equivalent of fakeAsync/tick)', () => {
  beforeEach(() => vi.useFakeTimers()); // take control of the clock
  afterEach(() => vi.useRealTimers()); // always give it back

  it('debounceTime only emits the last value after the quiet period', () => {
    const input$ = new Subject<string>();
    const seen: string[] = [];
    input$.pipe(debounceTime(300)).subscribe((v) => seen.push(v));

    input$.next('a');
    vi.advanceTimersByTime(100); // "tick(100)"
    input$.next('ab');
    vi.advanceTimersByTime(299);
    expect(seen).toEqual([]); // still waiting - nothing emitted yet
    vi.advanceTimersByTime(1); // total quiet time reached 300ms
    expect(seen).toEqual(['ab']);
  });

  it('timer() emits after the delay', () => {
    let fired = false;
    timer(1000).subscribe(() => (fired = true));
    vi.advanceTimersByTime(999);
    expect(fired).toBe(false);
    vi.advanceTimersByTime(1);
    expect(fired).toBe(true);
  });

  it('setTimeout callbacks run when time is advanced', () => {
    const spy = vi.fn();
    setTimeout(spy, 500);
    expect(spy).not.toHaveBeenCalled();
    vi.runAllTimers(); // like flush()
    expect(spy).toHaveBeenCalledTimes(1);
  });
});

describe('RxJS marble tests (TestScheduler)', () => {
  let scheduler: TestScheduler;

  beforeEach(() => {
    // The callback compares ACTUAL vs EXPECTED notifications with Vitest's expect.
    scheduler = new TestScheduler((actual, expected) => expect(actual).toEqual(expected));
  });

  it('map transforms every value', () => {
    scheduler.run(({ cold, expectObservable }) => {
      const source = cold('-a-b-c|', { a: 1, b: 2, c: 3 });
      const result = source.pipe(map((n) => n * 10));
      expectObservable(result).toBe('-a-b-c|', { a: 10, b: 20, c: 30 });
    });
  });

  it('delay shifts emissions by N virtual ms', () => {
    scheduler.run(({ cold, expectObservable }) => {
      const source = cold('a-b|');
      // delay(3) moves every emission 3 frames later. The completion waits for
      // the last delayed value, so 'b' and '|' land in the same frame: (b|).
      expectObservable(source.pipe(delay(3))).toBe('---a-(b|)');
    });
  });

  it('debounceTime keeps only values followed by silence', () => {
    scheduler.run(({ cold, expectObservable }) => {
      const source = cold('-a-b------c|');
      // 3 frames of silence required: "a" is replaced by "b" (arrives after 2 frames), "b" survives.
      expectObservable(source.pipe(debounceTime(3))).toBe('------b----(c|)');
    });
  });

  it('switchMap cancels the previous inner stream', () => {
    scheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const outer = cold('-a--b---|');
      const innerA = cold('--x-y|'); // would emit x at +2 and y at +4
      const innerB = cold('--z|');
      const result = outer.pipe(switchMap((v) => (v === 'a' ? innerA : innerB)));
      // a (frame 1) starts innerA -> x arrives at frame 3.
      // b (frame 4) CANCELS innerA before y can arrive, then innerB emits z at frame 6.
      expectObservable(result).toBe('---x--z-|');
      // innerA was subscribed at frame 1 and unsubscribed ("!") at frame 4.
      expectSubscriptions(innerA.subscriptions).toBe('-^--!');
    });
  });
  it('of() emits synchronously and completes', () => {
    scheduler.run(({ expectObservable }) => {
      expectObservable(of('x', 'y')).toBe('(xy|)');
    });
  });
});
