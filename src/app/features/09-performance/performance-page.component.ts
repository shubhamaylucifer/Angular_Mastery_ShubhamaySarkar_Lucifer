/**
 * ============================================================================
 * FILE: performance-page.component.ts   (MODULE 09 page)
 * ============================================================================
 * WHAT IS THIS?
 *   @defer with every trigger (viewport, interaction, hover, idle, timer, when,
 *   prefetch) and sub-blocks (@placeholder, @loading, @error), NgOptimizedImage,
 *   a real Web Worker and the memory-leak demo.
 *
 * REAL-WORLD ANALOGY:
 *   Just-in-time delivery: parts are brought to the assembly line exactly when
 *   needed instead of stuffing the whole factory with stock on day one.
 *
 * WHY DO WE NEED IT?
 *   Users leave slow sites. Loading less up-front and keeping the main thread
 *   free keeps the UI fast.
 *
 * COMMON BEGINNER MISTAKE:
 *   Putting @defer around content that is above the fold with `on viewport` -
 *   it triggers instantly. Defer things users reach LATER.
 * ============================================================================
 */
import { IMAGE_LOADER, ImageLoaderConfig, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { LogService } from '../../core/services/log.service';
import { FeaturePageComponent } from '../../shared/components/feature-page.component';
import { HeavyWidgetComponent } from './heavy-widget.component';
import { LeakDemoComponent } from './leak-demo.component';

const SRC = '09-performance';

@Component({
  selector: 'app-performance-page',
  imports: [FeaturePageComponent, HeavyWidgetComponent, LeakDemoComponent, NgOptimizedImage],
  // An IMAGE_LOADER turns (src, width) into a real URL. placeholder and srcset need one.
  providers: [{ provide: IMAGE_LOADER, useValue: (c: ImageLoaderConfig) => `https://picsum.photos/id/${c.src}/${c.width ?? 400}/240` }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-feature-page
      title="09 Performance, Deferrable Views & Memory"
      subtitle="Load less, block less, leak nothing."
      level="Advanced"
      source="09-performance"
      [bullets]="bullets"
    >
      <section class="card">
        <h2>A. &#64;defer triggers</h2>
        <p class="muted">Each block below lazy-loads <code>HeavyWidgetComponent</code> differently. Scroll, click, hover and watch the log.</p>
        <div class="grid-2">
          <div class="box">
            <strong>on interaction</strong> + prefetch on idle
            @defer (on interaction; prefetch on idle) {
              <app-heavy-widget label="on interaction" />
            } @placeholder {
              <button class="btn" type="button">Click me to load</button>
            } @loading (minimum 400ms) {
              <p>Loading...</p>
            } @error {
              <p class="err">Failed to load</p>
            }
          </div>

          <div class="box">
            <strong>on hover</strong>
            @defer (on hover) {
              <app-heavy-widget label="on hover" />
            } @placeholder {
              <div class="muted">Hover this area</div>
            }
          </div>

          <div class="box">
            <strong>on timer(3s)</strong>
            @defer (on timer(3s)) {
              <app-heavy-widget label="on timer" />
            } @placeholder { <div class="muted">Appears 3s after the page shows</div> }
          </div>

          <div class="box">
            <strong>on idle</strong>
            @defer (on idle) {
              <app-heavy-widget label="on idle" />
            } @placeholder { <div class="muted">waiting for browser idle</div> }
          </div>

          <div class="box">
            <strong>when (condition)</strong>
            <label><input type="checkbox" [checked]="flag()" (change)="flag.set(!flag())" /> load when ticked</label>
            @defer (when flag()) {
              <app-heavy-widget label="when condition" />
            } @placeholder { <div class="muted">tick the box</div> }
          </div>
        </div>

        <div style="height: 320px" class="muted">&darr; scroll down: the next block loads <code>on viewport</code> &darr;</div>
        <div class="box">
          <strong>on viewport</strong>
          @defer (on viewport) {
            <app-heavy-widget label="on viewport" />
          } @placeholder { <div style="min-height:40px" class="muted">placeholder (needs a real element to observe)</div> }
        </div>
      </section>

      <section class="card">
        <h2>B. NgOptimizedImage</h2>
        <p class="muted"><code>ngSrc</code> + required width/height prevents layout shift; <code>priority</code> preloads the LCP image; <code>placeholder</code> shows a blurred preview.</p>
        <div class="row">
          <img ngSrc="237" width="400" height="240" priority alt="A black puppy (priority image, loads first)" />
          <img ngSrc="1025" width="400" height="240" placeholder alt="A pug (lazy loaded with placeholder)" />
        </div>
      </section>

      <section class="card">
        <h2>C. Web Worker</h2>
        <div class="row">
          <button class="btn danger" type="button" (click)="blockMain()">Count primes on MAIN thread (freezes UI)</button>
          <button class="btn primary" type="button" (click)="useWorker()">Count primes in WEB WORKER</button>
          <input type="range" min="0" max="100" [value]="spin()" (input)="spin.set(+$any($event.target).value)" aria-label="Try to drag me while counting" />
        </div>
        <p>Result: <strong>{{ workerResult() }}</strong> &nbsp; <span class="muted">Drag the slider while the worker runs: it stays smooth.</span></p>
      </section>

      <section class="card">
        <h2>D. Memory leak prevention</h2>
        <app-leak-demo />
      </section>
    </app-feature-page>
  `,
})
export class PerformancePageComponent {
  private readonly log = inject(LogService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly flag = signal(false);
  protected readonly spin = signal(50);
  protected readonly workerResult = signal('-');
  private worker?: Worker;

  protected readonly bullets = [
    '@defer splits a component into its own chunk. Triggers decide WHEN it loads; prefetch decides when it is downloaded.',
    '@placeholder shows before loading, @loading during, @error if the chunk fails.',
    'NgOptimizedImage needs width+height, lazy-loads by default, and priority marks the hero image.',
    'A Web Worker runs CPU-heavy code on another thread so the page never freezes.',
    'Manual subscriptions leak unless you use takeUntilDestroyed() or DestroyRef.',
  ];

  constructor() {
    this.destroyRef.onDestroy(() => this.worker?.terminate());
  }

  protected blockMain(): void {
    this.log.warn(SRC, 'counting primes on the MAIN thread - the page will freeze for a moment...');
    // setTimeout lets the log line paint before we block.
    setTimeout(() => {
      const t0 = performance.now();
      let count = 0;
      for (let n = 2; n <= 3_000_000; n++) { let p = true; for (let d = 2; d * d <= n; d++) { if (n % d === 0) { p = false; break; } } if (p) count++; }
      this.workerResult.set(`${count} primes (main thread, ${Math.round(performance.now() - t0)}ms)`);
      this.log.info(SRC, 'main-thread work finished');
    }, 50);
  }

  protected useWorker(): void {
    if (typeof Worker === 'undefined') { this.log.error(SRC, 'Web Workers not supported here'); return; }
    this.worker ??= new Worker(new URL('./prime.worker', import.meta.url), { type: 'module' });
    const t0 = performance.now();
    this.worker.onmessage = ({ data }: MessageEvent<number>) => {
      this.workerResult.set(`${data} primes (worker, ${Math.round(performance.now() - t0)}ms)`);
      this.log.success(SRC, 'worker answered; UI stayed responsive');
    };
    this.log.info(SRC, 'postMessage(3,000,000) sent to worker');
    this.worker.postMessage(3_000_000);
  }
}
