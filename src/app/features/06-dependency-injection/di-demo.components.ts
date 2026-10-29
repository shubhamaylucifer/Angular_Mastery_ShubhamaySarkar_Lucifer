/**
 * ============================================================================
 * FILE: di-demo.components.ts   (Module 06 - Dependency Injection building blocks)
 * ============================================================================
 * WHAT IS THIS?
 *   All the small services, tokens and components used by the DI page:
 *    - inject() vs constructor injection
 *    - useClass / useExisting / useValue / useFactory / InjectionToken
 *    - multi-providers (multi: true)
 *    - component-level `providers` vs `viewProviders`
 *    - resolution modifiers: self, skipSelf, optional, host (inject() options)
 *
 * REAL-WORLD ANALOGY:
 *   DI is a restaurant: you (a class) just say "I need a coffee". You don't grow
 *   beans or build a machine - the waiter (injector) brings one. And the
 *   injectors form a CHAIN: if your table has no coffee, the waiter asks the
 *   section, then the whole restaurant (the element -> parent -> root tree).
 *
 * WHY DO WE NEED IT?
 *   Loose coupling & easy testing: swap a real service for a fake one without
 *   editing the class that uses it.
 *
 * COMMON BEGINNER MISTAKE:
 *   `new MyService()` inside a component. You lose the shared singleton and make
 *   testing hard. Always `inject(MyService)`.
 * ============================================================================
 */
import { ChangeDetectionStrategy, Component, Host, Inject, Injectable, InjectionToken, Optional, Self, SkipSelf, inject } from '@angular/core';
import { LogService } from '../../core/services/log.service';

const SRC = '06-di';

/* ------------------------------------------------------------------ */
/* 1. inject() vs constructor injection                                */
/* ------------------------------------------------------------------ */
@Injectable({ providedIn: 'root' }) // root singleton: ONE instance app-wide
export class CounterService {
  count = 0;
  readonly instanceId = Math.floor(Math.random() * 10_000);
  increment(): number { return ++this.count; }
}

@Component({
  selector: 'app-inject-style',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="box">
      <div>Modern <code>inject()</code>: service #{{ viaInject.instanceId }}</div>
      <div>Classic constructor injection: service #{{ viaCtor.instanceId }}</div>
      <div class="muted">Same number = the SAME singleton instance.</div>
    </div>
  `,
})
export class InjectStyleComponent {
  protected readonly viaInject = inject(CounterService); // modern, works in field initialisers & functions
  protected readonly viaCtor: CounterService;
  constructor(counter: CounterService) { this.viaCtor = counter; } // classic style
}

/* ------------------------------------------------------------------ */
/* 2. Provider recipes                                                 */
/* ------------------------------------------------------------------ */
export abstract class Greeter { abstract greet(name: string): string; }

@Injectable() export class FormalGreeter extends Greeter { greet(n: string): string { return `Good day, ${n}.`; } }

/** Non-class value => needs an InjectionToken. */
export interface FeatureConfig { readonly apiUrl: string; readonly retries: number; }
export const FEATURE_CONFIG = new InjectionToken<FeatureConfig>('FEATURE_CONFIG');
export const TIMESTAMP = new InjectionToken<string>('TIMESTAMP');

/** Multi-provider token: many providers contribute to ONE array. */
export interface Validator { readonly name: string; check(v: string): boolean; }
export const VALIDATORS = new InjectionToken<Validator[]>('VALIDATORS');

@Component({
  selector: 'app-provider-recipes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    // useClass: "when someone asks for Greeter, create a FormalGreeter".
    { provide: Greeter, useClass: FormalGreeter },
    // useExisting: an ALIAS - asking for FormalGreeter returns the SAME instance as Greeter.
    { provide: FormalGreeter, useExisting: Greeter },
    // useValue: hand out a ready-made constant object.
    { provide: FEATURE_CONFIG, useValue: { apiUrl: 'https://api.example.com', retries: 3 } satisfies FeatureConfig },
    // useFactory: run a function to build the value (can inject other things via `deps`).
    { provide: TIMESTAMP, useFactory: (log: LogService) => { log.info(SRC, 'useFactory ran'); return new Date().toLocaleTimeString(); }, deps: [LogService] },
    // multi: true -> each provider ADDS to an array instead of replacing.
    { provide: VALIDATORS, useValue: { name: 'notEmpty', check: (v: string) => v.length > 0 }, multi: true },
    { provide: VALIDATORS, useValue: { name: 'maxLen5', check: (v: string) => v.length <= 5 }, multi: true },
    { provide: VALIDATORS, useFactory: () => ({ name: 'lowercase', check: (v: string) => v === v.toLowerCase() }), multi: true },
  ],
  template: `
    <div class="box stack">
      <div><code>useClass</code>: {{ greeter.greet('Asha') }}</div>
      <div><code>useExisting</code> alias is the same instance: {{ sameInstance }}</div>
      <div><code>useValue</code> via InjectionToken: {{ cfg.apiUrl }} (retries {{ cfg.retries }})</div>
      <div><code>useFactory</code>: created at {{ stamp }}</div>
      <div><code>multi: true</code>: {{ validators.length }} validators collected -
        @for (v of validators; track v.name) { <span class="badge">{{ v.name }}: {{ v.check('Hello') }}</span> }
      </div>
    </div>
  `,
})
export class ProviderRecipesComponent {
  protected readonly greeter = inject(Greeter);
  protected readonly alias = inject(FormalGreeter);
  protected readonly sameInstance = this.greeter === this.alias;
  protected readonly cfg = inject(FEATURE_CONFIG);
  protected readonly stamp = inject(TIMESTAMP);
  protected readonly validators = inject(VALIDATORS);
}

/* ------------------------------------------------------------------ */
/* 3. Scoped injectors: root vs providers vs viewProviders             */
/* ------------------------------------------------------------------ */
@Injectable({ providedIn: 'root' })
export class ScopedService {
  readonly label: string = 'ROOT instance';
}

/** A child that reads ScopedService, and also a projected child to show viewProviders. */
@Component({
  selector: 'app-scope-reader',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="badge">{{ who }} sees: {{ svc.label }}</span>`,
})
export class ScopeReaderComponent {
  protected readonly svc = inject(ScopedService);
  who = 'child';
}

