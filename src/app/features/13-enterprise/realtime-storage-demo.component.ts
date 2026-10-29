/**
 * ============================================================================
 * FILE: realtime-storage-demo.component.ts   (MODULE 13 - Real-time & Storage)
 * ============================================================================
 * WHAT IS THIS?
 *   Part 1 - A LIVE TICKER (stock-price style) built as an RxJS stream with
 *            AUTO-RECONNECT. The "server" is simulated in the browser so no
 *            real WebSocket server is needed, but the shape of the code is the
 *            same as with the real `webSocket()` helper (shown in the notes).
 *   Part 2 - Type-safe localStorage / sessionStorage as SIGNALS
 *            (see core/services/storage.service.ts).
 *
 * REAL-WORLD ANALOGY:
 *   A WebSocket is a phone call that stays open: the server can speak any time
 *   (a normal HTTP request is sending a letter and waiting for a reply).
 *   Auto-reconnect = redialling when the line drops, waiting a bit longer
 *   after every failed attempt so you don't spam the other person.
 *
 * WHY DO WE NEED IT?
 *   Chats, dashboards, trading screens and notifications need data PUSHED to the
 *   browser the moment it changes, not polled every few seconds.
 *
 * COMMON BEGINNER MISTAKE:
 *   Never unsubscribing. A live stream never completes by itself, so a component
 *   that forgets to unsubscribe keeps receiving data (and leaking memory) after
 *   the user left the page. We use takeUntilDestroyed() to avoid that.
 *
 * REAL WEBSOCKET VERSION (needs a real server, e.g. wss://example.com/feed):
 *     import { webSocket } from 'rxjs/webSocket';
 *     const socket$ = webSocket<Tick>('wss://example.com/feed');
 *     socket$.pipe(retry({ delay: (e, n) => timer(Math.min(1000 * 2 ** n, 15000)) }))
 *            .subscribe(tick => ...);
 *     socket$.next({ subscribe: 'ACME' });   // send a message to the server
 * ============================================================================
 */
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { Observable, Subscription, retry, timer } from 'rxjs';
import { LogService } from '../../core/services/log.service';
import { StorageService } from '../../core/services/storage.service';

const SRC = '13-enterprise';

interface Tick {
  readonly symbol: string;
  readonly price: number;
  readonly at: string;
}

