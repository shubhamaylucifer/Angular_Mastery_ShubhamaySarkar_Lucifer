/**
 * ============================================================================
 * FILE: store-and-cd-demo.component.ts   (Module 02 - Signal Store + Change Detection)
 * ============================================================================
 * WHAT IS THIS?
 *   Part 1: two components sharing the global CartStore.
 *   Part 2: Default vs OnPush change detection, ChangeDetectorRef, and the
 *           zoneless setup used by this whole app.
 *
 * REAL-WORLD ANALOGY:
 *   CHANGE DETECTION = a building inspector. `Default` inspects every room on
 *   every event. `OnPush` inspects a room only when new furniture arrives
 *   (input changed), someone rings its bell (event) or you call the inspector
 *   (markForCheck). `Zoneless` = no inspector patrolling at all: rooms
 *   announce changes themselves (signals).
 *
 * WHY DO WE NEED IT?
 *   Checking every component on every click wastes time in big apps.
 *
 * COMMON BEGINNER MISTAKE:
 *   OnPush + mutating an object/array in place (`list.push(x)`). The reference
 *   is the same so Angular sees "no change". Create a NEW array/object, or use
 *   signals which handle this for you.
 * ============================================================================
 */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DoCheck, inject, input, signal } from '@angular/core';
import { CartStore } from '../../core/services/cart.store';
import { LogService } from '../../core/services/log.service';
import { Product } from '../../models/user.model';
import { CurrencyPipe } from '@angular/common';

const SRC = '02-signals';
const PRODUCTS: readonly Product[] = [
  { id: 1, name: 'Keyboard', price: 49.5 },
  { id: 2, name: 'Mouse', price: 19.99 },
  { id: 3, name: 'Monitor', price: 189 },
];

/** Cart badge: reads the SAME store instance as the shop below. */
@Component({
  selector: 'app-cart-badge',
  imports: [CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="box">Cart badge component: <strong>{{ cart.itemCount() }}</strong> items, total <strong>{{ cart.total() | currency }}</strong></div>`,
})
export class CartBadgeComponent {
  protected readonly cart = inject(CartStore);
}

/** A child that counts how many times Angular CHECKS it (ngDoCheck). */
@Component({
  selector: 'app-cd-child',
  changeDetection: ChangeDetectionStrategy.Default,
  template: `<div class="box">{{ label() }}: checked <strong>{{ checks }}</strong> times. Local value: {{ local }}</div>`,
})
export class CdDefaultChildComponent implements DoCheck {
  readonly label = input('Default child');
  protected checks = 0;
  protected local = 0;
  ngDoCheck(): void { this.checks++; }
}

@Component({
  selector: 'app-cd-onpush-child',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="box">{{ label() }}: checked <strong>{{ checks }}</strong> times. Plain field: {{ local }}</div>`,
})
export class CdOnPushChildComponent implements DoCheck {
  private readonly cdr = inject(ChangeDetectorRef);
  readonly label = input('OnPush child');
  protected checks = 0;
  protected local = 0;
  ngDoCheck(): void { this.checks++; }

  /** Changes a PLAIN field (not a signal). OnPush screen won't update... */
  bumpSilently(): void { this.local++; }
  /** ...until we tell Angular to re-check this component. */
  bumpAndMark(): void { this.local++; this.cdr.markForCheck(); }
}

@Component({
  selector: 'app-store-and-cd-demo',
  imports: [CartBadgeComponent, CdDefaultChildComponent, CdOnPushChildComponent, CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h3>Signal Store (CartStore)</h3>
    <div class="row">
      @for (p of products; track p.id) {
        <button class="btn" type="button" (click)="cart.add(p)">Add {{ p.name }} ({{ p.price | currency }})</button>
      }
      <button class="btn danger" type="button" (click)="cart.clear()">Clear</button>
    </div>
    <app-cart-badge />
    <ul class="plain">
      @for (i of cart.items(); track i.product.id) {
        <li>{{ i.quantity }} x {{ i.product.name }}
          <button class="btn" type="button" (click)="cart.remove(i.product.id)" [attr.aria-label]="'Remove ' + i.product.name">remove</button></li>
      } @empty { <li class="muted">Cart is empty.</li> }
    </ul>

    <h3>Change detection: Default vs OnPush vs zoneless</h3>
    <p class="muted">
      This app uses <code>provideZonelessChangeDetection()</code> (see app.config.ts): no zone.js, so Angular
      re-renders only after signal changes, template events or markForCheck(). Press the buttons and compare
      the "checked" counters.
    </p>
    <div class="row">
      <button class="btn" type="button" (click)="tick.update(t => t + 1)">Parent event (tick {{ tick() }})</button>
      <button class="btn" type="button" (click)="onPush.bumpSilently(); note('mutated plain field - OnPush child screen is stale')">Mutate OnPush field (no markForCheck)</button>
      <button class="btn" type="button" (click)="onPush.bumpAndMark(); note('markForCheck() called - screen refreshed')">Mutate + markForCheck()</button>
    </div>
    <app-cd-child label="Default child" />
    <app-cd-onpush-child #onPush label="OnPush child" />
  `,
})
export class StoreAndCdDemoComponent {
  protected readonly cart = inject(CartStore);
  private readonly log = inject(LogService);
  protected readonly products = PRODUCTS;
  protected readonly tick = signal(0);
  protected note(msg: string): void { this.log.info(SRC, msg); }
}
