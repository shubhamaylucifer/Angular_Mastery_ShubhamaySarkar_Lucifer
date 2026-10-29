/**
 * ============================================================================
 * FILE: auth.service.ts
 * ============================================================================
 * WHAT IS THIS?
 *   A fake login system. It remembers WHO is logged in (user + role + JWT-like
 *   token) using signals. There is no real server: clicking "Login" just
 *   pretends to authenticate.
 *
 * REAL-WORLD ANALOGY:
 *   The wristband you get at a festival entrance. Guards (guards/interceptors)
 *   look at the wristband to decide what you may enter.
 *
 * WHY DO WE NEED IT?
 *   Route guards, the auth HTTP interceptor and the `*appHasRole` directive all
 *   need to answer the same question: "who is the current user?". One shared
 *   service = one answer everywhere.
 *
 * COMMON BEGINNER MISTAKE:
 *   Believing front-end checks are real security. Anyone can edit JS in their
 *   browser. Guards only improve UX - the SERVER must enforce permissions.
 * ============================================================================
 */
import { Injectable, computed, inject, signal } from '@angular/core';
import { User, UserRole } from '../../models/user.model';
import { LogService } from './log.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  /** `inject()` asks Angular for a service - works in field initialisers. */
  private readonly log = inject(LogService);

  private readonly _user = signal<User | null>(null);
  private readonly _token = signal<string | null>(null);

  readonly user = this._user.asReadonly();
  readonly token = this._token.asReadonly();
  /** `!!x` turns any value into true/false. */
  readonly isLoggedIn = computed(() => !!this._user());
  readonly role = computed<UserRole>(() => this._user()?.role ?? 'GUEST');

  login(role: UserRole): void {
    const user: User = { id: 1, name: `Demo ${role.toLowerCase()}`, email: 'demo@example.com', role };
    this._user.set(user);
    this._token.set(`fake.jwt.${role}`);
    this.log.success('auth', `Logged in as ${user.name} (${role})`);
  }

  logout(): void {
    this._user.set(null);
    this._token.set(null);
    this.log.warn('auth', 'Logged out');
  }
}
