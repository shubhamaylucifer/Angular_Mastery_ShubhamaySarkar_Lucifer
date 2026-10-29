/**
 * ============================================================================
 * FILE: components-page.component.ts   (MODULE 01 page)
 * ============================================================================
 * WHAT IS THIS?
 *   The page for Module 01. It places the five demos inside the shared
 *   <app-feature-page> frame (Study Card + Event Log come for free).
 *
 * REAL-WORLD ANALOGY:
 *   A museum room whose exhibits are the five demos.
 *
 * WHY DO WE NEED IT?
 *   Each module has ONE routed "page" component that composes the small demos.
 *
 * COMMON BEGINNER MISTAKE:
 *   Putting all demos into one gigantic component. Small focused components
 *   are easier to read, test and reuse.
 * ============================================================================
 */
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FeaturePageComponent } from '../../shared/components/feature-page.component';
import { BindingDemoComponent } from './binding-demo.component';
import { CommunicationDemoComponent } from './communication-demo.component';
import { DynamicDemoComponent } from './dynamic-demo.component';
import { EncapsulationDemoComponent } from './encapsulation-demo.component';
import { LifecycleDemoComponent } from './lifecycle-demo.component';

@Component({
  selector: 'app-components-page',
  imports: [FeaturePageComponent, BindingDemoComponent, LifecycleDemoComponent, CommunicationDemoComponent, DynamicDemoComponent, EncapsulationDemoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-feature-page
      title="01 Components, Templates & Dynamic Rendering"
      subtitle="The building blocks of every Angular screen."
      level="Beginner"
      source="01-components"
      [bullets]="bullets"
    >
      <section class="card">
        <h2>A. Data binding & control flow</h2>
        <app-binding-demo />
      </section>

      <section class="card">
        <h2>B. Lifecycle hooks (watch the Event Log)</h2>
        <div class="row">
          <button class="btn" type="button" (click)="show.set(!show())">{{ show() ? 'Destroy child' : 'Create child' }}</button>
          <button class="btn" type="button" (click)="value.update((v) => v + 1)">Change input ({{ value() }})</button>
        </div>
        @if (show()) {
          <app-lifecycle-demo [value]="value()">projected text</app-lifecycle-demo>
        }
      </section>

      <section class="card">
        <h2>C. Parent &harr; child communication, queries, projection</h2>
        <app-communication-demo />
      </section>

      <section class="card">
        <h2>D. Dynamic components</h2>
        <app-dynamic-demo />
      </section>

      <section class="card">
        <h2>E. View encapsulation</h2>
        <app-encapsulation-demo />
      </section>
    </app-feature-page>
  `,
})
export class ComponentsPageComponent {
  protected readonly show = signal(true);
  protected readonly value = signal(1);
  protected readonly bullets = [
    'Binding glues your TypeScript data to the HTML: {{ }} text, [ ] properties, ( ) events, [( )] two-way.',
    '@for needs "track" so Angular can reuse DOM rows; $index/$first/$last/$even/$odd/$count are free helper variables.',
    'Lifecycle hooks run in a fixed order. Toggle "Create child" and read the numbered lines in the Event Log.',
    'Inputs flow DOWN, outputs flow UP, model() does both. Use input.required() when a value is mandatory.',
    'viewChild/contentChild are signal queries; <ng-content select> + ngProjectAs control content projection.',
    'ViewEncapsulation decides whether CSS stays inside a component (Emulated/ShadowDom) or leaks (None).',
  ];
}
