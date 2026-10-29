/**
 * ============================================================================
 * FILE: resource-demo.component.ts   (Module 02 - resource & rxResource)
 * ============================================================================
 * WHAT IS THIS?
 *   `resource()` and `rxResource()` load ASYNC data declaratively. You describe
 *   "which id do I want" (`params`) and "how to fetch it" (`loader`/`stream`);
 *   Angular re-fetches when the params signal changes, cancels the old request
 *   (AbortSignal / unsubscribe), and exposes status signals:
 *   value(), isLoading(), error(), status(), reload().
 *
 * REAL-WORLD ANALOGY:
 *   A standing order at a cafe: "bring me the coffee of whoever is at table N".
 *   Change N and the barista drops the old cup and prepares a new one.
 *
 * WHY DO WE NEED IT?
 *   Hand-written loading flags, error flags and "ignore stale response" logic
 *   is boilerplate and a classic source of race-condition bugs.
 *
 * COMMON BEGINNER MISTAKE:
 *   Reading `value()` while the resource has an error - it THROWS. Check
 *   `hasValue()` / `error()` first, or use a defaultValue.
 *   (Both APIs are marked experimental in Angular 21.)
 * ============================================================================
 */
import { ChangeDetectionStrategy, Component, inject, resource, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FakeUser, fakeUser$, fetchFakeUser } from '../../core/services/fake-api';
import { LogService } from '../../core/services/log.service';

const SRC = '02-signals';

@Component({
  selector: 'app-resource-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="row">
      <button class="btn" type="button" (click)="id.update(v => Math.max(1, v - 1))">&minus; id</button>
      <strong>id = {{ id() }}</strong>
      <button class="btn" type="button" (click)="id.update(v => v + 1)">+ id</button>
      <button class="btn" type="button" (click)="jump13()">jump to 13 (server error)</button>
      <button class="btn" type="button" (click)="fast()">click +id 3x fast (cancellation)</button>
    </div>

    <div class="grid-2">
      <div class="box stack">
        <h3>resource() - Promise loader</h3>
        <p class="muted">status: {{ userRes.status() }} | isLoading: {{ userRes.isLoading() }}</p>
        @if (userRes.isLoading()) {
          <p>Loading...</p>
        } @else if (userRes.error()) {
          <p class="err">{{ userRes.error()?.message }}</p>
        } @else if (userRes.hasValue()) {
          <p><strong>{{ userRes.value().name }}</strong> from {{ userRes.value().city }}</p>
        }
        <button class="btn" type="button" (click)="userRes.reload()">reload()</button>
      </div>

      <div class="box stack">
        <h3>rxResource() - Observable stream</h3>
        <p class="muted">status: {{ rxRes.status() }} | isLoading: {{ rxRes.isLoading() }}</p>
        @if (rxRes.isLoading()) {
          <p>Loading...</p>
        } @else if (rxRes.error()) {
          <p class="err">{{ rxRes.error()?.message }}</p>
        } @else if (rxRes.hasValue()) {
          <p><strong>{{ rxRes.value().name }}</strong> from {{ rxRes.value().city }}</p>
        }
        <button class="btn" type="button" (click)="rxRes.reload()">reload()</button>
      </div>
    </div>
  `,
})
export class ResourceDemoComponent {
  private readonly log = inject(LogService);
  protected readonly Math = Math; // expose to template
  protected readonly id = signal(1);

  /**
   * resource():
   *  - params : reactive function; when `id()` changes the loader re-runs.
   *  - loader : receives { params, abortSignal }. Pass abortSignal to fetch()
   *             so Angular can CANCEL the previous request automatically.
   */
  protected readonly userRes = resource<FakeUser, number>({
    params: () => this.id(),
    loader: async ({ params: id, abortSignal }) => {
      this.log.info(SRC, `resource loader started for id ${id}`);
      abortSignal.addEventListener('abort', () => this.log.warn(SRC, `  AbortSignal fired: request for id ${id} cancelled`));
      return fetchFakeUser(id, abortSignal);
    },
  });

  /** rxResource(): same idea but the loader is called `stream` and returns an Observable. */
  protected readonly rxRes = rxResource<FakeUser, number>({
    params: () => this.id(),
    stream: ({ params: id }) => {
      this.log.info(SRC, `rxResource stream subscribed for id ${id}`);
      return fakeUser$(id);
    },
  });

  protected jump13(): void { this.id.set(13); }
  protected fast(): void { this.id.update((v) => v + 1); this.id.update((v) => v + 1); queueMicrotask(() => this.id.update((v) => v + 1)); }
}
