/**
 * ============================================================================
 * FILE: log.service.ts
 * ============================================================================
 * WHAT IS THIS?
 *   A "singleton service" (ONE shared instance for the whole app) that stores
 *   every message the demos want to show in the on-screen console.
 *
 * REAL-WORLD ANALOGY:
 *   A shared whiteboard in an office. Anyone can write on it; everyone looking
 *   at it sees the same text instantly.
 *
 * WHY DO WE NEED IT?
 *   Demos happen inside components. A fresher cannot open DevTools to see what
 *   happened, so every demo calls `log.info(...)` and the Event Log component
 *   renders the lines live on the page.
 *
 * COMMON BEGINNER MISTAKE:
 *   Creating a *new* service per component with `new LogService()`. Then each
 *   component writes on its OWN whiteboard. Always let Angular inject it.
 * ============================================================================
 */
import { Injectable, computed, signal } from '@angular/core';
import { LogEntry, LogLevel } from '../../models/log.model';

/**
 * `@Injectable` is a DECORATOR (a label starting with @ placed above a class).
 * It tells Angular "this class can be given to other classes automatically".
 * `providedIn: 'root'` => Angular creates exactly ONE instance for the whole
 * app, the first time somebody asks for it (a "singleton").
 */
@Injectable({ providedIn: 'root' })
export class LogService {
  private nextId = 1;

  /**
   * `signal()` creates a reactive box holding a value. When the value changes,
   * every template reading it updates automatically (like an Excel cell).
   * It is PRIVATE so only this class can change it.
   */
  private readonly _entries = signal<readonly LogEntry[]>([]);

  /** `.asReadonly()` gives the outside world a read-only view of the box. */
  readonly entries = this._entries.asReadonly();

  /** `computed()` = a formula cell. Re-calculates only when `_entries` changes. */
  readonly count = computed(() => this._entries().length);

  /** Write one line. Level defaults to "info". */
  log(source: string, message: string, level: LogLevel = LogLevel.Info): void {
    const entry: LogEntry = {
      id: this.nextId++,
      time: new Date().toLocaleTimeString(),
      level,
      source,
      message,
    };
    /*
     * WHY queueMicrotask?
     * Some logs are written while Angular is in the middle of checking the
     * screen (lifecycle hooks). Changing a signal that the screen already
     * drew in the same pass causes the dreaded "ExpressionChanged..." error.
     * Delaying the write by one microtask (a tiny "do it right after this
     * finishes") avoids it.
     */
    queueMicrotask(() => {
      // Keep only the newest 300 lines (slice(-299) + new one) so memory stays small.
      this._entries.update((list) => [...list.slice(-299), entry]);
    });
    // Mirror to the real browser console too (open F12 to see it).
    // eslint-disable-next-line no-console
    console.log(`[${source}] ${message}`);
  }

  info(source: string, message: string): void { this.log(source, message, LogLevel.Info); }
  success(source: string, message: string): void { this.log(source, message, LogLevel.Success); }
  warn(source: string, message: string): void { this.log(source, message, LogLevel.Warn); }
  error(source: string, message: string): void { this.log(source, message, LogLevel.Error); }

  /** Remove lines. With a `source`, only that page's lines are removed. */
  clear(source?: string): void {
    this._entries.update((list) => (source ? list.filter((e) => e.source !== source) : []));
  }
}
