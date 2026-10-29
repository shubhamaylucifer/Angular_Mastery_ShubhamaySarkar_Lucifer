/**
 * ============================================================================
 * FILE: styling-animations-demo.component.ts   (MODULE 13 - Styling & Animations)
 * ============================================================================
 * WHAT IS THIS?
 *   Part 1 - Special CSS selectors that only exist in Angular component styles:
 *       :host                 styles the component's OWN outer element
 *       :host(.active)        ...only when that element has the class "active"
 *       :host-context(.dark)  ...only when ANY ancestor has class "dark"
 *       var(--my-color)       CSS custom properties pierce encapsulation
 *   Part 2 - @angular/animations: trigger / state / style / transition /
 *            animate, :enter / :leave, and stagger for lists.
 *
 * REAL-WORLD ANALOGY:
 *   :host is the front door of a house (the house's own wall). :host-context is
 *   looking at the neighbourhood ("is it a dark-theme street?"). A CSS variable
 *   is a wall-socket: the house is closed, but whoever lives outside can still
 *   plug in a colour.
 *
 * WHY DO WE NEED IT?
 *   Component styles are private by default (View Encapsulation, Module 01).
 *   These tools let a component style ITSELF and accept theming safely.
 *   Animations make state changes understandable instead of "teleporting".
 *
 * COMMON BEGINNER MISTAKE:
 *   Forgetting that an animation needs a CHANGE of state: a `transition`
 *   only fires when the trigger value goes from one state to another.
 *   Also: @angular/animations needs `provideAnimationsAsync()` (app.config.ts).
 * ============================================================================
 */
