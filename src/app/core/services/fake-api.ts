/**
 * ============================================================================
 * FILE: fake-api.ts
 * ============================================================================
 * WHAT IS THIS?
 *   A pretend back-end: functions that "take time" and then return data, so
 *   demos work OFFLINE and deterministically.
 *
 * REAL-WORLD ANALOGY:
 *   A flight simulator - behaves like the real thing, nobody gets hurt.
 *
 * WHY DO WE NEED IT?
 *   resource(), race-condition and cancellation demos need slow, cancellable,
 *   sometimes-failing work.
 *
 * COMMON BEGINNER MISTAKE:
 *   Ignoring the AbortSignal. A cancelled request must STOP (clear timers /
 *   reject), otherwise "cancelled" work keeps running in the background.
 * ============================================================================
 */
import { Observable } from 'rxjs';

export interface FakeUser { readonly id: number; readonly name: string; readonly city: string; }

const CITIES = ['Pune', 'Delhi', 'Berlin', 'Austin', 'Tokyo'];

/** Promise flavour (used by `resource()`): honours an AbortSignal. */
export function fetchFakeUser(id: number, signal: AbortSignal, delayMs = 700): Promise<FakeUser> {
  return new Promise<FakeUser>((resolve, reject) => {
    const timer = setTimeout(() => {
      if (id % 13 === 0) {
        reject(new Error(`Server error: user ${id} is cursed (ids divisible by 13 fail)`));
      } else {
        resolve({ id, name: `User ${id}`, city: CITIES[id % CITIES.length] ?? 'Unknown' });
      }
    }, delayMs);
    // If the caller aborts, stop the timer and reject like fetch() does.
    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });
}

/** Observable flavour (used by `rxResource()` / RxJS demos). Unsubscribe = cancel. */
export function fakeUser$(id: number, delayMs = 700): Observable<FakeUser> {
  return new Observable<FakeUser>((subscriber) => {
    const timer = setTimeout(() => {
      if (id % 13 === 0) {
        subscriber.error(new Error(`Server error: user ${id} is cursed`));
      } else {
        subscriber.next({ id, name: `User ${id}`, city: CITIES[id % CITIES.length] ?? 'Unknown' });
        subscriber.complete();
      }
    }, delayMs);
    // The function returned here is the TEARDOWN: runs on unsubscribe/complete/error.
    return () => clearTimeout(timer);
  });
}
