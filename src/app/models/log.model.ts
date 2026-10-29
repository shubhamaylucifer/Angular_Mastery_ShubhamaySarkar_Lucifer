/**
 * ============================================================================
 * FILE: log.model.ts
 * ============================================================================
 * WHAT IS THIS?
 *   The "shape" (TypeScript interface + enum) of one line in our on-screen
 *   console log viewer.
 *
 * REAL-WORLD ANALOGY:
 *   A form template: every log line must fill the same boxes (time, level,
 *   source, message), just like every passport has the same fields.
 *
 * WHY DO WE NEED IT?
 *   TypeScript can then yell at you at compile time if you forget a field or
 *   misspell a level, instead of the bug appearing on screen later.
 *
 * COMMON BEGINNER MISTAKE:
 *   Using `any` for data. `any` switches TypeScript OFF. Prefer interfaces.
 * ============================================================================
 */

/** An `enum` is a named list of allowed values. Here: how important a log line is. */
export enum LogLevel {
  Info = 'info',
  Success = 'success',
  Warn = 'warn',
  Error = 'error',
}

/** One entry in the on-screen console. `readonly` = cannot be changed after creation. */
export interface LogEntry {
  readonly id: number;
  readonly time: string;
  readonly level: LogLevel;
  /** Which feature wrote this line, e.g. "01-components". */
  readonly source: string;
  readonly message: string;
}
