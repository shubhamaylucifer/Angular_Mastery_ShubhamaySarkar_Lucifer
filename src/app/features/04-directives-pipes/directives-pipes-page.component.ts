/**
 * ============================================================================
 * FILE: directives-pipes-page.component.ts   (MODULE 04 page)
 * ============================================================================
 * WHAT IS THIS?
 *   Live demos of: attribute directives (host metadata, Renderer2), a custom
 *   structural directive, the Directive Composition API (hostDirectives) and
 *   built-in + custom pure/impure pipes.
 *
 * REAL-WORLD ANALOGY:
 *   Directives = superpower stickers. Pipes = filters/formatters on a data tap.
 *
 * WHY DO WE NEED IT?
 *   Share behaviour and formatting across the app without duplicating code.
 *
 * COMMON BEGINNER MISTAKE:
 *   Writing method calls in templates, e.g. {{ format(price) }}. They run on
 *   every change-detection pass. A (pure) pipe is cached - much cheaper.
 * ============================================================================
 */
import { AsyncPipe, CurrencyPipe, DatePipe, KeyValuePipe, UpperCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { LogService } from '../../core/services/log.service';
import { FeaturePageComponent } from '../../shared/components/feature-page.component';
import { HasRoleDirective, HighlightDirective, HoverTrackDirective, RendererTooltipDirective, RoundedDirective } from '../../shared/directives/directives';
import { CompactNumberPipe, FilterByImpurePipe, FilterByPipe, pipeCalls } from '../../shared/pipes/pipes';

const SRC = '04-directives-pipes';

/**
 * DIRECTIVE COMPOSITION API: `hostDirectives` attaches directives to a COMPONENT
 * from the inside. Users of <app-fancy-box> automatically get rounded corners and
 * hover tracking, without writing those attributes themselves.
 *  - `inputs: ['radius']` re-exposes the directive's input on the component.
 *  - `outputs: ['hoverChange']` re-exposes its output.
 */
@Component({
  selector: 'app-fancy-box',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    { directive: RoundedDirective, inputs: ['radius'] },
    { directive: HoverTrackDirective, outputs: ['hoverChange'] },
  ],
  template: `<ng-content />`,
  styles: `:host { display: block; background: #eef2ff; }`,
})
export class FancyBoxComponent {}

@Component({
  selector: 'app-directives-pipes-page',
  imports: [
    FeaturePageComponent, HighlightDirective, RendererTooltipDirective, HasRoleDirective, FancyBoxComponent,
    FilterByPipe, FilterByImpurePipe, CompactNumberPipe, AsyncPipe, CurrencyPipe, DatePipe, UpperCasePipe, KeyValuePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-feature-page
      title="04 Directives, Host Composition & Pipes"
      subtitle="Add behaviour to elements and format data in templates."
      level="Beginner"
      source="04-directives-pipes"
      [bullets]="bullets"
    >
      <section class="card">
        <h2>A. Attribute directives</h2>
        <p appHighlight="#ffd6d6">Hover me - [appHighlight] uses <code>host: {{ '{' }}...{{ '}' }}</code> metadata (no @HostListener).</p>
        <p appHighlight>Same directive, default colour.</p>
        <p>Hover the underlined word: <span [appTooltip]="'I was added by Renderer2 + ElementRef'">tooltip</span></p>
      </section>

      <section class="card">
        <h2>B. Structural directive: *appHasRole</h2>
        <p>Current role: <strong>{{ auth.role() }}</strong>. Use the header buttons to log in / out.</p>
        <p *appHasRole="'ADMIN'" class="ok">Only ADMINs see this line. (createEmbeddedView / clear)</p>
        <p *appHasRole="'EDITOR'" class="warn">Only EDITORs see this line.</p>
        <p *appHasRole="'GUEST'" class="muted">You are a GUEST (not logged in).</p>
      </section>

      <section class="card">
        <h2>C. Directive composition (hostDirectives)</h2>
        <app-fancy-box [radius]="24" (hoverChange)="onHover($event)">
          I am a component that got <code>appRounded</code> and <code>appHoverTrack</code> via hostDirectives. Hover me!
        </app-fancy-box>
      </section>

      <section class="card">
        <h2>D. Built-in pipes</h2>
        <table>
          <tbody>
            <tr><td><code>date</code></td><td>{{ now | date: 'fullDate' }}</td></tr>
            <tr><td><code>currency</code></td><td>{{ 1234.5 | currency: 'EUR' }}</td></tr>
            <tr><td><code>uppercase</code></td><td>{{ 'angular' | uppercase }}</td></tr>
            <tr><td><code>keyvalue</code></td><td>@for (kv of person | keyvalue; track kv.key) { <span class="badge">{{ kv.key }}={{ kv.value }}</span> }</td></tr>
            <tr><td><code>async</code></td><td>{{ greeting$ | async }} <span class="muted">(subscribes AND unsubscribes for you)</span></td></tr>
            <tr><td>custom <code>compact</code></td><td>{{ 1250000 | compact }}, {{ 4200 | compact }}</td></tr>
          </tbody>
        </table>
      </section>

      <section class="card">
        <h2>E. Pure vs Impure pipe</h2>
        <label for="term">Filter fruits:</label>
        <input id="term" [value]="term()" (input)="term.set($any($event.target).value)" />
        <div class="row">
          <button class="btn" type="button" (click)="tick.update(t => t + 1)">Unrelated click (tick {{ tick() }})</button>
          <button class="btn" type="button" (click)="report()">Show call counts</button>
        </div>
        <div class="grid-2">
          <div class="box"><strong>pure:</strong> {{ fruits | filterBy: term() }}</div>
          <div class="box"><strong>impure:</strong> {{ fruits | filterByImpure: term() }}</div>
        </div>
        <p class="muted">Click "Unrelated click" 5 times then "Show call counts": the IMPURE pipe re-ran each time; the pure one did not.</p>
      </section>
    </app-feature-page>
  `,
})
export class DirectivesPipesPageComponent {
  protected readonly auth = inject(AuthService);
  private readonly log = inject(LogService);
  protected readonly now = new Date();
  protected readonly person = { name: 'Asha', role: 'dev', city: 'Pune' };
  protected readonly greeting$ = of('Hello from an Observable').pipe(delay(500));
  protected readonly fruits = ['apple', 'banana', 'cherry', 'grape', 'mango', 'pineapple'];
  protected readonly term = signal('');
  protected readonly tick = signal(0);

  protected readonly bullets = [
    'Attribute directives change how an existing element looks/behaves. Modern code uses the host: {} metadata.',
    'Structural directives (*appHasRole) add or remove elements. Log in as Admin in the header to see them react.',
    'hostDirectives lets a component inherit directives (and re-expose their inputs/outputs) from the inside.',
    'Pipes format values in templates. Pure pipes are cached; impure pipes run on every change detection.',
    'AsyncPipe subscribes to an Observable and unsubscribes automatically.',
  ];

  protected onHover(h: boolean): void { this.log.info(SRC, `hostDirective output hoverChange = ${h}`); }
  protected report(): void {
    this.log.info(SRC, `pipe calls so far -> pure: ${pipeCalls.pure}, impure: ${pipeCalls.impure} (impure is much higher!)`);
  }
}
