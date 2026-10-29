/**
 * ============================================================================
 * FILE: sample.component.ts   (the thing our Module 12 tests are testing)
 * ============================================================================
 * WHAT IS THIS?
 *   A tiny "rating counter" component with a signal input, a required input,
 *   an output and a button. Small on purpose so the TESTS are the lesson.
 *
 * REAL-WORLD ANALOGY:
 *   A crash-test dummy: simple, but it lets us practise every kind of test.
 *
 * WHY DO WE NEED IT?
 *   Tests need a subject. See sample.component.spec.ts.
 *
 * COMMON BEGINNER MISTAKE:
 *   Writing code first and "testing later" - untestable code (hidden `new`,
 *   direct `window` use) is painful to fix. Inject dependencies instead.
 * ============================================================================
 */
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-sample',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h4>{{ title() }}</h4>
    <p data-testid="count">Count: {{ count() }}</p>
    <p data-testid="double">Double: {{ double() }}</p>
    <button type="button" (click)="increment()">Add</button>
  `,
})
export class SampleComponent {
  /** Required signal input: tests set it with fixture.componentRef.setInput('title', ...). */
  readonly title = input.required<string>();
  /** Optional signal input with a default. */
  readonly start = input(0);
  /** Output: emits the new count each time the button is clicked. */
  readonly changed = output<number>();

  protected readonly count = signal(0);
  protected readonly double = computed(() => this.count() * 2);

  increment(): void {
    this.count.update((c) => c + 1);
    this.changed.emit(this.count());
  }
}
