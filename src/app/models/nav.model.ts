/**
 * ============================================================================
 * FILE: nav.model.ts
 * ============================================================================
 * WHAT IS THIS?
 *   Types describing one item of the sidebar menu and its difficulty level.
 *
 * REAL-WORLD ANALOGY:
 *   A restaurant menu entry: name, price tier (difficulty) and a short blurb.
 *
 * WHY DO WE NEED IT?
 *   The sidebar, breadcrumb and router all read the SAME list, so they can
 *   never disagree about titles or order.
 *
 * COMMON BEGINNER MISTAKE:
 *   Copy-pasting the same title string in 3 places. Keep one source of truth.
 * ============================================================================
 */

/** A "union type": the value can only be one of these exact strings. */
export type Level = 'Beginner' | 'Intermediate' | 'Advanced';

export interface NavItem {
  /** URL segment, e.g. "01-components" -> http://localhost:4200/01-components */
  readonly path: string;
  readonly title: string;
  readonly level: Level;
  readonly summary: string;
}
