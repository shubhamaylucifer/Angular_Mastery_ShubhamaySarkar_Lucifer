/**
 * ============================================================================
 * FILE: communication-demo.component.ts  (Module 01 - parent <-> child)
 * ============================================================================
 * WHAT IS THIS?
 *   A parent and several small child components showing every modern way to
 *   talk between components:
 *     input(), input.required(), input() with alias+transform,
 *     output(), outputFromObservable(), model() (two-way),
 *     viewChild()/viewChildren()/contentChild()/contentChildren(),
 *     classic @ViewChild, content projection (single, multi-slot, ngProjectAs).
 *
 * REAL-WORLD ANALOGY:
 *   Parent = a manager, child = an employee. `input` = a task handed DOWN,
 *   `output` = a report sent UP, `model` = a shared whiteboard both can edit.
 *
 * WHY DO WE NEED IT?
 *   Real screens are trees of components. Data flows down via inputs, events
 *   flow up via outputs - this keeps the app predictable.
 *
 * COMMON BEGINNER MISTAKE:
 *   Mutating an input value inside the child. Inputs are read-only signals; to
 *   change parent data use output() or model().
 * ============================================================================
 */
import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  ViewChild,
  booleanAttribute,
  computed,
  contentChild,
  contentChildren,
  Directive,
  inject,
  input,
  model,
  numberAttribute,
  output,
  signal,
  viewChild,
  viewChildren,
  afterNextRender,
} from '@angular/core';
import { outputFromObservable } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { LogService } from '../../core/services/log.service';

const SRC = '01-components';

/* ------------------------------------------------------------------ */
/* CHILD 1: input / input.required / alias / transform / output / model */
/* ------------------------------------------------------------------ */
@Component({
  selector: 'app-counter-child',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="box stack">
      <div><strong>{{ label() }}</strong> (step {{ step() }}, disabled: {{ isDisabled() }})</div>
      <div class="row">
        <button class="btn" type="button" [disabled]="isDisabled()" (click)="inc()">+ step</button>
        <button class="btn" type="button" (click)="reported.emit('child clicked at ' + count())">output() -> parent</button>
        <button class="btn" type="button" (click)="ping.next()">outputFromObservable -> parent</button>
      </div>
      <div>model() value: <strong>{{ count() }}</strong></div>
    </div>
  `,
})
export class CounterChildComponent {
  /** REQUIRED input: parent MUST bind it or the build fails. */
  readonly label = input.required<string>();

  /** OPTIONAL input with a default and a TRANSFORM: "5" (string attr) -> 5 (number). */
  readonly step = input(1, { transform: numberAttribute });

  /**
   * ALIAS: inside the class it is `isDisabled`, in the parent template it is
   * written `[locked]="..."`. `booleanAttribute` lets you write just `locked`.
   */
  readonly isDisabled = input(false, { alias: 'locked', transform: booleanAttribute });

  /** output(): a typed event emitter. Parent listens with (reported)="...". */
  readonly reported = output<string>();

  /** outputFromObservable(): turn any RxJS Subject/Observable into an output. */
  private readonly pingSubject = new Subject<void>();
  protected readonly ping = this.pingSubject;
  readonly pinged = outputFromObservable(this.pingSubject);

  /**
   * model(): a WRITABLE input. Parent can use [(count)]="x" (two-way binding)
   * and the child can call count.set(...) to push the change back up.
   */
  readonly count = model(0);

  protected inc(): void { this.count.update((c) => c + this.step()); }
}

/* ------------------------------------------------------------------ */
/* Content projection: single slot, multi slot, ngProjectAs            */
/* ------------------------------------------------------------------ */
@Component({
  selector: 'app-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="box">
      <header><strong><ng-content select="[card-title]" /></strong></header>
      <!-- default slot: everything NOT matched by another select -->
      <div class="body"><ng-content /></div>
      <footer class="muted"><ng-content select="[card-footer]" /></footer>
    </div>
  `,
})
export class CardComponent {}

/** A marker directive so contentChild()/contentChildren() have something to find. */
@Directive({ selector: '[appTab]' })
export class TabDirective {
  readonly appTab = input.required<string>();
}

