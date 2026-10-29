/**
 * ============================================================================
 * FILE: signals-page.component.ts   (MODULE 02 page)
 * ============================================================================
 * WHAT IS THIS?   Page that composes the Signals, Resource and Store demos.
 * ANALOGY         A lab bench with three experiments.
 * WHY?            Keeps each concept in a small focused file.
 * MISTAKE         Reading the code without clicking - interact and watch the log!
 * ============================================================================
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FeaturePageComponent } from '../../shared/components/feature-page.component';
import { ResourceDemoComponent } from './resource-demo.component';
import { SignalsDemoComponent } from './signals-demo.component';
import { StoreAndCdDemoComponent } from './store-and-cd-demo.component';

@Component({
  selector: 'app-signals-page',
  imports: [FeaturePageComponent, SignalsDemoComponent, ResourceDemoComponent, StoreAndCdDemoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-feature-page
      title="02 Modern Reactivity: Signals & Resource API"
      subtitle="Values that tell Angular exactly what to update."
      level="Beginner"
      source="02-signals"
      [bullets]="bullets"
    >
      <section class="card"><h2>A. Signal primitives</h2><app-signals-demo /></section>
      <section class="card"><h2>B. resource() &amp; rxResource()</h2><app-resource-demo /></section>
      <section class="card"><h2>C. Signal Store &amp; change detection</h2><app-store-and-cd-demo /></section>
    </app-feature-page>
  `,
})
export class SignalsPageComponent {
  protected readonly bullets = [
    'signal() holds a value; computed() derives a value; effect() runs side effects when they change.',
    'Always READ a signal by calling it: count() - the template then updates automatically.',
    'linkedSignal() is a writable value that resets itself whenever its source changes.',
    'resource() re-fetches when params change and cancels the old request through AbortSignal.',
    'CartStore shows a tiny "state management" pattern: private writable signal + public read-only selectors + action methods.',
    'This app is ZONELESS: compare the "checked" counters of Default and OnPush children.',
  ];
}
