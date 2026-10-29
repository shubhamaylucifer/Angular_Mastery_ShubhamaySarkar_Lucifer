/**
 * ============================================================================
 * FILE: errors-env-demo.component.ts   (MODULE 13 - Error handling & Environments)
 * ============================================================================
 * WHAT IS THIS?
 *   Part 1 - Compare the TWO safety nets of an Angular app:
 *       ErrorHandler       -> catches UNEXPECTED code bugs (sync, async, promise).
 *       HTTP interceptor   -> catches FAILED HTTP responses.
 *   Part 2 - Environments: which `environment.*.ts` file won at build time.
 *
 * REAL-WORLD ANALOGY:
 *   ErrorHandler is the building's fire alarm: it goes off for any surprise
 *   fire. The HTTP interceptor is the mailroom clerk who deals with "return to
 *   sender" letters - an expected, routine kind of failure.
 *
 * WHY DO WE NEED IT?
 *   One uncaught exception should never leave the user with a silent, broken
 *   screen. Central handling = one place to show a toast, log to a monitoring
 *   service (Sentry etc.) and keep the app alive.
 *
 * COMMON BEGINNER MISTAKE:
 *   Expecting ErrorHandler to see HTTP errors. HttpClient turns them into
 *   Observable errors; if your subscribe() has an error callback, nobody else
 *   ever hears about it. Use an interceptor (or catchError) for HTTP.
 * ============================================================================
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { LogService } from '../../core/services/log.service';
import { PostsApiService } from '../08-http/posts-api.service';

const SRC = '13-enterprise';

@Component({
  selector: 'app-errors-env-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="card">
      <h2>1. ErrorHandler vs HTTP interceptor</h2>
      <p class="muted">
        Each button causes a different kind of failure. Watch the red toast (top-right), the
        event log and the browser console (F12).
      </p>
      <table>
        <thead><tr><th>Button</th><th>Who catches it?</th></tr></thead>
        <tbody>
          <tr><td>Throw in click handler</td><td><code>GlobalErrorHandler</code> (Angular catches handler errors)</td></tr>
          <tr><td>Throw inside setTimeout</td><td><code>GlobalErrorHandler</code> via <code>provideBrowserGlobalErrorListeners()</code></td></tr>
          <tr><td>Rejected Promise (not awaited)</td><td><code>GlobalErrorHandler</code> via the same global listeners</td></tr>
          <tr><td>HTTP 404</td><td><code>errorInterceptor</code> (NOT the ErrorHandler)</td></tr>
        </tbody>
      </table>
      <div class="row" style="margin-top:.6rem">
        <button class="btn danger" type="button" (click)="throwSync()">Throw in click handler</button>
        <button class="btn danger" type="button" (click)="throwAsync()">Throw inside setTimeout</button>
        <button class="btn danger" type="button" (click)="rejectPromise()">Rejected Promise</button>
        <button class="btn" type="button" (click)="http404()">HTTP 404 (interceptor)</button>
      </div>
    </section>

    <section class="card">
      <h2>2. Environments &amp; <code>fileReplacements</code></h2>
      <div class="grid-3">
        <div class="box"><strong>environment.envName</strong><br />{{ env.envName }}</div>
        <div class="box"><strong>environment.production</strong><br />{{ env.production }}</div>
        <div class="box"><strong>environment.apiUrl</strong><br />{{ env.apiUrl }}</div>
      </div>
      <p>
        Run <code>ng serve</code> (development) &rarr; you see <em>development</em>. Run
        <code>ng build</code> (production) &rarr; you see <em>production</em>. The code is identical; only the file behind
        the import changed.
      </p>
<pre><code>// angular.json  (projects &gt; app &gt; architect &gt; build &gt; configurations &gt; development)
"fileReplacements": [
  {{ '{' }}
    "replace": "src/environments/environment.ts",
    "with":    "src/environments/environment.development.ts"
  {{ '}' }}
]</code></pre>
    </section>
  `,
})
export class ErrorsEnvDemoComponent {
  private readonly log = inject(LogService);
  private readonly api = inject(PostsApiService);

  protected readonly env = environment;

  protected throwSync(): void {
    this.log.warn(SRC, 'about to throw inside a click handler...');
    throw new Error('Synchronous bug: something went wrong in a click handler');
  }

  protected throwAsync(): void {
    this.log.warn(SRC, 'scheduling a throw inside setTimeout...');
    setTimeout(() => {
      throw new Error('Asynchronous bug: thrown inside setTimeout');
    }, 100);
  }

  protected rejectPromise(): void {
    this.log.warn(SRC, 'creating a rejected Promise nobody awaits...');
    void Promise.reject(new Error('Unhandled promise rejection: nobody called catch()'));
  }

  protected http404(): void {
    this.log.info(SRC, 'calling a non-existent URL (the error interceptor will react)...');
    this.api.broken(false).subscribe({
      // We still pass an error callback so the demo stays quiet; the INTERCEPTOR already toasted.
      error: () => this.log.info(SRC, 'subscriber error callback ran (ErrorHandler was NOT involved)'),
    });
  }
}
