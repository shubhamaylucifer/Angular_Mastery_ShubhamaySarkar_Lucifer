/**
 * ============================================================================
 * FILE: storage.model.ts
 * ============================================================================
 * WHAT IS THIS?
 *   One interface that lists EVERY key we are allowed to put into
 *   localStorage / sessionStorage and the exact type of each value.
 *
 * REAL-WORLD ANALOGY:
 *   A labelled drawer cabinet. Drawer "theme" only accepts "light" or "dark";
 *   you cannot drop a banana in it.
 *
 * WHY DO WE NEED IT?
 *   Browser storage only stores TEXT. Without a schema, one file saves a number
 *   and another reads it as an object. The schema makes TypeScript catch typos
 *   such as `storage.get('them')`.
 *
 * COMMON BEGINNER MISTAKE:
 *   Storing secrets (tokens, passwords) in localStorage. Any script on the page
 *   can read it. Use HttpOnly cookies for auth tokens in real apps.
 * ============================================================================
 */
export interface AppStorageSchema {
  readonly theme: 'light' | 'dark';
  readonly visits: number;
  readonly nickname: string;
}
