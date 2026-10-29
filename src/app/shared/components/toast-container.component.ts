/**
 * ============================================================================
 * FILE: toast-container.component.ts
 * ============================================================================
 * WHAT IS THIS?
 *   Draws the pop-up messages stored in `ToastService` in the screen corner.
 *
 * REAL-WORLD ANALOGY:
 *   The notification bubbles on your phone.
 *
 * WHY DO WE NEED IT?
 *   The service only STORES toasts; something has to DRAW them.
 *
 * COMMON BEGINNER MISTAKE:
 *   Forgetting `role="status"`; screen-reader users would never hear them.
 * ============================================================================
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="wrap" role="status" aria-live="polite">
      @for (t of toasts.toasts(); track t.id) {
        <div class="toast" [class]="t.kind">
          {{ t.text }}
          <button type="button" aria-label="Dismiss" (click)="toasts.dismiss(t.id)">x</button>
        </div>
      }
    </div>
  `,
  styles: `
    .wrap { position: fixed; right: 1rem; bottom: 1rem; display: flex; flex-direction: column; gap: .5rem; z-index: 2000; }
    .toast { background: #263056; color: #fff; padding: .6rem .9rem; border-radius: 8px; box-shadow: 0 4px 14px #0004; max-width: 340px; }
    .toast.error { background: #a93226; } .toast.success { background: #1b8a4b; }
    button { background: none; border: 0; color: inherit; cursor: pointer; margin-left: .5rem; }
  `,
})
export class ToastContainerComponent {
  protected readonly toasts = inject(ToastService);
}
