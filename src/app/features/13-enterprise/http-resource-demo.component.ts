/**
 * ============================================================================
 * FILE: http-resource-demo.component.ts   (MODULE 13 - httpResource)
 * ============================================================================
 * WHAT IS THIS?
 *   `httpResource()` = signal-native HTTP. You give it a function that returns
 *   a URL (or request object). Whenever a signal used INSIDE that function
 *   changes, Angular automatically cancels the old request and fetches the new
 *   one. It exposes value(), isLoading(), error(), status(), reload().
 *
 * REAL-WORLD ANALOGY:
 *   A smart thermostat: you don't press "fetch temperature" every time. You say
 *   "keep showing the temperature of whichever room I select" and it re-reads
 *   by itself when you change the room.
 *
 * WHY DO WE NEED IT?
 *   Compare three ways to load the same post (all on this page):
 *     HttpClient    - Observable, you wire subscribe/unsubscribe/loading flags.
 *     resource()    - Promise-based loader with signals (Module 02).
 *     httpResource()- shortest: it USES HttpClient (and your interceptors!)
 *                     under the hood and gives signals directly.
 *
 * COMMON BEGINNER MISTAKE:
 *   Reading `post.value()` when the request failed - it THROWS. Check
 *   `post.hasValue()` first (we do in the template).
 * ============================================================================
 */
import { HttpClient, httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { LogService } from '../../core/services/log.service';
import { API_URL } from '../../core/tokens';
import { Post } from '../../models/user.model';

const SRC = '13-enterprise';

@Component({
  selector: 'app-http-resource-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="card">
      <h2>httpResource() — signal-native HTTP</h2>
      <div class="row">
        <button class="btn" type="button" (click)="prev()" [disabled]="id() <= 1">&larr; Prev</button>
        <strong>Post #{{ id() }}</strong>
        <button class="btn" type="button" (click)="next()">Next &rarr;</button>
        <button class="btn" type="button" (click)="post.reload()">Reload</button>
      </div>

      @if (post.isLoading()) {
        <p class="muted">Loading...</p>
      } @else if (post.error()) {
        <p class="err">Failed to load. (The error interceptor also showed a toast.)</p>
      } @else if (post.hasValue()) {
        <h3>{{ post.value().title }}</h3>
        <p class="muted">status: {{ post.status() }}</p>
      }

      <h3>Same data via HttpClient + toSignal() (for comparison)</h3>
      <p class="muted">Loaded once at page start with <code>http.get(...)</code>:</p>
      <p>{{ classic()?.title ?? 'loading...' }}</p>

      <h3>Code</h3>
      <pre><code>{{ snippet }}</code></pre>
    </section>
  `,
})
export class HttpResourceDemoComponent {
  /** Plain string so the `${...}` characters never get parsed as a template literal. */
  protected readonly snippet = [
    '// 1. a signal that holds the input',
    'id = signal(1);',
    '',
    '// 2. the resource: re-runs automatically when id() changes',
    'post = httpResource<Post>(() => `${base}/posts/${this.id()}`);',
    '',
    '// 3. use it in the template',
    'post.value() / post.isLoading() / post.error() / post.reload()',
  ].join('\n');

  private readonly log = inject(LogService);
  private readonly base = inject(API_URL);
  private readonly http = inject(HttpClient);

  protected readonly id = signal(1);

  /**
   * The arrow function is "reactive": reading `this.id()` inside it makes Angular
   * re-run it (and cancel the previous request) every time `id` changes.
   * Because httpResource uses HttpClient internally, our auth/cache/retry/error
   * interceptors apply here too.
   */
  protected readonly post = httpResource<Post>(() => {
    const url = `${this.base}/posts/${this.id()}`;
    this.log.info(SRC, `httpResource: GET ${url}`);
    return url;
  });

  /** Classic approach for comparison: Observable converted to a signal. */
  protected readonly classic = toSignal(this.http.get<Post>(`${this.base}/posts/1`));

  protected next(): void {
    this.id.update((n) => n + 1);
  }

  protected prev(): void {
    this.id.update((n) => Math.max(1, n - 1));
  }
}
