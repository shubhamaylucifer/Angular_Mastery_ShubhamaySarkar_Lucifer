/**
 * ============================================================================
 * FILE: signals-demo.component.ts   (Module 02 - signal primitives)
 * ============================================================================
 * WHAT IS THIS?
 *   signal(), computed(), effect() (+ onCleanup), untracked(), custom equality
 *   and linkedSignal() in one playground.
 *
 * REAL-WORLD ANALOGY:
 *   Excel! `signal` = a cell you type into. `computed` = a formula cell
 *   (=A1*2) that auto-updates. `effect` = a macro that RUNS when cells change.
 *   `linkedSignal` = a cell that follows a formula but you may overwrite it;
 *   when the source changes, it snaps back to the formula.
 *
 * WHY DO WE NEED IT?
 *   Signals tell Angular PRECISELY which parts of the screen depend on which
 *   value, so it can update only those - fast and easy to reason about.
 *
 * COMMON BEGINNER MISTAKE:
 *   (1) Forgetting the parentheses: `count` is the signal, `count()` is the VALUE.
 *   (2) Using effect() to copy one signal into another - use computed() instead.
 * ============================================================================
 */
import { ChangeDetectionStrategy, Component, computed, effect, inject, linkedSignal, signal, untracked } from '@angular/core';
import { LogService } from '../../core/services/log.service';

const SRC = '02-signals';

@Component({
  selector: 'app-signals-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid-2">
      <div class="box stack">
        <h3>signal / computed / effect</h3>
        <p>count = <strong>{{ count() }}</strong> &nbsp; double (computed) = <strong>{{ double() }}</strong></p>
        <div class="row">
          <button class="btn" type="button" (click)="count.set(count() + 1)">set(+1)</button>
          <button class="btn" type="button" (click)="count.update(c => c * 2)">update(x2)</button>
          <button class="btn" type="button" (click)="count.set(0)">reset</button>
        </div>
        <p class="muted">The effect() below logs whenever <code>count</code> changes and registers an <code>onCleanup</code>.</p>
      </div>

      <div class="box stack">
        <h3>untracked()</h3>
        <p>a = {{ a() }}, b = {{ b() }}</p>
        <div class="row">
          <button class="btn" type="button" (click)="a.update(v => v + 1)">a++ (tracked: effect re-runs)</button>
          <button class="btn" type="button" (click)="b.update(v => v + 1)">b++ (untracked: effect ignores)</button>
        </div>
      </div>

      <div class="box stack">
        <h3>Custom equality</h3>
        <p>Object signal with <code>equal: (x,y) =&gt; x.id === y.id</code></p>
        <p>Current: {{ item().id }} / {{ item().label }}</p>
        <div class="row">
          <button class="btn" type="button" (click)="item.set({ id: 1, label: 'same id, new label' })">set same id (ignored)</button>
          <button class="btn" type="button" (click)="item.set({ id: item().id + 1, label: 'new id' })">set new id (accepted)</button>
        </div>
      </div>

      <div class="box stack">
        <h3>linkedSignal()</h3>
        <label for="fruit">Source: choose a fruit (resets the quantity)</label>
        <select id="fruit" (change)="fruit.set($any($event.target).value)">
          @for (f of fruits; track f) { <option [value]="f">{{ f }}</option> }
        </select>
        <p>Quantity of <strong>{{ fruit() }}</strong>: <strong>{{ qty() }}</strong></p>
        <div class="row">
          <button class="btn" type="button" (click)="qty.update(q => q + 1)">+1 (user override)</button>
          <span class="muted">Change the fruit: qty snaps back to 1.</span>
        </div>
      </div>
    </div>
  `,
})
export class SignalsDemoComponent {
  private readonly log = inject(LogService);

  // ---- writable signal ----
  protected readonly count = signal(1);
  // ---- computed: read-only, lazy, memoised (cached until `count` changes) ----
  protected readonly double = computed(() => this.count() * 2);

  protected readonly a = signal(0);
  protected readonly b = signal(0);

  // ---- custom equality: signal only notifies when `equal` says "different" ----
  protected readonly item = signal({ id: 1, label: 'first' }, { equal: (x, y) => x.id === y.id });

  // ---- linkedSignal: derived from `fruit`, but writable ----
  protected readonly fruits = ['Apple', 'Banana', 'Cherry'];
  protected readonly fruit = signal('Apple');
  protected readonly qty = linkedSignal<string, number>({
    source: this.fruit,
    computation: () => 1, // whenever `fruit` changes, qty resets to 1
  });

  constructor() {
    // effect(): runs once at start and again whenever a signal READ inside changes.
    // It must be created in an injection context (constructor / field initialiser).
    effect((onCleanup) => {
      const c = this.count(); // <- this read makes `count` a dependency
      this.log.info(SRC, `effect ran: count is ${c}`);
      // onCleanup: runs BEFORE the next run and when the effect is destroyed.
      onCleanup(() => this.log.info(SRC, `  cleanup of previous effect run (count was ${c})`));
    });

    effect(() => {
      const aVal = this.a(); // tracked
      const bVal = untracked(() => this.b()); // read WITHOUT making it a dependency
      this.log.info(SRC, `untracked effect: a=${aVal}, b=${bVal} (b changes never re-run me)`);
    });

    effect(() => this.log.info(SRC, `custom-equality item changed -> id ${this.item().id}`));
    effect(() => this.log.info(SRC, `linkedSignal qty = ${this.qty()} for ${this.fruit()}`));
  }
}