@Injectable() export class ComponentScopedService extends ScopedService { override readonly label: string = 'COMPONENT providers instance'; }
@Injectable() export class ViewScopedService extends ScopedService { override readonly label: string = 'VIEW providers instance'; }

/** `providers`: visible to the component, its view children AND projected content. */
@Component({
  selector: 'app-scope-providers',
  imports: [ScopeReaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: ScopedService, useClass: ComponentScopedService }],
  template: `<div class="box">providers: <app-scope-reader /> <ng-content /></div>`,
})
export class ScopeProvidersComponent {}

/** `viewProviders`: visible ONLY to this component's own view - NOT to projected <ng-content>. */
@Component({
  selector: 'app-scope-view-providers',
  imports: [ScopeReaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [{ provide: ScopedService, useClass: ViewScopedService }],
  template: `<div class="box">viewProviders: <app-scope-reader /> <ng-content /></div>`,
})
export class ScopeViewProvidersComponent {}

/* ------------------------------------------------------------------ */
/* 4. Resolution modifiers: visual component tree                      */
/* ------------------------------------------------------------------ */
export const TREE_NODE_NAME = new InjectionToken<string>('TREE_NODE_NAME');

@Component({
  selector: 'app-tree-node',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: TREE_NODE_NAME, useFactory: () => `node@${Math.floor(Math.random() * 900 + 100)}` }],
  template: `
    <div class="box">
      <strong>{{ own }}</strong>
      <ng-content />
    </div>
  `,
})
export class TreeNodeComponent {
  protected readonly own = inject(TREE_NODE_NAME);
}

/**
 * Probe sits inside a tree node and tries every modifier.
 * Both styles are shown: modern inject() options and the classic decorators.
 */
@Component({
  selector: 'app-tree-probe',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: TREE_NODE_NAME, useValue: 'probe-own-provider' }],
  template: `
    <div class="stack">
      <div>default inject(): <strong>{{ normal }}</strong> <span class="muted">(my own provider wins)</span></div>
      <div>{{ '{ skipSelf: true }' }} / <code>&#64;SkipSelf()</code>: <strong>{{ skip }}</strong> <span class="muted">(skips my provider -> asks parent node)</span></div>
      <div>{{ '{ self: true }' }} / <code>&#64;Self()</code>: <strong>{{ self }}</strong> <span class="muted">(only my own injector)</span></div>
      <div>{{ '{ host: true }' }} / <code>&#64;Host()</code>: <strong>{{ host }}</strong> <span class="muted">(stop at the host element boundary)</span></div>
      <div>{{ '{ optional: true }' }} / <code>&#64;Optional()</code> for a missing token: <strong>{{ missing ?? 'null (no error thrown)' }}</strong></div>
      <div class="muted">Classic decorator constructor style: {{ classicStyle }}</div>
    </div>
  `,
})
export class TreeProbeComponent {
  protected readonly normal = inject(TREE_NODE_NAME);
  protected readonly skip = inject(TREE_NODE_NAME, { skipSelf: true });
  protected readonly self = inject(TREE_NODE_NAME, { self: true });
  protected readonly host = inject(TREE_NODE_NAME, { host: true, optional: true });
  protected readonly missing = inject(new InjectionToken<string>('NOT_PROVIDED'), { optional: true });
  protected readonly classicStyle: string;

  /** Classic decorators still work and are asked about in interviews. */
  constructor(
    @Self() @Inject(TREE_NODE_NAME) selfToken: string,
    @SkipSelf() @Inject(TREE_NODE_NAME) parentToken: string,
    @Optional() @Host() @Inject(TREE_NODE_NAME) hostToken: string | null,
  ) {
    this.classicStyle = `@Self=${selfToken}, @SkipSelf=${parentToken}, @Optional+@Host=${hostToken}`;
  }
}
