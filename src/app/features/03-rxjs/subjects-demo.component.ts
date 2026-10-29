/**
 * ============================================================================
 * FILE: subjects-demo.component.ts   (Module 03 - Subject variants)
 * ============================================================================
 * WHAT IS THIS?
 *   A playground for Subject, BehaviorSubject, ReplaySubject and AsyncSubject.
 *   You press "Emit" a few times, then add a LATE subscriber and see exactly
 *   what each type gives it, drawn as a visual timeline.
 *
 * REAL-WORLD ANALOGY:
 *   Subject         = live radio: late listeners miss earlier songs.
 *   BehaviorSubject = a shop-window display: always shows the CURRENT item, even
 *                     to someone arriving now (needs an initial value).
 *   ReplaySubject   = a DVR: replays the last N programmes to a newcomer.
 *   AsyncSubject    = a verdict: only the LAST value, delivered after complete().
 *
 * WHY DO WE NEED IT?
 *   A Subject is both an Observable (you can subscribe) and an Observer (you can
 *   call next()). It is how you manually push events/state to many listeners.
 *
 * COMMON BEGINNER MISTAKE:
 *   Exposing the Subject publicly so any component can call next(). Expose
 *   `.asObservable()` and keep next() private.
 * ============================================================================
 */
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AsyncSubject, BehaviorSubject, ReplaySubject, Subject } from 'rxjs';
import { LogService } from '../../core/services/log.service';

const SRC = '03-rxjs';

type Kind = 'Subject' | 'BehaviorSubject' | 'ReplaySubject(2)' | 'AsyncSubject';
interface Lane { readonly kind: Kind; readonly events: ReturnType<typeof signal<string[]>>; }

@Component({
  selector: 'app-rx-subjects-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="row">
      <button class="btn primary" type="button" (click)="emit()">Emit next value (#{{ next() }})</button>
      <button class="btn" type="button" (click)="subscribeLate()">Add LATE subscriber</button>
      <button class="btn" type="button" (click)="complete()">complete()</button>
      <button class="btn danger" type="button" (click)="reset()">Reset</button>
    </div>
    <p class="muted">Timeline: <code>E</code>=emitted, <code>L</code>=what the LATE subscriber received.</p>

    @for (lane of lanes; track lane.kind) {
      <div class="box">
        <strong>{{ lane.kind }}</strong>
        <div class="mono lane">
          @for (e of lane.events(); track $index) { <span [class]="'ev ' + e.charAt(0)">{{ e }}</span> }
        </div>
      </div>
    }
  `,
  styles: `
    .lane { display: flex; gap: .35rem; flex-wrap: wrap; min-height: 1.7rem; margin-top: .3rem; }
    .ev { padding: 1px 8px; border-radius: 999px; background: #e6edfd; }
    .ev.L { background: #d5f5e0; } .ev.C { background: #fde6e3; }
  `,
})
export class RxSubjectsDemoComponent {
  private readonly log = inject(LogService);
  protected readonly next = signal(1);

  // One Subject of every kind, all fed the same values.
  private subject = new Subject<number>();
  private behavior = new BehaviorSubject<number>(0); // needs an initial value
  private replay = new ReplaySubject<number>(2); // remembers last 2
  private async = new AsyncSubject<number>(); // only last value, on complete

  protected readonly lanes: Lane[] = [
    { kind: 'Subject', events: signal<string[]>([]) },
    { kind: 'BehaviorSubject', events: signal<string[]>(['(initial 0)']) },
    { kind: 'ReplaySubject(2)', events: signal<string[]>([]) },
    { kind: 'AsyncSubject', events: signal<string[]>([]) },
  ];

  protected emit(): void {
    const v = this.next();
    this.subject.next(v); this.behavior.next(v); this.replay.next(v); this.async.next(v);
    this.lanes.forEach((l) => l.events.update((e) => [...e, `E${v}`]));
    this.next.update((n) => n + 1);
    this.log.info(SRC, `next(${v}) sent to all four subjects`);
  }

  protected subscribeLate(): void {
    const streams = [this.subject, this.behavior, this.replay, this.async];
    streams.forEach((s, i) => {
      const lane = this.lanes[i];
      if (!lane) return;
      lane.events.update((e) => [...e, '| late sub']);
      s.subscribe({
        next: (v) => lane.events.update((e) => [...e, `L${v}`]),
        complete: () => lane.events.update((e) => [...e, 'C(complete)']),
      });
    });
    this.log.success(SRC, 'Late subscriber added - compare what each subject replayed');
  }

  protected complete(): void {
    [this.subject, this.behavior, this.replay, this.async].forEach((s) => s.complete());
    this.log.warn(SRC, 'complete() called - AsyncSubject now delivers its last value');
  }

  protected reset(): void {
    this.subject = new Subject<number>();
    this.behavior = new BehaviorSubject<number>(0);
    this.replay = new ReplaySubject<number>(2);
    this.async = new AsyncSubject<number>();
    this.lanes.forEach((l) => l.events.set(l.kind === 'BehaviorSubject' ? ['(initial 0)'] : []));
    this.next.set(1);
  }
}
