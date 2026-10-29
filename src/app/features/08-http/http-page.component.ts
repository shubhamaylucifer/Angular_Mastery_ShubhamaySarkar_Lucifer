/**
 * ============================================================================
 * FILE: http-page.component.ts   (MODULE 08 page)
 * ============================================================================
 * WHAT IS THIS?
 *   Interactive demo of HttpClient CRUD, the 4 functional interceptors,
 *   HttpContext flags, progress reporting (upload/download) and cancellation.
 *
 * REAL-WORLD ANALOGY:
 *   Postal service. Interceptors = sorting-centre checkpoints every parcel
 *   passes through (stamp, cache, re-send, complaint desk).
 *
 * WHY DO WE NEED IT?
 *   Nearly every real app talks to a back-end. Doing it with typed,
 *   cancellable, observable calls prevents the classic bugs.
 *
 * COMMON BEGINNER MISTAKE:
 *   Not unsubscribing from a long request when the user leaves the page. Use
 *   takeUntilDestroyed(), the async pipe, or resource(). Here we cancel by hand.
 * ============================================================================
 */
import { HttpClient, HttpEventType, HttpRequest } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, Subscription } from 'rxjs';
import { clearHttpCache } from '../../core/interceptors/cache.interceptor';
import { AuthService } from '../../core/services/auth.service';
import { LogService } from '../../core/services/log.service';
import { Post } from '../../models/user.model';
import { FeaturePageComponent } from '../../shared/components/feature-page.component';
import { PostsApiService } from './posts-api.service';

const SRC = '08-http';

