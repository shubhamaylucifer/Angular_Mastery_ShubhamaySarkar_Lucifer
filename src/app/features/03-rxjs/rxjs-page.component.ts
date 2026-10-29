/**
 * ============================================================================
 * FILE: rxjs-page.component.ts   (MODULE 03 page)
 * ============================================================================
 * WHAT IS THIS?   Page composing all RxJS demos.
 * ANALOGY         A workshop with one bench per tool.
 * WHY?            Each demo stays small; this file just arranges them.
 * MISTAKE         Reading operators as magic. Click, then read the log lines.
 * ============================================================================
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FeaturePageComponent } from '../../shared/components/feature-page.component';
import { RxCoreDemoComponent } from './core-demo.component';
import { RxFlattenDemoComponent } from './flattening-demo.component';
import { RxInteropDemoComponent } from './interop-demo.component';
import { RxOperatorsDemoComponent } from './operators-demo.component';
import { RxSubjectsDemoComponent } from './subjects-demo.component';

@Component({
  selector: 'app-rxjs-page',
  imports: [FeaturePageComponent, RxCoreDemoComponent, RxSubjectsDemoComponent, RxFlattenDemoComponent, RxOperatorsDemoComponent, RxInteropDemoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-feature-page
      title="03 RxJS Mastery"
      subtitle="Reactive programming: values that arrive over time."
      level="Beginner"
      source="03-rxjs"
      [bullets]="bullets"
    >
      <section class="card"><h2>A. Core mechanics</h2><app-rx-core-demo /></section>
      <section class="card"><h2>B. Subject variants</h2><app-rx-subjects-demo /></section>
      <section class="card"><h2>C. Flattening operators - race-condition simulator</h2><app-rx-flatten-demo /></section>
      <section class="card"><h2>D. Operator toolbox</h2><app-rx-operators-demo /></section>
      <section class="card"><h2>E. RxJS &harr; Signals</h2><app-rx-interop-demo /></section>
    </app-feature-page>
  `,
})
export class RxjsPageComponent {
  protected readonly bullets = [
    'An Observable is a lazy recipe for a stream of values; nothing happens until you subscribe().',
    'Cold = each subscriber gets its own run. Hot/shared = everyone shares one run (share, shareReplay).',
    'Subject types differ in what a LATE subscriber receives - try them in section B.',
    'switchMap cancels, mergeMap parallelises, concatMap queues, exhaustMap ignores. Click "Burst" in section C.',
    'Operators are chained inside .pipe(...). Use tap for side effects, map for pure transformation.',
    'toSignal / toObservable bridge RxJS and signals; both clean up automatically.',
  ];
}
