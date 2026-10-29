/**
 * ============================================================================
 * FILE: pipes.ts   (shared custom pipes)
 * ============================================================================
 * WHAT IS THIS?
 *   Two custom pipes that do the SAME job (filter a list by text), one PURE and
 *   one IMPURE, so you can measure the cost difference.
 *
 * REAL-WORLD ANALOGY:
 *   A pipe is a filter on a tap: water (data) goes in, filtered water comes
 *   out. A PURE pipe is a lazy worker - re-does the job only if you hand it
 *   different input. An IMPURE pipe is an anxious worker re-doing the job
 *   every single time anything on the screen changes.
 *
 * WHY DO WE NEED IT?
 *   Formatting for display ("1,234.50", "3 days ago") belongs in the template,
 *   not in component code that runs everywhere.
 *
 * COMMON BEGINNER MISTAKE:
 *   Marking a pipe `pure: false` to "make it update" after you mutated an array
 *   with push(). Instead create a NEW array (immutability) and keep the pipe pure.
 * ============================================================================
 */
import { Pipe, PipeTransform } from '@angular/core';

/** Global counters so the UI can display how many times each pipe really ran. */
export const pipeCalls = { pure: 0, impure: 0 };

/** PURE (default): runs only when the INPUT REFERENCES change. */
@Pipe({ name: 'filterBy' })
export class FilterByPipe implements PipeTransform {
  transform(items: readonly string[], term: string): string[] {
    pipeCalls.pure++;
    return items.filter((i) => i.toLowerCase().includes(term.toLowerCase()));
  }
}

/** IMPURE: runs on EVERY change-detection pass. Expensive! Use rarely. */
@Pipe({ name: 'filterByImpure', pure: false })
export class FilterByImpurePipe implements PipeTransform {
  transform(items: readonly string[], term: string): string[] {
    pipeCalls.impure++;
    return items.filter((i) => i.toLowerCase().includes(term.toLowerCase()));
  }
}

/** A simple formatting pipe: 1234567 -> "1.2M". */
@Pipe({ name: 'compact' })
export class CompactNumberPipe implements PipeTransform {
  transform(value: number): string {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
    return String(value);
  }
}
