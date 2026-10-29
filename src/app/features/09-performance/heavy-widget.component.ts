/**
 * ============================================================================
 * FILE: heavy-widget.component.ts
 * ============================================================================
 * WHAT IS THIS?
 *   A pretend "heavy" component (imagine a chart library) that the @defer blocks
 *   lazy-load. It sits in its own file so the bundler can put it in a separate
 *   JavaScript chunk that is downloaded only when needed.
 *
 * REAL-WORLD ANALOGY:
 *   A big piece of furniture kept in a warehouse; it is delivered only when the
 *   customer is actually in the room.
 *
 * WHY DO WE NEED IT?
 *   Smaller first download -> faster first paint (better Core Web Vitals).
 *
 * COMMON BEGINNER MISTAKE:
 *   @defer only splits code when the deferred component is NOT also used
 *   eagerly elsewhere (e.g. imported & used outside @defer or in a constructor).
 * ============================================================================
 */
import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { LogService } from '../../core/services/log.service';

@Component({
  selector: 'app-heavy-widget',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="box" style="background:#e3f6ea"><strong>Heavy widget loaded!</strong> {{ label }} (arrived in its own chunk)</div>`,
})
export class HeavyWidgetComponent {
  @Input() label = '';
  constructor() { inject(LogService).success('09-performance', 'HeavyWidgetComponent constructed (chunk downloaded)'); }
}
