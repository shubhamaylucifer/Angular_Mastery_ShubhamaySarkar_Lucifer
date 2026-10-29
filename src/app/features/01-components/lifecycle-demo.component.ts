/**
 * ============================================================================
 * FILE: lifecycle-demo.component.ts   (Module 01 - component lifecycle)
 * ============================================================================
 * WHAT IS THIS?
 *   A child component that implements EVERY lifecycle hook and writes a line to
 *   the on-screen log each time Angular calls one. The parent can change its
 *   input, projected content, or destroy it, so you can watch the sequence.
 *
 * REAL-WORLD ANALOGY:
 *   The life of a theatre actor: called to the stage (OnInit), notified when the
 *   script changes (OnChanges), checked by the director (DoCheck), when the set
 *   behind them is ready (AfterViewInit), and finally leaving (OnDestroy).
 *
 * WHY DO WE NEED IT?
 *   Knowing WHEN code runs: fetch data in ngOnInit (not the constructor), touch
 *   child views only after AfterViewInit, clean up timers in ngOnDestroy.
 *
 * COMMON BEGINNER MISTAKE:
 *   Doing heavy work in the constructor. Inputs are not set yet at that time!
 *   Constructors should only wire up dependencies.
 * ============================================================================
 */
import {
  AfterContentChecked,
  AfterContentInit,
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DoCheck,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  afterEveryRender,
  afterNextRender,
  inject,
  input,
} from '@angular/core';
import { LogService } from '../../core/services/log.service';

const SRC = '01-components';

@Component({
  selector: 'app-lifecycle-demo',
  // OnPush + signal input: ngOnChanges/ngDoCheck still run when parent binds.
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="box">
      <strong>I am the child.</strong> My input value is <code>{{ value() }}</code>.
      <div class="muted"><ng-content /></div>
    </div>
  `,
})
export class LifecycleDemoComponent
  implements OnChanges, OnInit, DoCheck, AfterContentInit, AfterContentChecked, AfterViewInit, AfterViewChecked, OnDestroy
{
  private readonly log = inject(LogService);

  /** A signal input. (Classic `@Input()` would trigger ngOnChanges with details.) */
  readonly value = input<number>(0);

  constructor() {
    this.log.info(SRC, '0. constructor - class created. Inputs are NOT available yet.');

    // afterNextRender: runs ONCE after the next time Angular finishes painting.
    // Safe place for DOM measurements / 3rd party widgets (browser only).
    afterNextRender(() => this.log.info(SRC, 'afterNextRender - ONE-TIME callback after first paint.'));

    // afterEveryRender (the modern `afterRender`): runs after EVERY paint. Use sparingly.
    afterEveryRender(() => this.log.info(SRC, 'afterEveryRender - runs after every render pass.'));
  }

  /** Called when a classic (decorator / signal) input binding changes. */
  ngOnChanges(changes: SimpleChanges): void {
    const keys = Object.keys(changes).join(', ');
    this.log.info(SRC, `1. ngOnChanges - changed inputs: ${keys}`);
  }
  /** Called ONCE, after the first ngOnChanges. Best place for initial data loading. */
  ngOnInit(): void { this.log.success(SRC, '2. ngOnInit - initialised (inputs are ready).'); }
  /** Called on EVERY change-detection run. Keep it very cheap! */
  ngDoCheck(): void { this.log.info(SRC, '3. ngDoCheck - change detection ran.'); }
  /** Once, after projected content (<ng-content>) is initialised. */
  ngAfterContentInit(): void { this.log.info(SRC, '4. ngAfterContentInit - projected content ready.'); }
  /** After every check of projected content. */
  ngAfterContentChecked(): void { this.log.info(SRC, '5. ngAfterContentChecked'); }
  /** Once, after this component's own view + child views exist. */
  ngAfterViewInit(): void { this.log.success(SRC, '6. ngAfterViewInit - my view is ready.'); }
  /** After every check of this component's view. */
  ngAfterViewChecked(): void { this.log.info(SRC, '7. ngAfterViewChecked'); }
  /** Once, right before removal. Unsubscribe timers/listeners here. */
  ngOnDestroy(): void { this.log.warn(SRC, '8. ngOnDestroy - I am being removed. Clean up here!'); }
}
