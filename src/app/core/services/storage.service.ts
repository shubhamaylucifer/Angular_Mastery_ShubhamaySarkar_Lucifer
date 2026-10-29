/**
 * ============================================================================
 * FILE: storage.service.ts
 * ============================================================================
 * WHAT IS THIS?
 *   A type-safe wrapper around localStorage / sessionStorage that gives you a
 *   WRITABLE SIGNAL. Change the signal -> it is saved automatically. Change the
 *   value in another browser tab -> the signal updates too.
 *
 * REAL-WORLD ANALOGY:
 *   A whiteboard that is photographed after every edit (auto-save) and that
 *   refreshes itself whenever a colleague edits the photo copy in another room.
 *
 * WHY DO WE NEED IT?
 *   - Raw `localStorage.getItem()` returns `string | null`, forces JSON.parse
 *     everywhere and CRASHES on the server (SSR, Module 11).
 *   - A signal lets templates update instantly with zero manual wiring.
 *
 * COMMON BEGINNER MISTAKE:
 *   Calling `JSON.parse` on corrupted data without try/catch -> whole app
 *   crashes on start. We catch and fall back to the default value.
 * ============================================================================
 */
import { isPlatformBrowser } from '@angular/common';
import { DestroyRef, Injectable, PLATFORM_ID, WritableSignal, effect, inject, signal } from '@angular/core';
import { AppStorageSchema } from '../../models/storage.model';

/** Which browser storage to use. local = survives restarts, session = dies with the tab. */
export type StorageKind = 'local' | 'session';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /**
   * Returns a signal that is kept in sync with browser storage.
   *
   * `K extends keyof AppStorageSchema` means: the key MUST be one of the keys
   * in the schema, and the fallback / signal type is that key's value type.
   *
   * IMPORTANT: call this from an INJECTION CONTEXT (a field initialiser or the
   * constructor of a component/service). `effect()` and `inject(DestroyRef)`
   * need it, and they tie the auto-save + listener to that component's life,
   * so nothing leaks when the component is destroyed.
   */
  persistentSignal<K extends keyof AppStorageSchema>(
    key: K,
    fallback: AppStorageSchema[K],
    kind: StorageKind = 'local',
  ): WritableSignal<AppStorageSchema[K]> {
    // On the server there is no storage: hand back a normal in-memory signal.
    if (!this.isBrowser) {
      return signal(fallback);
    }
    const storage = kind === 'local' ? localStorage : sessionStorage;
    const state = signal<AppStorageSchema[K]>(this.read(storage, key, fallback));

    // effect(): runs now and again whenever `state` changes -> auto-save.
    effect(() => storage.setItem(key, JSON.stringify(state())));

    // The "storage" event fires in OTHER tabs when this key changes (cross-tab sync).
    const onStorage = (e: StorageEvent): void => {
      if (e.storageArea === storage && e.key === key) {
        state.set(e.newValue === null ? fallback : this.parse(e.newValue, fallback));
      }
    };
    window.addEventListener('storage', onStorage);
    inject(DestroyRef).onDestroy(() => window.removeEventListener('storage', onStorage));

    return state;
  }

  /** Delete one key (browser only). */
  remove(key: keyof AppStorageSchema, kind: StorageKind = 'local'): void {
    if (this.isBrowser) {
      (kind === 'local' ? localStorage : sessionStorage).removeItem(key);
    }
  }

  private read<K extends keyof AppStorageSchema>(storage: Storage, key: K, fallback: AppStorageSchema[K]): AppStorageSchema[K] {
    const raw = storage.getItem(key);
    return raw === null ? fallback : this.parse(raw, fallback);
  }

  private parse<T>(raw: string, fallback: T): T {
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback; // corrupted text -> use the default instead of crashing
    }
  }
}