import { animate, query, stagger, state, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { LogService } from '../../core/services/log.service';

const SRC = '13-enterprise';

/**
 * A tiny "themed chip". Its styles use :host, :host(.active) and
 * :host-context(.dark-theme). The colour comes from the CSS variable
 * `--chip-bg`, which the PARENT can set from outside.
 */
@Component({
  selector: 'app-chip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  styles: `
    /* :host = the <app-chip> element itself (a custom element is inline by default) */
    :host {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 999px;
      border: 2px solid transparent;
      background: var(--chip-bg, #e6edfd);   /* variable with a fallback colour */
      color: #1c2333;
    }
    /* Only when the host element has class="active" */
    :host(.active) { border-color: #3b6fe0; font-weight: 700; }
    /* Only when some ancestor (anywhere above) has class="dark-theme" */
    :host-context(.dark-theme) { color: #fff; background: var(--chip-bg-dark, #394264); }
  `,
})
export class ChipComponent {}

@Component({
  selector: 'app-styling-animations-demo',
  imports: [ChipComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    // ---- 1. STATE animation: collapsed <-> expanded -------------------------
    trigger('panel', [
      // state(): the final look for each named state.
      state('collapsed', style({ height: '0px', opacity: 0, padding: '0 .7rem' })),
      state('expanded', style({ height: '*', opacity: 1, padding: '.5rem .7rem' })),
      // transition(): HOW to move between states (duration + easing).
      transition('collapsed <=> expanded', animate('300ms ease-in-out')),
    ]),

    // ---- 2. ENTER / LEAVE animation for @if / @for items --------------------
    trigger('fadeSlide', [
      // ':enter' is shorthand for 'void => *' (element is added to the DOM)
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-20px)' }),
        animate('250ms ease-out', style({ opacity: 1, transform: 'none' })),
      ]),
      // ':leave' is shorthand for '* => void' (element is being removed)
      transition(':leave', [animate('200ms ease-in', style({ opacity: 0, transform: 'translateX(20px)' }))]),
    ]),

    // ---- 3. STAGGER: animate a list one item after another ------------------
    trigger('listStagger', [
      transition('* => *', [
        // query(':enter') finds newly added children; stagger() delays each one.
        query(':enter', [style({ opacity: 0, transform: 'translateY(10px)' }), stagger(80, [animate('300ms ease-out', style({ opacity: 1, transform: 'none' }))])], { optional: true }),
      ]),
    ]),
  ],
  template: `
    <section class="card">
      <h2>A. :host, :host(.active), :host-context and CSS variables</h2>
      <div class="row">
        <app-chip>plain :host</app-chip>
        <app-chip class="active">:host(.active)</app-chip>
        <app-chip [class.active]="active()" style="--chip-bg: #ffe3e3">CSS var from outside</app-chip>
      </div>
      <div class="row" style="margin-top:.5rem">
        <button class="btn" type="button" (click)="toggleActive()">Toggle .active on the 3rd chip</button>
        <button class="btn" type="button" (click)="toggleDark()">Toggle .dark-theme ancestor</button>
      </div>
      <div class="dark-zone" [class.dark-theme]="dark()">
        <app-chip>I react to :host-context(.dark-theme)</app-chip>
        <span class="muted"> &larr; wrapper class "dark-theme" is {{ dark() ? 'ON' : 'OFF' }}</span>
      </div>
    </section>

    <section class="card">
      <h2>B. Animations</h2>

      <h3>State transition (collapsed &harr; expanded)</h3>
      <button class="btn" type="button" (click)="togglePanel()">{{ panelState() === 'expanded' ? 'Collapse' : 'Expand' }}</button>
      <div class="panel" [@panel]="panelState()">This panel animates its height and opacity between two named states.</div>

      <h3>:enter / :leave</h3>
      <div class="row">
        <button class="btn" type="button" (click)="addItem()">Add</button>
        <button class="btn" type="button" (click)="removeItem()">Remove last</button>
      </div>
      <ul class="plain">
        @for (i of items(); track i) {
          <li @fadeSlide class="item">Item #{{ i }}</li>
        }
      </ul>

      <h3>stagger</h3>
      <button class="btn" type="button" (click)="replay()">Replay stagger</button>
      <ul class="plain" [@listStagger]="staggerRun()">
        @for (n of staggerItems(); track n) {
          <li class="item">Staggered row {{ n }}</li>
        }
      </ul>
    </section>
  `,
  styles: `
    .dark-zone { margin-top: .6rem; padding: .6rem; border-radius: 8px; background: #f0f2f8; }
    .dark-zone.dark-theme { background: #1c2333; color: #fff; }
    .panel { overflow: hidden; background: #e6edfd; border-radius: 6px; margin-top: .4rem; }
    .item { background: #f0f2f8; margin: 3px 0; padding: 4px 10px; border-radius: 6px; }
  `,
})
export class StylingAnimationsDemoComponent {
  private readonly log = inject(LogService);

  protected readonly active = signal(false);
  protected readonly dark = signal(false);
  protected readonly panelState = signal<'collapsed' | 'expanded'>('expanded');
  protected readonly items = signal<readonly number[]>([1, 2]);
  protected readonly staggerItems = signal<readonly number[]>([1, 2, 3, 4, 5]);
  /** Changing this number forces the `* => *` stagger transition to run again. */
  protected readonly staggerRun = signal(0);

  private counter = 2;

  protected toggleActive(): void {
    this.active.update((v) => !v);
    this.log.info(SRC, `:host(.active) is now ${this.active() ? 'applied' : 'removed'}`);
  }

  protected toggleDark(): void {
    this.dark.update((v) => !v);
    this.log.info(SRC, `:host-context(.dark-theme) -> ancestor class is ${this.dark() ? 'ON' : 'OFF'}`);
  }

  protected togglePanel(): void {
    this.panelState.update((s) => (s === 'expanded' ? 'collapsed' : 'expanded'));
    this.log.info(SRC, `animation trigger 'panel' -> ${this.panelState()}`);
  }

  protected addItem(): void {
    this.items.update((l) => [...l, ++this.counter]);
    this.log.info(SRC, ':enter animation played for the new item');
  }

  protected removeItem(): void {
    this.items.update((l) => l.slice(0, -1));
    this.log.info(SRC, ':leave animation played for the removed item');
  }

  protected replay(): void {
    // Empty the list, then refill it: the new <li> elements trigger ':enter' again.
    this.staggerItems.set([]);
    this.staggerRun.update((n) => n + 1);
    setTimeout(() => {
      this.staggerItems.set([1, 2, 3, 4, 5]);
      this.staggerRun.update((n) => n + 1);
      this.log.info(SRC, 'stagger(80ms): each row starts 80ms after the previous one');
    }, 50);
  }
}
