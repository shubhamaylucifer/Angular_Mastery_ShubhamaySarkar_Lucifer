/**
 * ============================================================================
 * FILE: core-demo.component.ts   (Module 03 - Observable fundamentals)
 * ============================================================================
 * WHAT IS THIS?
 *   Observable vs Promise, creating `new Observable()` with TEARDOWN logic,
 *   Cold vs Hot, Unicast vs Multicast, and share() / shareReplay().
 *
 * REAL-WORLD ANALOGY:
 *   Promise  = ordering ONE pizza: it arrives once (or fails) and you can't cancel.
 *   Observable = a pizza SUBSCRIPTION: many deliveries over time, cancel any time.
 *   COLD = Netflix: each viewer starts their OWN copy from the beginning.
 *   HOT  = live TV: everyone sees the same broadcast; late joiners miss the start.
 *   share() turns the Netflix stream into a live broadcast.
 *
 * WHY DO WE NEED IT?
 *   HTTP calls, clicks, timers, websockets are all "values over time". Observables
 *   give one tool (with 100+ operators) to transform and combine them.
 *
 * COMMON BEGINNER MISTAKE:
 *   Nothing happens until you subscribe(). An Observable is LAZY - a recipe,
 *   not a meal. Also: subscribing twice to a COLD stream runs the work twice
 *   (e.g. two HTTP requests!).
 * ============================================================================
 */
import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { Observable, Subscription, map, shareReplay, share, take, tap, timer } from 'rxjs';
import { LogService } from '../../core/services/log.service';

const SRC = '03-rxjs';

@Component({
  selector: 'app-rx-core-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid-2">
      <div class="box stack">
        <h3>Promise vs Observable</h3>
        <button class="btn" type="button" (click)="promiseVsObs()">Run both</button>
        <p class="muted">Promise: eager (runs immediately), 1 value, no cancel. Observable: lazy, 0..n values, unsubscribe to cancel.</p>
      </div>

      <div class="box stack">
        <h3>Custom Observable + teardown</h3>
        <div class="row">
          <button class="btn primary" type="button" (click)="startCustom()">subscribe</button>
          <button class="btn" type="button" (click)="stopCustom()">unsubscribe</button>
        </div>
        <p class="muted">Watch for "TEARDOWN ran" - the interval is cleaned up on unsubscribe.</p>
      </div>

      <div class="box stack">
        <h3>Cold (unicast) vs share() (multicast)</h3>
        <div class="row">
          <button class="btn" type="button" (click)="cold()">2 subscribers to COLD</button>
          <button class="btn" type="button" (click)="hot()">2 subscribers to share()</button>
          <button class="btn" type="button" (click)="replay()">shareReplay late subscriber</button>
        </div>
        <p class="muted">Count "producer started" lines: cold starts the work twice; shared starts it once.</p>
      </div>
    </div>
  `,
})
export class RxCoreDemoComponent {
  private readonly log = inject(LogService);
  private readonly destroyRef = inject(DestroyRef);
  private custom?: Subscription;

  protected promiseVsObs(): void {
    // PROMISE: the executor runs IMMEDIATELY, even with no .then().
    const p = new Promise<string>((resolve) => { this.log.info(SRC, 'Promise executor ran immediately'); resolve('promise value'); });
    p.then((v) => this.log.success(SRC, `Promise resolved: ${v}`));

    // OBSERVABLE: nothing runs until subscribe().
    const o$ = new Observable<string>((sub) => { this.log.info(SRC, 'Observable producer ran (because we subscribed)'); sub.next('obs value 1'); sub.next('obs value 2'); sub.complete(); });
    this.log.info(SRC, 'Observable created but NOT started yet');
    o$.subscribe({ next: (v) => this.log.success(SRC, `Observable emitted: ${v}`), complete: () => this.log.info(SRC, 'Observable completed') });
  }

  protected startCustom(): void {
    this.custom?.unsubscribe();
    // `subscriber` is how we push values OUT: next(), error(), complete().
    const stream$ = new Observable<number>((subscriber) => {
      let n = 0;
      const id = setInterval(() => subscriber.next(++n), 600);
      this.log.info(SRC, 'producer started (setInterval created)');
      // TEARDOWN: the returned function runs on unsubscribe / complete / error.
      return () => { clearInterval(id); this.log.warn(SRC, 'TEARDOWN ran - interval cleared, no leak'); };
    });
    this.custom = stream$.subscribe((v) => this.log.info(SRC, `custom value ${v}`));
    // Safety net: when the component dies, unsubscribe automatically.
    this.destroyRef.onDestroy(() => this.custom?.unsubscribe());
  }
  protected stopCustom(): void { this.custom?.unsubscribe(); }

  /** A cold source that announces every time a new "producer" starts. */
  private source$(): Observable<number> {
    return timer(0, 300).pipe(
      take(3),
      tap({ subscribe: () => this.log.warn(SRC, 'producer started (expensive work!)') }),
    );
  }

  protected cold(): void {
    const s$ = this.source$();
    s$.subscribe((v) => this.log.info(SRC, `  subscriber A got ${v}`));
    s$.subscribe((v) => this.log.info(SRC, `  subscriber B got ${v}`));
  }

  protected hot(): void {
    // share(): one underlying subscription shared by all current subscribers.
    const s$ = this.source$().pipe(share());
    s$.subscribe((v) => this.log.info(SRC, `  shared A got ${v}`));
    s$.subscribe((v) => this.log.info(SRC, `  shared B got ${v}`));
  }

  protected replay(): void {
    // shareReplay({bufferSize:1, refCount:true}): late subscribers receive the LAST value.
    // refCount:true => when the last subscriber leaves, the source is unsubscribed (no leak).
    const s$ = this.source$().pipe(map((v) => v * 10), shareReplay({ bufferSize: 1, refCount: true }));
    s$.subscribe((v) => this.log.info(SRC, `  early subscriber got ${v}`));
    setTimeout(() => s$.subscribe((v) => this.log.success(SRC, `  LATE subscriber instantly got replayed ${v}`)), 700);
  }
}

