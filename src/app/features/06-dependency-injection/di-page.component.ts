/**
 * ============================================================================
 * FILE: di-page.component.ts   (MODULE 06 page)
 * ============================================================================
 * WHAT IS THIS?
 *   Page assembling every Dependency Injection demo plus the legacy NgModule
 *   example (loaded by importing the module into this standalone component).
 *
 * REAL-WORLD ANALOGY:
 *   A tour of the restaurant kitchen: the waiter (injector), the menu (tokens),
 *   and the old-fashioned department store (NgModule).
 *
 * WHY DO WE NEED IT?
 *   DI is the backbone of Angular; interviews always ask about it.
 *
 * COMMON BEGINNER MISTAKE:
 *   Not knowing WHERE a provider was registered. Always ask: root? component?
 *   route? That decides how many instances exist and who can see them.
 * ============================================================================
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AppConfigService } from '../../core/services/app-config.service';
import { API_URL } from '../../core/tokens';
import { FeaturePageComponent } from '../../shared/components/feature-page.component';
import {
  CounterService, InjectStyleComponent, ProviderRecipesComponent, ScopeProvidersComponent, ScopeReaderComponent,
  ScopeViewProvidersComponent, TreeNodeComponent, TreeProbeComponent,
} from './di-demo.components';
import { LegacyFeatureModule } from './legacy-ngmodule';

@Component({
  selector: 'app-di-page',
  imports: [
    FeaturePageComponent, InjectStyleComponent, ProviderRecipesComponent, ScopeProvidersComponent,
    ScopeViewProvidersComponent, ScopeReaderComponent, TreeNodeComponent, TreeProbeComponent, LegacyFeatureModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-feature-page
      title="06 Dependency Injection & Services"
      subtitle="Let Angular hand you the objects you need."
      level="Intermediate"
      source="06-di"
      [bullets]="bullets"
    >
      <section class="card">
        <h2>A. Singleton service &amp; inject() vs constructor</h2>
        <app-inject-style />
        <div class="row">
          <button class="btn" type="button" (click)="bump()">CounterService.increment() -> {{ counter.count }}</button>
          <span class="muted">API_URL token (default from environment.ts): <code>{{ apiUrl }}</code></span>
        </div>
      </section>

      <section class="card">
        <h2>B. Provider recipes &amp; multi-providers</h2>
        <app-provider-recipes />
      </section>

      <section class="card">
        <h2>C. providers vs viewProviders</h2>
        <p class="muted">The projected child (inside the tags) can see <code>providers</code> but NOT <code>viewProviders</code>.</p>
        <app-scope-providers><app-scope-reader /></app-scope-providers>
        <app-scope-view-providers><app-scope-reader /></app-scope-view-providers>
        <p>Outside both: <app-scope-reader /></p>
      </section>

      <section class="card">
        <h2>D. Resolution modifiers (&#64;Self / &#64;SkipSelf / &#64;Optional / &#64;Host)</h2>
        <app-tree-node>
          <app-tree-node>
            <app-tree-probe />
          </app-tree-node>
        </app-tree-node>
      </section>

      <section class="card">
        <h2>E. App initializer</h2>
        <p>Runtime config fetched by <code>provideAppInitializer()</code> before the app started:</p>
        <pre><code>{{ cfgText() }}</code></pre>
      </section>

      <section class="card">
        <h2>F. Legacy NgModule (what older code bases look like)</h2>
        <app-legacy-widget />
      </section>
    </app-feature-page>
  `,
})
export class DiPageComponent {
  protected readonly counter = inject(CounterService);
  protected readonly apiUrl = inject(API_URL);
  private readonly cfg = inject(AppConfigService).config;
  protected readonly cfgText = () => JSON.stringify(this.cfg(), null, 2);

  protected readonly bullets = [
    'DI = a class asks for what it needs (inject) and Angular supplies it. providedIn: "root" gives one shared instance.',
    'inject(Service) is the modern style; constructor parameters are the classic style. Both give the same instance.',
    'Provider recipes: useClass (swap implementation), useExisting (alias), useValue (constant), useFactory (computed).',
    'InjectionToken lets you inject things that are not classes, such as config objects.',
    'multi: true collects many providers into one array — this is how Angular itself gathers HTTP interceptors/validators.',
    'viewProviders hide a service from projected content; providers do not.',
    'The last section shows a legacy NgModule so you can recognise old code.',
  ];

  protected bump(): void { this.counter.increment(); }
}
