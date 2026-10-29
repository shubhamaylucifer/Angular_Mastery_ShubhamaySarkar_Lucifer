/**
 * ============================================================================
 * FILE: ssr-page.component.ts   (MODULE 11 page)
 * ============================================================================
 * WHAT IS THIS?
 *   Explains CSR vs SSR and demonstrates platform-safe code live:
 *    - PLATFORM_ID + isPlatformBrowser() guards
 *    - afterNextRender() for browser-only work
 *    - a safe localStorage wrapper that never crashes on the server
 *    - TransferState (server -> browser data hand-off) with a simulated server
 *    - the hydration providers (shown as annotated code, see note below)
 *
 * REAL-WORLD ANALOGY:
 *   CSR = IKEA flat-pack: the browser receives parts (JS) and assembles the page.
 *   SSR = pre-assembled furniture: the server sends finished HTML; the browser
 *         only has to "screw in the last bolts" (hydration) to make it interactive.
 *
 * WHY DO WE NEED IT?
 *   SSR gives faster first paint and real HTML for search engines / link previews.
 *
 * COMMON BEGINNER MISTAKE:
 *   Using `window`, `document` or `localStorage` directly. On the server these
 *   don't exist -> "ReferenceError: window is not defined" and the page crashes.
 *
 * NOTE ON THIS REPO: it was generated as a client-rendered app so it runs with
 *   plain `ng serve`. To switch SSR on, run `ng add @angular/ssr` and add the
 *   provideClientHydration(...) line shown below to app.config.ts.
 * ============================================================================
 */
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import {
  ChangeDetectionStrategy, Component, PLATFORM_ID, afterNextRender, inject, signal,
} from '@angular/core';
import { TransferState, makeStateKey } from '@angular/core';
import { FeaturePageComponent } from '../../shared/components/feature-page.component';
import { LogService } from '../../core/services/log.service';

const SRC = '11-ssr';

/** A typed key for TransferState. The server writes it, the browser reads it. */
const GREETING_KEY = makeStateKey<string>('greeting');

