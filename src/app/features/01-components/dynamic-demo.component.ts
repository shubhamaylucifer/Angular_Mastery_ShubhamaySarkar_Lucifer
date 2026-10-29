/**
 * ============================================================================
 * FILE: dynamic-demo.component.ts   (Module 01 - dynamic components)
 * ============================================================================
 * WHAT IS THIS?
 *   Creating components at RUNTIME (not written in the template):
 *    1. ViewContainerRef.createComponent() + setInput()  (imperative)
 *    2. *ngComponentOutlet                                (declarative)
 *
 * REAL-WORLD ANALOGY:
 *   A vending machine: you pick a product (component class) and the machine
 *   drops it into the slot (container) when you press the button.
 *
 * WHY DO WE NEED IT?
 *   Dashboards/widgets/modals whose type is only known at runtime (from config
 *   or user choice) can't be hard-coded in HTML.
 *
 * COMMON BEGINNER MISTAKE:
 *   Forgetting to destroy dynamically created components (`ref.destroy()`),
 *   which leaks memory because Angular does not own their lifetime for you
 *   when you create them by hand.
 * ============================================================================
 */
import {
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  Type,
  ViewContainerRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { LogService } from '../../core/services/log.service';

const SRC = '01-components';

@Component({
  selector: 'app-widget-a',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="box">Widget A says: <strong>{{ message() }}</strong></div>`,
})
export class WidgetAComponent {
  readonly message = input('(none)');
}

@Component({
  selector: 'app-widget-b',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="box" style="background:#fff3d9">Widget B says: <strong>{{ message() }}</strong></div>`,
})
export class WidgetBComponent {
  readonly message = input('(none)');
}

@Component({
  selector: 'app-dynamic-demo',
  imports: [NgComponentOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid-2">
      <div class="stack">
        <h3>1. ViewContainerRef.createComponent()</h3>
        <div class="row">
          <button class="btn" type="button" (click)="addA()">Add A</button>
          <button class="btn" type="button" (click)="addB()">Add B</button>
          <button class="btn" type="button" (click)="updateAll()">setInput() on all</button>
          <button class="btn" type="button" (click)="removeAll()">Destroy all</button>
        </div>
        <!--
          ng-container is an invisible anchor. Components created by the
          ViewContainerRef are inserted as SIBLINGS right after it.
        -->
        <ng-container #host />
      </div>

      <div class="stack">
        <h3>2. *ngComponentOutlet</h3>
        <div class="row">
          <button class="btn" type="button" (click)="pick(widgetA)">Show A</button>
          <button class="btn" type="button" (click)="pick(widgetB)">Show B</button>
        </div>
        <!-- Declarative: Angular renders whichever class the signal holds. -->
        <ng-container *ngComponentOutlet="current(); inputs: { message: 'via ngComponentOutlet' }" />
      </div>
    </div>
  `,
})
export class DynamicDemoComponent {
  private readonly log = inject(LogService);

  /** `{ read: ViewContainerRef }` asks the query for the container, not an element. */
  private readonly host = viewChild('host', { read: ViewContainerRef });
  private readonly refs: ComponentRef<WidgetAComponent | WidgetBComponent>[] = [];

  protected readonly widgetA = WidgetAComponent;
  protected readonly widgetB = WidgetBComponent;
  protected readonly current = signal<Type<unknown>>(WidgetAComponent);
  private counter = 0;

  protected addA(): void { this.add(WidgetAComponent); }
  protected addB(): void { this.add(WidgetBComponent); }

  private add(type: Type<WidgetAComponent | WidgetBComponent>): void {
    const ref = this.host()?.createComponent(type);
    if (!ref) return;
    // setInput is the only supported way to feed signal inputs of a dynamic component.
    ref.setInput('message', `created #${++this.counter}`);
    this.refs.push(ref);
    this.log.info(SRC, `createComponent(${type.name}) -> ${this.refs.length} dynamic widgets alive`);
  }
  protected updateAll(): void {
    this.refs.forEach((r) => r.setInput('message', `updated @ ${new Date().toLocaleTimeString()}`));
    this.log.info(SRC, 'setInput() pushed a new value into every dynamic widget');
  }
  protected removeAll(): void {
    this.refs.forEach((r) => r.destroy());
    this.refs.length = 0;
    this.log.warn(SRC, 'ComponentRef.destroy() called for all dynamic widgets');
  }
  protected pick(t: Type<unknown>): void {
    this.current.set(t);
    this.log.info(SRC, `ngComponentOutlet now renders ${t.name}`);
  }
}