/* ------------------------------------------------------------------ */
/* Tabs container: contentChildren + contentChild                      */
/* ------------------------------------------------------------------ */
@Component({
  selector: 'app-tabs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="box">
      <strong>contentChildren found {{ tabs().length }} tabs:</strong>
      {{ titles() }}
      <br />
      contentChild (first tab): {{ firstTab()?.appTab() ?? 'none' }}
      <ng-content />
    </div>
  `,
})
export class TabsComponent {
  /** contentChildren(): signal array of every matching element PROJECTED inside me. */
  readonly tabs = contentChildren(TabDirective);
  /** contentChild(): signal of the FIRST match (undefined if none). */
  readonly firstTab = contentChild(TabDirective);
  protected readonly titles = computed(() => this.tabs().map((t) => t.appTab()).join(', '));
}

/* ------------------------------------------------------------------ */
/* The demo parent                                                     */
/* ------------------------------------------------------------------ */
@Component({
  selector: 'app-communication-demo',
  imports: [CounterChildComponent, CardComponent, TabsComponent, TabDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid-2">
      <div class="stack">
        <h3>Inputs / outputs / model</h3>
        <!--
          label="..."      -> required input (static string)
          step="5"         -> transform converts the string "5" to the number 5
          locked           -> alias + booleanAttribute: presence = true
          (reported)       -> output()
          (pinged)         -> outputFromObservable()
          [(count)]        -> model() two-way binding (banana in a box)
        -->
        <app-counter-child #c1 label="Counter A" step="5" [locked]="lock()" [(count)]="total"
          (reported)="onReport($event)" (pinged)="onPing()" />
        <div class="row">
          <label><input type="checkbox" [checked]="lock()" (change)="lock.set(!lock())" /> lock child</label>
          <span>Parent sees total = <strong>{{ total() }}</strong></span>
          <button class="btn" type="button" (click)="total.set(0)">Reset from parent</button>
        </div>
      </div>

      <div class="stack">
        <h3>Content projection</h3>
        <app-card>
          <!-- matches select="[card-title]" -->
          <span card-title>Multi-slot card</span>
          This text goes to the default slot.
          <!-- matches select="[card-footer]" -->
          <span card-footer>Footer slot</span>
        </app-card>

        <app-card>
          <!--
            ngProjectAs: this <div> pretends to carry the [card-footer] attribute, so
            it lands in the footer slot even though its tag is different.
          -->
          <span card-title>ngProjectAs card</span>
          <div ngProjectAs="[card-footer]">I am a div projected as footer</div>
        </app-card>

        <app-tabs>
          <span appTab="Overview">Overview</span>
          <span appTab="Details">Details</span>
        </app-tabs>
      </div>
    </div>

    <h3>View queries</h3>
    <div class="row">
      <input #nameInput placeholder="signal viewChild() target" aria-label="query target" />
      <button class="btn" type="button" (click)="focusInput()">viewChild(): focus input</button>
      <button class="btn" type="button" (click)="countRows()">viewChildren(): count rows</button>
      <button class="btn" type="button" (click)="classicQuery()">classic @ViewChild</button>
    </div>
    <ul class="plain">
      @for (r of rows; track r) { <li #row class="muted">row {{ r }}</li> }
    </ul>
  `,
})
export class CommunicationDemoComponent {
  private readonly log = inject(LogService);

  protected readonly total = signal(0);
  protected readonly lock = signal(false);

  /** viewChild('templateRefName'): signal pointing at an element in MY template. */
  private readonly nameInput = viewChild<ElementRef<HTMLInputElement>>('nameInput');
  /** viewChildren: all elements with the template ref `#row`. */
  private readonly rowEls = viewChildren<ElementRef<HTMLLIElement>>('row');
  /** viewChild by component type. */
  private readonly counter = viewChild(CounterChildComponent);

  /** Classic decorator version (older code bases). `static: false` = available after view init. */
  @ViewChild('nameInput') private classicInput?: ElementRef<HTMLInputElement>;

  protected readonly rows = [1, 2, 3];

  constructor() {
    // Queries are only filled after the view exists -> use afterNextRender.
    afterNextRender(() => this.log.info(SRC, `queries ready: counter child found = ${!!this.counter()}`));
  }

  protected onReport(msg: string): void { this.log.info(SRC, `output() received: "${msg}"`); }
  protected onPing(): void { this.log.info(SRC, 'outputFromObservable() received a ping'); }
  protected focusInput(): void { this.nameInput()?.nativeElement.focus(); this.log.info(SRC, 'viewChild(): focused the input'); }
  protected countRows(): void { this.log.info(SRC, `viewChildren(): ${this.rowEls().length} <li> elements`); }
  protected classicQuery(): void { this.log.info(SRC, `@ViewChild: input placeholder = "${this.classicInput?.nativeElement.placeholder}"`); }
}
