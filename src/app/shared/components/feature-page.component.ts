/**
 * ============================================================================
 * FILE: feature-page.component.ts
 * ============================================================================
 * WHAT IS THIS?
 *   A reusable "page frame" every demo uses: title + difficulty badge,
 *   the Fresher's Study Card, the interactive demo (projected content), and
 *   the Event Log. It is a COMPOSITION component - it assembles others.
 *
 * REAL-WORLD ANALOGY:
 *   A picture frame: the frame is always the same, only the picture changes.
 *
 * WHY DO WE NEED IT?
 *   DRY - "Don't Repeat Yourself". 12+ pages share the same layout, so a change
 *   to the frame is made once.
 *
 * COMMON BEGINNER MISTAKE:
 *   Copy-pasting layout HTML into every page instead of making a wrapper.
 * ============================================================================
 */
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Level } from '../../models/nav.model';
import { EventLogComponent } from './event-log.component';
import { StudyCardComponent } from './study-card.component';

@Component({
  selector: 'app-feature-page',
  // `imports` lists every component/directive/pipe the TEMPLATE uses.
  imports: [StudyCardComponent, EventLogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1>{{ title() }} <span class="badge" [class]="level()">{{ level() }}</span></h1>
    <p class="muted">{{ subtitle() }}</p>

    <app-study-card [heading]="title()" [bullets]="bullets()" />

    <!-- The page's interactive demo gets projected right here. -->
    <ng-content />

    <app-event-log [source]="source()" />
  `,
})
export class FeaturePageComponent {
  readonly title = input.required<string>();
  readonly subtitle = input('');
  readonly level = input<Level>('Beginner');
  readonly bullets = input.required<readonly string[]>();
  /** Log "source" this page writes under; the Event Log filters by it. */
  readonly source = input.required<string>();
}
