/**
 * ============================================================================
 * FILE: cart.store.ts   (Signal Store - global state without libraries)
 * ============================================================================
 * WHAT IS THIS?
 *   A "store" is ONE service that owns a piece of app state (here: a shopping
 *   cart) and exposes (a) read-only signals and (b) methods that change it.
 *
 * REAL-WORLD ANALOGY:
 *   A bank vault with a teller window. You can LOOK at your balance (signals)
 *   and ask the teller to deposit/withdraw (methods) - but you can't reach
 *   into the vault yourself.
 *
 * WHY DO WE NEED IT?
 *   Several components (header cart icon, product list, checkout) need the same
 *   data. Passing it through inputs/outputs across the tree becomes a mess.
 *
 * COMMON BEGINNER MISTAKE:
 *   Exposing the writable signal. Anyone could then break the rules (negative
 *   quantity). Expose `.asReadonly()` and keep mutation inside methods.
 * ============================================================================
 */
import { Injectable, computed, inject, signal } from '@angular/core';
import { CartItem, Product } from '../../models/user.model';
import { LogService } from './log.service';

@Injectable({ providedIn: 'root' })
export class CartStore {
  private readonly log = inject(LogService);

  // ---- STATE (private, writable) ----
  private readonly _items = signal<readonly CartItem[]>([]);

  // ---- SELECTORS (public, read-only, derived with computed) ----
  readonly items = this._items.asReadonly();
  readonly itemCount = computed(() => this._items().reduce((n, i) => n + i.quantity, 0));
  readonly total = computed(() => this._items().reduce((sum, i) => sum + i.product.price * i.quantity, 0));
  readonly isEmpty = computed(() => this._items().length === 0);

  // ---- ACTIONS (the only way to change state) ----
  add(product: Product): void {
    this._items.update((items) => {
      const existing = items.find((i) => i.product.id === product.id);
      return existing
        ? items.map((i) => (i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i))
        : [...items, { product, quantity: 1 }];
    });
    this.log.info('02-signals', `CartStore.add(${product.name})`);
  }

  remove(productId: number): void {
    this._items.update((items) => items.filter((i) => i.product.id !== productId));
  }

  clear(): void {
    this._items.set([]);
    this.log.warn('02-signals', 'CartStore.clear()');
  }
}
