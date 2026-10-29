/**
 * ============================================================================
 * FILE: toast.service.ts
 * ============================================================================
 * WHAT IS THIS?
 *   A tiny service that shows short pop-up messages ("toasts") in a corner.
 *
 * REAL-WORLD ANALOGY:
 *   Toast popping out of a toaster: it appears, stays a moment, disappears.
 *
 * WHY DO WE NEED IT?
 *   The global HTTP error interceptor and the global ErrorHandler have no
 *   template of their own. They need one shared place to tell the user
 *   "something went wrong".
 *
 * COMMON BEGINNER MISTAKE:
 *   Using `alert()`. It blocks the whole browser and cannot be styled/tested.
 * ============================================================================
 */
import { Injectable, signal } from '@angular/core';

export interface Toast {
  readonly id: number;
  readonly text: string;
  readonly kind: 'info' | 'error' | 'success';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 1;
  private readonly _toasts = signal<readonly Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  show(text: string, kind: Toast['kind'] = 'info', durationMs = 4000): void {
    const toast: Toast = { id: this.nextId++, text, kind };
    this._toasts.update((list) => [...list, toast]);
    // setTimeout runs the function once after `durationMs` milliseconds.
    setTimeout(() => this.dismiss(toast.id), durationMs);
  }

  dismiss(id: number): void {
    this._toasts.update((list) => list.filter((t) => t.id !== id));
  }
}
