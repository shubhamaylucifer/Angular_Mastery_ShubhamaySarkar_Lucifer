/**
 * ============================================================================
 * FILE: elements-pwa-demo.component.ts   (MODULE 13 - Angular Elements & PWA)
 * ============================================================================
 * WHAT IS THIS?
 *   Part 1 - ANGULAR ELEMENTS (live): turn an Angular component into a standard
 *            Web Component (a custom HTML tag) that works in ANY page, even one
 *            with no Angular. We register <hello-element> and create it by hand.
 *   Part 2 - PWA SERVICE WORKER (documentation): how `SwUpdate` detects a new
 *            app version. Not enabled in this repo (it needs a production build
 *            served over HTTPS), so it is shown as annotated code.
 *
 * REAL-WORLD ANALOGY:
 *   Elements = exporting a LEGO piece as a universal plug that fits other toy
 *   brands. Service worker = a shop assistant who keeps a copy of your catalogue
 *   in the back room, so the shop still works when the internet is down.
 *
 * WHY DO WE NEED IT?
 *   Elements: share one widget with teams using React/Vue/plain HTML.
 *   Service worker: offline support, instant repeat loads, "new version" prompts.
 *
 * COMMON BEGINNER MISTAKE:
 *   Calling customElements.define() twice with the same tag name -> it throws.
 *   Always check customElements.get('tag') first (we do below).
 * ============================================================================
 */
import { createCustomElement } from '@angular/elements';
import { ChangeDetectionStrategy, Component, ElementRef, Injector, inject, input, signal, viewChild } from '@angular/core';
import { LogService } from '../../core/services/log.service';

const SRC = '13-enterprise';
const TAG = 'hello-element';

/** The Angular component that will be exported as a Web Component. */
@Component({
  selector: 'app-hello-element-inner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="hello">Hello, <strong>{{ name() }}</strong>! (I am an Angular component inside a custom element)</span>`,
  styles: `.hello { display: inline-block; padding: 4px 10px; border: 2px solid #1b8a4b; border-radius: 8px; background: #e3f6ea; }`,
})
export class HelloElementComponent {
  /** Becomes the HTML attribute `name="..."` of the custom element. */
  readonly name = input('stranger');
}

@Component({
  selector: 'app-elements-pwa-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="card">
      <h2>Angular Elements (live)</h2>
      <div class="row">
        <button class="btn primary" type="button" (click)="register()">1. customElements.define('hello-element')</button>
        <button class="btn" type="button" (click)="create()" [disabled]="!registered()">2. document.createElement('hello-element')</button>
      </div>
      <!-- The custom elements are appended here by plain DOM code, as a non-Angular page would do. -->
      <div #host class="host-area"></div>
<pre><code>const el = createCustomElement(HelloElementComponent, {{ '{' }} injector {{ '}' }});
customElements.define('hello-element', el);

// Now ANY html page can write:
&lt;hello-element name="Ada"&gt;&lt;/hello-element&gt;</code></pre>
    </section>

    <section class="card">
      <h2>PWA service worker &amp; SwUpdate (documentation)</h2>
      <ol>
        <li>Run <code>ng add &#64;angular/pwa</code>. It installs <code>&#64;angular/service-worker</code>, creates <code>ngsw-config.json</code> and <code>manifest.webmanifest</code>.</li>
        <li>Register the worker only in production builds.</li>
        <li>Inject <code>SwUpdate</code> to learn when a new version is ready.</li>
      </ol>
<pre><code>// app.config.ts
provideServiceWorker('ngsw-worker.js', {{ '{' }}
  enabled: !isDevMode(),
  registrationStrategy: 'registerWhenStable:30000',
{{ '}' }})

// update.service.ts
private sw = inject(SwUpdate);
constructor() {{ '{' }}
  this.sw.versionUpdates
    .pipe(filter((e): e is VersionReadyEvent =&gt; e.type === 'VERSION_READY'))
    .subscribe(() =&gt; {{ '{' }}
      if (confirm('A new version is available. Reload now?')) location.reload();
    {{ '}' }});
  this.sw.checkForUpdate();   // ask the server right now
{{ '}' }}</code></pre>
      <p class="muted">Why not enabled here? Service workers cache aggressively and need HTTPS + a production build, which would make this learning repo confusing during <code>ng serve</code>.</p>
    </section>
  `,
  styles: `.host-area { margin: .6rem 0; display: flex; flex-direction: column; gap: .4rem; }`,
})
export class ElementsPwaDemoComponent {
  private readonly injector = inject(Injector);
  private readonly log = inject(LogService);
  private readonly host = viewChild.required<ElementRef<HTMLElement>>('host');

  protected readonly registered = signal(!!customElements.get(TAG));
  private n = 0;

  protected register(): void {
    // Guard: define() throws if the tag name is already taken.
    if (!customElements.get(TAG)) {
      // createCustomElement wraps the component; the injector gives it access to app services.
      customElements.define(TAG, createCustomElement(HelloElementComponent, { injector: this.injector }));
    }
    this.registered.set(true);
    this.log.success(SRC, `customElements.define('${TAG}') done`);
  }

  protected create(): void {
    const el = document.createElement(TAG);
    el.setAttribute('name', `Element #${++this.n}`); // attribute -> Angular input
    this.host().nativeElement.appendChild(el);
    this.log.info(SRC, `<${TAG} name="${el.getAttribute('name')}"> inserted by plain DOM code`);
  }
}