@Component({
  selector: 'app-realtime-storage-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="card">
      <h2>1. Live ticker with auto-reconnect (simulated WebSocket)</h2>
      <div class="row">
        <button class="btn primary" type="button" (click)="connect()" [disabled]="status() !== 'disconnected'">Connect</button>
        <button class="btn" type="button" (click)="dropConnection()" [disabled]="status() !== 'connected'">Simulate network drop</button>
        <button class="btn" type="button" (click)="disconnect()" [disabled]="status() === 'disconnected'">Disconnect</button>
        <span class="badge" [class.Beginner]="status() === 'connected'" [class.Intermediate]="status() === 'reconnecting'" [class.Advanced]="status() === 'disconnected'">{{ status() }}</span>
      </div>
      @if (last(); as t) {
        <p class="price">{{ t.symbol }} <strong>{{ t.price.toFixed(2) }}</strong> <span class="muted">at {{ t.at }}</span></p>
        <p>Ticks received: <strong>{{ count() }}</strong> &middot; Average: <strong>{{ average().toFixed(2) }}</strong></p>
      } @else {
        <p class="muted">No data yet. Press Connect.</p>
      }
    </section>

    <section class="card">
      <h2>2. Reactive storage (signals &harr; localStorage / sessionStorage)</h2>
      <p class="muted">
        Edit a value, then refresh the page: it is still there. Open this app in a second tab and
        change the local value: this tab updates by itself (the browser "storage" event).
      </p>
      <div class="grid-3">
        <div>
          <label for="nick">Nickname (localStorage)</label>
          <input id="nick" [value]="nickname()" (input)="nickname.set($any($event.target).value)" />
        </div>
        <div>
          <label>Theme (localStorage)</label>
          <button class="btn" type="button" (click)="toggleTheme()">{{ theme() }} &mdash; toggle</button>
        </div>
        <div>
          <label>Visits this TAB (sessionStorage)</label>
          <button class="btn" type="button" (click)="visits.set(visits() + 1)">{{ visits() }} &mdash; +1</button>
        </div>
      </div>
      <p class="muted">Hello <strong>{{ greeting() }}</strong>. Open DevTools &rarr; Application &rarr; Storage to see the keys.</p>
    </section>
  `,
  styles: `
    .price { font-size: 1.4rem; margin: .5rem 0 0; }
  `,
})
export class RealtimeStorageDemoComponent {
  private readonly log = inject(LogService);
  private readonly storage = inject(StorageService);
  private readonly destroyRef = inject(DestroyRef);

  // ---------- Part 1: ticker -------------------------------------------------
  protected readonly status = signal<'disconnected' | 'connected' | 'reconnecting'>('disconnected');
  protected readonly last = signal<Tick | null>(null);
  protected readonly count = signal(0);
  private readonly total = signal(0);
  protected readonly average = computed(() => (this.count() === 0 ? 0 : this.total() / this.count()));

  private sub?: Subscription;
  private price = 100;
  /** Set to true by "Simulate network drop"; the fake server then errors once. */
  private dropNext = false;
  private attempt = 0;

  /**
   * The fake "socket". `new Observable(subscriber => {...})` is a stream we
   * control manually: next() = a message arrived, error() = connection broke,
   * the returned function = teardown (closing the socket).
   */
  private readonly socket$ = new Observable<Tick>((subscriber) => {
    this.attempt++;
    // Pretend the first reconnect attempt after a drop fails, to show the back-off.
    if (this.attempt === 2) {
      subscriber.error(new Error('connect failed (simulated)'));
      return;
    }
    this.status.set('connected');
    this.log.success(SRC, `socket: connected (attempt ${this.attempt})`);
    const id = setInterval(() => {
      if (this.dropNext) {
        this.dropNext = false;
        subscriber.error(new Error('connection lost (simulated)'));
        return;
      }
      this.price = Math.max(1, this.price + (Math.random() - 0.5) * 2);
      subscriber.next({ symbol: 'ACME', price: this.price, at: new Date().toLocaleTimeString() });
    }, 800);
    return () => clearInterval(id); // teardown: closes the "socket"
  });

  protected connect(): void {
    this.attempt = 0;
    this.sub?.unsubscribe();
    this.sub = this.socket$
      .pipe(
        // retry(): when the stream ERRORS, subscribe again (= reconnect).
        // `delay` gets (error, retryNumber) and returns a notifier; we wait
        // 1s, 2s, 4s ... (exponential back-off) capped at 8s.
        retry({
          delay: (err: unknown, retryNumber: number) => {
            const wait = Math.min(1000 * 2 ** (retryNumber - 1), 8000);
            this.status.set('reconnecting');
            this.log.warn(SRC, `socket: ${(err as Error).message} -> reconnecting in ${wait}ms (retry #${retryNumber})`);
            return timer(wait);
          },
        }),
        takeUntilDestroyed(this.destroyRef), // stop when the page is left
      )
      .subscribe((tick) => {
        this.last.set(tick);
        this.count.update((n) => n + 1);
        this.total.update((t) => t + tick.price);
      });
  }

  protected dropConnection(): void {
    this.dropNext = true;
    this.log.warn(SRC, 'simulating a network drop...');
  }

  protected disconnect(): void {
    this.sub?.unsubscribe(); // triggers the teardown above
    this.status.set('disconnected');
    this.log.info(SRC, 'socket: closed by user');
  }

  // ---------- Part 2: storage ------------------------------------------------
  // These are created in a field initialiser = an injection context, as required.
  protected readonly nickname = this.storage.persistentSignal('nickname', 'Learner');
  protected readonly theme = this.storage.persistentSignal('theme', 'light');
  protected readonly visits = this.storage.persistentSignal('visits', 0, 'session');
  protected readonly greeting = computed(() => `${this.nickname()} (${this.theme()} theme)`);

  protected toggleTheme(): void {
    this.theme.update((t) => (t === 'light' ? 'dark' : 'light'));
    this.log.info(SRC, `theme saved to localStorage: ${this.theme()}`);
  }
}
