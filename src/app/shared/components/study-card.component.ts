/**
 * ============================================================================
 * FILE: study-card.component.ts
 * ============================================================================
 * WHAT IS THIS?
 *   The "Fresher's Study Card": a collapsible box at the top of every feature
 *   page that explains, in plain bullet points, what the page demonstrates.
 *
 * REAL-WORLD ANALOGY:
 *   The "how to use this exhibit" sign next to a museum display.
 *
 * WHY DO WE NEED IT?
 *   A running demo alone does not teach. The card tells you WHAT to click and
 *   WHAT to notice.
 *
 * COMMON BEGINNER MISTAKE:
 *   Not reading it! Open it, read the bullets, THEN play with the demo and
 *   watch the Event Log at the bottom.
 * ============================================================================
 */
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * `@Component` is a decorator that turns a plain class into a UI building block.
 *  - selector: the custom HTML tag you write to use it: <app-study-card>
 *  - changeDetection OnPush: "only re-check me when my inputs change or I fire
 *    an event" - cheaper than checking on every browser event.
 *  - Since Angular 19, `standalone: true` is the DEFAULT, so we don't write it.
 */
@Component({
  selector: 'app-study-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- <details>/<summary> is native HTML: collapsible with zero JavaScript. -->
    <details class="study" open>
      <summary>Fresher's Study Card - {{ heading() }}</summary>
      <ul>
        <!-- @for repeats the block per item. "track" tells Angular how to
             identify each row so it can re-use DOM nodes (we use the text). -->
        @for (b of bullets(); track b) {
          <li>{{ b }}</li>
        }
      </ul>
      <!-- Anything the page puts between <app-study-card> tags appears here. -->
      <ng-content />
    </details>
  `,
  styles: `
    .study { background: #fffbea; border: 1px solid #f0dc8a; border-radius: 10px; padding: .6rem 1rem; margin-bottom: 1rem; }
    summary { cursor: pointer; font-weight: 700; color: #7a5b00; }
    ul { margin: .5rem 0 .25rem 1.1rem; padding: 0; }
    li { margin: .2rem 0; }
  `,
})
export class StudyCardComponent {
  /**
   * `input.required<T>()` = a signal-based input that the PARENT must supply.
   * Read it in the template by calling it like a function: heading().
   */
  readonly heading = input.required<string>();
  readonly bullets = input.required<readonly string[]>();
}