@Component({
  selector: 'app-ssr-page',
  imports: [FeaturePageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-feature-page
      title="11 SSR, Hydration & Platform Agnosticism"
      subtitle="Write code that runs safely in the browser AND on a server."
      level="Advanced"
      source="11-ssr"
      [bullets]="bullets"
    >
      <section class="card">
        <h2>A. CSR vs SSR in plain English</h2>
        <div class="grid-2">
          <div class="box"><strong>CSR (Client-Side Rendering)</strong>
            <ol><li>Browser downloads an almost EMPTY html + JS.</li><li>JS runs and builds the page.</li><li>User finally sees content.</li></ol>
            <span class="muted">Simple hosting, but slower first paint and weak SEO.</span></div>
          <div class="box"><strong>SSR (Server-Side Rendering) + Hydration</strong>
            <ol><li>Server runs Angular and sends FULL html.</li><li>User sees content immediately.</li><li>JS loads and <em>hydrates</em>: re-uses that DOM and attaches listeners.</li></ol>
            <span class="muted">Faster first paint and crawlable, but code must be platform-safe.</span></div>
        </div>
      </section>

      <section class="card">
        <h2>B. Platform safety (live)</h2>
        <p>Running on: <strong>{{ platformName }}</strong></p>
        <div class="row">
          <button class="btn" type="button" (click)="unsafe()">Unsafe: window.innerWidth</button>
          <button class="btn primary" type="button" (click)="safe()">Safe: guarded with isPlatformBrowser()</button>
          <button class="btn" type="button" (click)="storage()">Safe localStorage wrapper</button>
        </div>
        <p>Window width (read inside <code>afterNextRender</code>): <strong>{{ width() }}</strong></p>
      </section>

      <section class="card">
        <h2>C. TransferState (simulated)</h2>
        <p class="muted">With SSR the server fetches data once, stores it in TransferState (serialised into the HTML), and the browser reads it instead of calling the API AGAIN.</p>
        <div class="row">
          <button class="btn" type="button" (click)="simulateServer()">1. "Server" stores value</button>
          <button class="btn" type="button" (click)="simulateBrowser()">2. "Browser" reads value (no HTTP call)</button>
        </div>
        <p>Value: <strong>{{ transferred() }}</strong></p>
      </section>

      <section class="card">
        <h2>D. Hydration providers (annotated)</h2>
<pre><code>// app.config.ts (after: ng add &#64;angular/ssr)
provideClientHydration(
  withEventReplay(),         // record clicks made BEFORE hydration finished, replay after
  withIncrementalHydration() // hydrate &#64;defer blocks lazily (hydrate on viewport/interaction/...)
)

// Template: opt a subtree out of hydration (e.g. 3rd-party widget that mutates the DOM)
&lt;div ngSkipHydration&gt;...&lt;/div&gt;

// Template: incremental hydration of a deferred block
&#64;defer (hydrate on viewport) {{ '{' }} &lt;heavy-chart /&gt; {{ '}' }}</code></pre>
        <ul>
          <li><code>withEventReplay()</code>: no lost clicks while JS is still loading.</li>
          <li><code>withIncrementalHydration()</code>: large pages hydrate in pieces, on demand.</li>
          <li><code>ngSkipHydration</code>: escape hatch for DOM-manipulating components.</li>
        </ul>
      </section>
    </app-feature-page>
  `,
})
export class SsrPageComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly log = inject(LogService);
  private readonly state = inject(TransferState);

  protected readonly platformName = isPlatformBrowser(this.platformId) ? 'BROWSER' : isPlatformServer(this.platformId) ? 'SERVER' : 'UNKNOWN';
  protected readonly width = signal('(not measured yet)');
  protected readonly transferred = signal('-');

  protected readonly bullets = [
    'CSR builds the page in the browser; SSR sends ready-made HTML first, then hydration makes it interactive.',
    'window, document and localStorage do not exist on the server — guard them with isPlatformBrowser(PLATFORM_ID).',
    'afterNextRender() runs only in the browser after painting: the best place for DOM measurements and 3rd-party libs.',
    'TransferState moves data from server to browser so the API is not called twice.',
    'provideClientHydration(withEventReplay(), withIncrementalHydration()) and ngSkipHydration tune hydration.',
  ];

  constructor() {
    // afterNextRender callbacks NEVER run on the server, so using window here is safe.
    afterNextRender(() => {
      this.width.set(`${window.innerWidth}px`);
      this.log.success(SRC, 'afterNextRender: safely read window.innerWidth (browser only)');
    });
  }

  protected unsafe(): void {
    try {
      // On a server this line would THROW ReferenceError. In the browser it works.
      this.log.warn(SRC, `unguarded window.innerWidth = ${window.innerWidth} (would crash on a server!)`);
    } catch (e) {
      this.log.error(SRC, `crash: ${(e as Error).message}`);
    }
  }

  protected safe(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.log.success(SRC, `isPlatformBrowser() === true -> window.innerHeight = ${window.innerHeight}`);
    } else {
      this.log.info(SRC, 'On the server: skipped browser-only code');
    }
  }

  protected storage(): void {
    // Wrapper pattern: returns a fallback instead of crashing on the server.
    const read = (key: string): string | null => (isPlatformBrowser(this.platformId) ? localStorage.getItem(key) : null);
    if (isPlatformBrowser(this.platformId)) localStorage.setItem('ssr-demo', new Date().toLocaleTimeString());
    this.log.info(SRC, `safe localStorage read -> ${read('ssr-demo') ?? 'null (server fallback)'}`);
  }

  protected simulateServer(): void {
    this.state.set(GREETING_KEY, `Fetched once on the server at ${new Date().toLocaleTimeString()}`);
    this.log.info(SRC, 'TransferState.set(): server stored the fetched data');
  }

  protected simulateBrowser(): void {
    const v = this.state.get(GREETING_KEY, 'nothing transferred yet - click step 1');
    this.transferred.set(v);
    this.log.success(SRC, `TransferState.get(): ${v}`);
  }
}