@Component({
  selector: 'app-http-page',
  imports: [FeaturePageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-feature-page
      title="08 HTTP Client, Interceptors & Resilience"
      subtitle="Talk to a server with typed, cancellable requests."
      level="Intermediate"
      source="08-http"
      [bullets]="bullets"
    >
      <section class="card">
        <h2>A. Typed CRUD (jsonplaceholder.typicode.com)</h2>
        <div class="row">
          <button class="btn" type="button" (click)="load()">GET list</button>
          <button class="btn" type="button" (click)="create()">POST</button>
          <button class="btn" type="button" (click)="put()">PUT</button>
          <button class="btn" type="button" (click)="patch()">PATCH</button>
          <button class="btn danger" type="button" (click)="del()">DELETE</button>
        </div>
        <ul class="plain">
          @for (p of posts(); track p.id) { <li><strong>#{{ p.id }}</strong> {{ p.title }}</li> } @empty { <li class="muted">Click GET list.</li> }
        </ul>
      </section>

      <section class="card">
        <h2>B. Interceptors</h2>
        <div class="row">
          <p class="muted">Auth: {{ auth.isLoggedIn() ? 'logged in -> Bearer token attached on non-public calls' : 'guest -> no token' }}</p>
        </div>
        <div class="row">
          <button class="btn" type="button" (click)="privateCall()">GET (auth attached when logged in)</button>
          <button class="btn" type="button" (click)="publicCall()">GET (SKIP_AUTH context)</button>
          <button class="btn" type="button" (click)="cached()">GET cacheable (click twice!)</button>
          <button class="btn" type="button" (click)="clearCache()">Clear cache</button>
          <button class="btn" type="button" (click)="fail(false)">404 (error interceptor + toast)</button>
          <button class="btn" type="button" (click)="fail(true)">404 with retry + backoff</button>
        </div>
        <p class="muted">Order in app.config: auth &rarr; cache &rarr; retry &rarr; error. See log lines tagged by each interceptor.</p>
      </section>

      <section class="card">
        <h2>C. Progress &amp; cancellation</h2>
        <div class="row">
          <button class="btn" type="button" (click)="upload()">Simulated upload (POST + reportProgress)</button>
          <button class="btn" type="button" (click)="download()">Download (reportProgress)</button>
          <button class="btn danger" type="button" (click)="cancel()" [disabled]="!busy()">Cancel request</button>
        </div>
        <progress max="100" [value]="progress()" aria-label="Transfer progress"></progress> {{ progress() }}%
      </section>
    </app-feature-page>
  `,
})
export class HttpPageComponent {
  protected readonly api = inject(PostsApiService);
  protected readonly auth = inject(AuthService);
  private readonly http = inject(HttpClient);
  private readonly log = inject(LogService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly posts = signal<readonly Post[]>([]);
  protected readonly progress = signal(0);
  protected readonly busy = signal(false);
  private inflight?: Subscription;

  protected readonly bullets = [
    'provideHttpClient(withFetch(), withInterceptors([...])) is registered once in app.config.ts.',
    'Each button sends a typed request; interceptors log what they do (auth, cache, retry, error).',
    'HttpContext tokens (SKIP_AUTH, CACHEABLE, RETRY_ENABLED) are private notes for interceptors — they never go on the wire.',
    'Click "GET cacheable" twice: the second call is served from memory (RxJS of()).',
    '"404 with retry" waits 500ms, 1s, 2s between attempts (exponential backoff) before giving up.',
    'Progress events + unsubscribe() give you progress bars and cancellation.',
  ];

  /** Helper to subscribe with logging; takeUntilDestroyed avoids leaks if the user leaves. */
  private run<T>(label: string, obs$: Observable<T>, onOk?: (v: T) => void): void {
    obs$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (v) => { this.log.success(SRC, `${label} OK`); onOk?.(v); },
      error: (e: { status?: number }) => this.log.error(SRC, `${label} FAILED (status ${e.status ?? '?'})`),
    });
  }

  protected load(): void { this.run('GET /posts', this.api.list(3), (p) => this.posts.set(p)); }
  protected create(): void {
    this.run('POST /posts', this.api.create({ userId: 1, title: 'My new post', body: 'hello' }), (p) => {
      this.log.info(SRC, `server assigned id ${p.id} (fake API does not really store it)`);
      this.posts.update((l) => [...l, p]);
    });
  }
  protected put(): void { this.run('PUT /posts/1', this.api.replace({ id: 1, userId: 1, title: 'Replaced title', body: 'replaced' })); }
  protected patch(): void { this.run('PATCH /posts/1', this.api.update(1, { title: 'Patched title only' })); }
  protected del(): void { this.run('DELETE /posts/1', this.api.remove(1), () => this.posts.update((l) => l.filter((p) => p.id !== 1))); }

  protected privateCall(): void { this.run('GET /posts/1 (auth interceptor may attach token)', this.api.getWithAuth(1)); }
  protected publicCall(): void { this.run('GET /posts/1 (SKIP_AUTH)', this.api.get(1)); }
  protected cached(): void { this.run('GET /posts (cacheable)', this.api.list(2, 1, true)); }
  protected clearCache(): void { clearHttpCache(); this.log.warn(SRC, 'HTTP cache cleared'); }
  protected fail(retry: boolean): void { this.run(`GET 404 (retry=${retry})`, this.api.broken(retry)); }

  protected upload(): void {
    this.progress.set(0);
    this.busy.set(true);
    const body = new Blob([new Uint8Array(2_000_000)]);
    const req = new HttpRequest('POST', 'https://jsonplaceholder.typicode.com/posts', body, { reportProgress: true });
    this.inflight = this.http.request(req).subscribe({
      next: (e) => {
        if (e.type === HttpEventType.UploadProgress && e.total) this.progress.set(Math.round((100 * e.loaded) / e.total));
        else if (e.type === HttpEventType.Response) { this.progress.set(100); this.log.success(SRC, 'upload finished'); }
      },
      error: () => this.log.error(SRC, 'upload failed'),
      complete: () => this.busy.set(false),
    });
  }

  protected download(): void {
    this.progress.set(0);
    this.busy.set(true);
    this.inflight = this.http.get('https://jsonplaceholder.typicode.com/photos', { observe: 'events', reportProgress: true, responseType: 'text' }).subscribe({
      next: (e) => {
        if (e.type === HttpEventType.DownloadProgress) this.progress.set(e.total ? Math.round((100 * e.loaded) / e.total) : Math.min(99, this.progress() + 10));
        else if (e.type === HttpEventType.Response) { this.progress.set(100); this.log.success(SRC, 'download finished'); }
      },
      error: () => this.log.error(SRC, 'download failed'),
      complete: () => this.busy.set(false),
    });
  }

  protected cancel(): void {
    // unsubscribe() aborts the underlying fetch request.
    this.inflight?.unsubscribe();
    this.busy.set(false);
    this.log.warn(SRC, 'request cancelled by unsubscribe()');
  }
}
