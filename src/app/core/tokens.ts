/**
 * ============================================================================
 * FILE: tokens.ts
 * ============================================================================
 * WHAT IS THIS?
 *   `InjectionToken`s: custom "names" for things that are NOT classes (a string
 *   URL, a config object) so Angular's Dependency Injection can hand them out.
 *
 * REAL-WORLD ANALOGY:
 *   Labelled lockers. Interfaces vanish at runtime, so a locker needs a real
 *   physical label (the token) to find the item inside.
 *
 * WHY DO WE NEED IT?
 *   `inject(string)` is impossible - there is nothing unique to look up.
 *
 * COMMON BEGINNER MISTAKE:
 *   Forgetting to provide the token (`{ provide: API_URL, useValue: ... }`).
 *   Then you get "No provider for InjectionToken API_URL".
 * ============================================================================
 */
import { InjectionToken } from '@angular/core';
import { environment } from '../../environments/environment';

/** Base address of our REST API. Default value comes from the environment file. */
export const API_URL = new InjectionToken<string>('API_URL', {
  providedIn: 'root',
  factory: () => environment.apiUrl,
});
