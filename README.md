# Angular Mastery Showcase — The Fresher's Textbook

A hands-on reference repo covering Angular **21.2** and **RxJS 7.8**, from your first `{{ }}` to enterprise patterns. Every source file starts with a plain-English header (*What is this? / Real-World Analogy / Why do we need it? / Common Beginner Mistake*). Every screen has a collapsible **Fresher's Study Card**, a live demo and an **on-screen event log**.

> Verified in this repo: `ng build` (development and production) and `ng test` (22 tests) pass. The tests run on **Vitest**, not Karma.

---

## Table of Contents
1. [Welcome & How to Study](#1-welcome--how-to-study-this-repo)
2. [How Angular Boots](#2-how-angular-actually-boots-up)
3. [Project Architecture](#3-project-architecture--folder-guide)
4. [Encyclopedia of Topics (Modules 01–13)](#4-encyclopedia-of-every-topic)
5. [Glossary](#5-angular-glossary-for-beginners)
6. [Setup & Commands](#6-setup--commands-guide)
7. [Version Notes](#7-version-notes-read-this-if-a-tutorial-disagrees)

---

## 1. Welcome & How to Study This Repo

Do **not** read the code top to bottom. Follow the sidebar order (Beginner → Intermediate → Advanced). For each module:

1. Open the page in the browser and read the **Study Card** (5 bullet points).
2. Click the demo buttons and watch the **Event Log** at the bottom.
3. Open the linked `.ts` file and read the header, then the comments.
4. Re-read the matching section in this README and try the **Interview Tip** out loud.

| Order | Module | Level | Why this order |
|---|---|---|---|
| 1 | 01 Components & Templates | Beginner | Everything in Angular is a component. |
| 2 | 02 Signals & Resource API | Beginner | The modern way to hold changing data. |
| 3 | 03 RxJS Mastery | Beginner→Intermediate | Streams power HTTP, forms and the router. |
| 4 | 04 Directives & Pipes | Beginner | Small reusable template helpers. |
| 5 | 05 Forms | Intermediate | Real apps are full of forms. |
| 6 | 06 Dependency Injection | Intermediate | How services reach components. |
| 7 | 07 Routing & Guards | Intermediate | Multi-page apps and access control. |
| 8 | 08 HTTP & Interceptors | Intermediate | Talking to servers. |
| 9 | 09 Performance & `@defer` | Advanced | Making it fast and leak-free. |
| 10 | 10 Security, a11y, i18n | Advanced | Safe and usable for everyone. |
| 11 | 11 SSR & Hydration | Advanced | Server rendering concepts. |
| 12 | 12 Testing | Advanced | Proving it works. |
| 13 | 13 Enterprise Ecosystem | Advanced | Templates deep-dive, CDK, animations, real-time. |

---

## 2. How Angular Actually Boots Up

```
index.html  ──►  main.ts  ──►  bootstrapApplication(App, appConfig)  ──►  <app-root> appears
                                          │
                              app.config.ts (providers)
```

1. **[`src/index.html`](src/index.html)** contains one empty tag: `<app-root></app-root>`. It is a placeholder.
2. **[`src/main.ts`](src/main.ts)** is the first TypeScript file the browser runs. It calls `bootstrapApplication(App, appConfig)`: "start Angular, use `App` as the first component, and use this configuration."
3. **[`src/app/app.config.ts`](src/app/app.config.ts)** is the wiring diagram: router, HTTP client + interceptors, global error handler, zoneless change detection, animations and `provideAppInitializer`. There is no `AppModule` any more.
4. **[`src/app/app.ts`](src/app/app.ts)** (+ [`app.html`](src/app/app.html), [`app.scss`](src/app/app.scss)) is the root component: the sidebar, breadcrumb header and `<router-outlet>`. The router decides which page component to place in the outlet.
5. **[`src/app/app.routes.ts`](src/app/app.routes.ts)** maps URLs (`/03-rxjs`) to lazy-loaded page components.

Note: `app.ts` is the root component (class `App`). Older tutorials call it `AppComponent` in `app.component.ts`.

---

## 3. Project Architecture & Folder Guide

```
Angular Revision/
├── angular.json            # build config (fileReplacements, styles, web worker tsconfig)
├── tsconfig.json           # strict TS: strict, noImplicitOverride, noUncheckedIndexedAccess
├── tsconfig.worker.json    # separate TS settings for *.worker.ts
├── package.json
├── public/                 # static assets copied as-is
└── src/
    ├── main.ts             # entry point
    ├── index.html
    ├── styles.scss         # global styles
    ├── environments/       # environment.ts (prod) + environment.development.ts
    └── app/
        ├── app.ts / app.html / app.scss / app.config.ts / app.routes.ts
        ├── core/           # app-wide SINGLETONS, loaded once
        │   ├── services/       log, toast, auth, app-config, cart.store, storage, fake-api
        │   ├── interceptors/   auth, cache, retry, error, http-context (tokens)
        │   ├── guards/         auth.guards.ts (4 functional guards)
        │   ├── error/          global-error-handler.ts
        │   ├── router/         router-strategies.ts (TitleStrategy, PreloadingStrategy)
        │   ├── nav.config.ts   sidebar data
        │   └── tokens.ts       InjectionTokens (API_URL)
        ├── shared/         # REUSABLE pieces, no app-specific logic
        │   ├── components/     study-card, event-log, feature-page, toast-container, star-rating
        │   ├── directives/     directives.ts
        │   ├── pipes/          pipes.ts
        │   └── validators/     validators.ts
        ├── features/       # one LAZY-LOADED folder per lesson, in study order
        │   ├── 01-components/  … 13-enterprise/
        │   ├── home.component.ts
        │   └── not-found.component.ts
        └── models/         # interfaces, types, enums (no logic)
```

**Why split like this?**
- **`core/`** = things that must exist **exactly once** (a logger, auth state, interceptors). Features may import from `core`; `core` never imports from `features`.
- **`shared/`** = building blocks that **many features reuse** and that know nothing about any feature.
- **`features/`** = **one folder per topic**. Each is lazy-loaded, so the browser downloads it only when visited. Numbers tell you the study order.
- **`models/`** = shared data shapes, so everyone agrees what a `User` looks like.

The shared layout lives in [`feature-page.component.ts`](src/app/shared/components/feature-page.component.ts), which wraps every page with the Study Card ([`study-card.component.ts`](src/app/shared/components/study-card.component.ts)) and the Event Log ([`event-log.component.ts`](src/app/shared/components/event-log.component.ts)). Messages come from [`log.service.ts`](src/app/core/services/log.service.ts).

---

## 4. Encyclopedia of Every Topic

Each entry: **File → Definition → Analogy → Snippet & breakdown → Interview tip.**

---

### MODULE 01 — Components, Templates & Dynamic Rendering
Files live in [`src/app/features/01-components/`](src/app/features/01-components/).

#### 01.1 Interpolation `{{ }}`
- **File:** [`binding-demo.component.ts`](src/app/features/01-components/binding-demo.component.ts)
- **Definition:** Prints a TypeScript value as text inside HTML.
- **Analogy:** A mail-merge field: "Dear `{{name}}`".
```html
<h1>Hello {{ name() }}</h1>
```
`name()` is a signal read; the text updates itself when the signal changes.
- **Interview tip:** "Interpolation is one-way, class → template, and Angular escapes the output, so it is XSS-safe."

#### 01.2 Property Binding `[ ]`
- **File:** [`binding-demo.component.ts`](src/app/features/01-components/binding-demo.component.ts)
- **Definition:** Sets a DOM *property* (not an HTML attribute) from a value.
- **Analogy:** Wiring a light switch to a lamp: change the switch, the lamp follows.
```html
<button [disabled]="isBusy()">Save</button>
```
`[disabled]` is the property; `isBusy()` is the expression.
- **Interview tip:** "Attributes initialise the DOM; properties are the live state. Binding targets properties."

#### 01.3 Event Binding `( )`
- **File:** [`binding-demo.component.ts`](src/app/features/01-components/binding-demo.component.ts)
- **Definition:** Runs a method when a DOM event fires.
- **Analogy:** A doorbell that triggers a function.
```html
<button (click)="save($event)">Save</button>
```
`$event` is the browser event object.
- **Interview tip:** "Parentheses mean data flows *out* of the template into the class."

#### 01.4 Two-Way Binding `[( )]`
- **File:** [`binding-demo.component.ts`](src/app/features/01-components/binding-demo.component.ts)
- **Definition:** A shorthand combining `[value]` and `(valueChange)`.
- **Analogy:** A walkie-talkie: both sides send and receive.
```html
<input [(ngModel)]="city" />
```
`ngModel` reads `city` and writes back on every keystroke.
- **Interview tip:** "Banana-in-a-box `[()]` is sugar for `[x]` + `(xChange)`."

#### 01.5 `@if` / `@else`
- **File:** [`binding-demo.component.ts`](src/app/features/01-components/binding-demo.component.ts)
- **Definition:** Built-in control flow that renders a block only when a condition is true.
- **Analogy:** A bouncer who lets a block in only if the condition passes.
```html
@if (user(); as u) { <p>Hi {{ u.name }}</p> } @else { <p>Log in</p> }
```
`as u` names the truthy value.
- **Interview tip:** "`@if` replaced `*ngIf`; it needs no import and is faster."

#### 01.6 `@for`, `track`, `$index`, `$first`, `$last`, `$even`, `$odd`, `$count`, `@empty`
- **File:** [`binding-demo.component.ts`](src/app/features/01-components/binding-demo.component.ts)
- **Definition:** Repeats a block per item. `track` tells Angular which DOM node belongs to which item.
- **Analogy:** Name tags at a party: if guests reorder, tags let staff move people rather than rebuild them.
```html
@for (t of todos(); track t.id; let i = $index, last = $last) {
  <li>{{ i + 1 }}/{{ $count }} {{ t.title }}</li>
} @empty { <li>Nothing yet</li> }
```
`track t.id` reuses DOM nodes; `@empty` renders for an empty list.
- **Interview tip:** "`track` is mandatory so Angular does minimal DOM work. Track a unique id, never `$index` for reorderable lists."

#### 01.7 `@switch` / `@case`
- **File:** [`binding-demo.component.ts`](src/app/features/01-components/binding-demo.component.ts)
- **Definition:** Picks one block among many by value.
- **Analogy:** A train-station departure board choosing one platform.
```html
@switch (role()) { @case ('ADMIN') { <b>Admin</b> } @default { <i>Guest</i> } }
```
- **Interview tip:** "Cleaner than a chain of `@if`s when comparing one value."

#### 01.8 `@let`
- **File:** [`binding-demo.component.ts`](src/app/features/01-components/binding-demo.component.ts)
- **Definition:** A local, read-only variable inside a template.
- **Analogy:** A sticky note holding an intermediate result.
```html
@let total = price() * qty();
<p>{{ total }}</p>
```
- **Interview tip:** "Avoids calling an expensive expression repeatedly or writing `| async as x` wrappers."

#### 01.9 Lifecycle Hooks (Init → Destroy, `afterEveryRender`, `afterNextRender`)
- **File:** [`lifecycle-demo.component.ts`](src/app/features/01-components/lifecycle-demo.component.ts)
- **Definition:** Methods Angular calls at moments in a component's life: `ngOnChanges`, `ngOnInit`, `ngDoCheck`, `ngAfterContentInit/Checked`, `ngAfterViewInit/Checked`, `ngOnDestroy`.
- **Analogy:** A person's life: birth (`OnInit`), changes (`OnChanges`), and goodbye (`OnDestroy`).
```ts
export class Demo implements OnInit, OnDestroy {
  ngOnInit() { /* inputs are ready, fetch data */ }
  ngOnDestroy() { /* clean up */ }
  constructor() { afterNextRender(() => { /* browser-only, once */ }); }
}
```
- **Interview tip:** "Constructor = wiring; `ngOnInit` = first safe moment to use inputs. In v21 `afterRender` is named `afterEveryRender`."

#### 01.10 Signal inputs: `input()`, `input.required()`, `transform`, `alias`
- **File:** [`communication-demo.component.ts`](src/app/features/01-components/communication-demo.component.ts)
- **Definition:** Parent → child data as a *signal*.
- **Analogy:** A mailbox slot on the child's door.
```ts
name  = input.required<string>();
size  = input(10, { transform: numberAttribute, alias: 'fontSize' });
```
`required` forces the parent to supply it; `transform` converts text to a number; `alias` renames the HTML attribute.
- **Interview tip:** "Signal inputs are read-only, work with `computed`, and replace `@Input()`."

#### 01.11 `output()` and `outputFromObservable()`
- **File:** [`communication-demo.component.ts`](src/app/features/01-components/communication-demo.component.ts)
- **Definition:** Child → parent events.
- **Analogy:** A child ringing a bell the parent listens for.
```ts
saved = output<string>();
this.saved.emit('done');   // parent: (saved)="onSaved($event)"
```
- **Interview tip:** "`output()` replaces `@Output() + EventEmitter`; it is not an Observable you subscribe to."

#### 01.12 `model()` two-way signals
- **File:** [`communication-demo.component.ts`](src/app/features/01-components/communication-demo.component.ts)
- **Definition:** An input *and* output pair in one writable signal.
- **Analogy:** A shared whiteboard both rooms can write on.
```ts
count = model(0);        // parent: <app-x [(count)]="n" />
```
- **Interview tip:** "`model()` is the modern way to build two-way bindable components."

#### 01.13 Queries: `viewChild`, `viewChildren`, `contentChild`, `contentChildren`, `@ViewChild`
- **File:** [`communication-demo.component.ts`](src/app/features/01-components/communication-demo.component.ts)
- **Definition:** Let a component grab elements/components in its own template (*view*) or projected content (*content*).
- **Analogy:** `getElementById` but type-safe and reactive.
```ts
box = viewChild.required<ElementRef>('box');
items = contentChildren(ItemComponent);
```
- **Interview tip:** "View queries see the component's own template; content queries see what the parent projected in. Signal queries replace decorators."

#### 01.14 Content projection: `<ng-content>`, `select`, `ngProjectAs`
- **File:** [`communication-demo.component.ts`](src/app/features/01-components/communication-demo.component.ts), and the multi-slot [`FancyBoxComponent`](src/app/features/13-enterprise/templates-demo.component.ts)
- **Definition:** The parent supplies HTML that the child places in named slots.
- **Analogy:** A picture frame: the frame is the child, the photo is the parent's.
```html
<ng-content select="[card-title]" />
<ng-content />
```
- **Interview tip:** "Projected content is created by the *parent*, so its lifecycle and DI belong to the parent."

#### 01.15 Dynamic components
- **File:** [`dynamic-demo.component.ts`](src/app/features/01-components/dynamic-demo.component.ts)
- **Definition:** Create components in code (`ViewContainerRef.createComponent`) or via `*ngComponentOutlet`.
- **Analogy:** Printing a new sticker on demand rather than pre-printing all.
```ts
const ref = this.vcr.createComponent(Widget);
ref.setInput('title', 'Hi');
```
- **Interview tip:** "Use `setInput()` so signal inputs and change detection work. Destroy refs you create."

#### 01.16 View Encapsulation
- **File:** [`encapsulation-demo.component.ts`](src/app/features/01-components/encapsulation-demo.component.ts)
- **Definition:** Controls whether a component's CSS leaks. `Emulated` (default), `ShadowDom`, `None`.
- **Analogy:** `Emulated` = private room with a lock; `None` = shouting in an open-plan office.
```ts
@Component({ encapsulation: ViewEncapsulation.None, ... })
```
- **Interview tip:** "Default `Emulated` adds `_ngcontent-xxx` attributes so styles stay scoped."

---

### MODULE 02 — Signals & Resource API
Files: [`src/app/features/02-signals/`](src/app/features/02-signals/).

#### 02.1 `signal()`, `computed()`
- **File:** [`signals-demo.component.ts`](src/app/features/02-signals/signals-demo.component.ts)
- **Definition:** `signal` is a value box that notifies readers on change. `computed` derives a value and caches it.
- **Analogy:** Excel: `A1` is a signal, `B1 = A1*2` is computed.
```ts
const n = signal(1);
const double = computed(() => n() * 2);
n.set(5);   // double() === 10
```
- **Interview tip:** "Signals are synchronous, always have a value, and enable fine-grained updates and zoneless apps."

#### 02.2 `effect()` and `onCleanup`
- **File:** [`signals-demo.component.ts`](src/app/features/02-signals/signals-demo.component.ts)
- **Definition:** Runs side effects when signals it read change.
- **Analogy:** A smoke alarm that reacts to changes.
```ts
effect((onCleanup) => {
  const id = setInterval(tick, n());
  onCleanup(() => clearInterval(id));
});
```
- **Interview tip:** "Use `effect` for side effects (logging, storage), not to derive state. Derive with `computed`."

#### 02.3 `untracked()` and custom equality
- **File:** [`signals-demo.component.ts`](src/app/features/02-signals/signals-demo.component.ts)
- **Definition:** `untracked` reads a signal without subscribing. `equal` decides when a "change" is real.
- **Analogy:** Peeking at a scoreboard without promising to watch it.
```ts
const p = signal(obj, { equal: (a, b) => a.id === b.id });
effect(() => log(untracked(other)));
```
- **Interview tip:** "Default equality is `===`, so mutating an object in place will not notify."

#### 02.4 `linkedSignal()`
- **File:** [`signals-demo.component.ts`](src/app/features/02-signals/signals-demo.component.ts)
- **Definition:** A writable signal that resets when its source changes.
- **Analogy:** A "selected seat" that resets when you change the cinema.
```ts
const selected = linkedSignal(() => options()[0]);
```
- **Interview tip:** "`computed` is read-only; `linkedSignal` is derived *and* writable."

#### 02.5 `resource()` and `rxResource()`
- **File:** [`resource-demo.component.ts`](src/app/features/02-signals/resource-demo.component.ts)
- **Definition:** Declarative async loading that re-runs when `params` change, auto-cancels (`abortSignal`), and exposes `value()`, `isLoading()`, `error()`, `reload()`.
- **Analogy:** A smart thermostat that re-reads when you pick another room.
```ts
user = resource({
  params: () => ({ id: this.id() }),
  loader: ({ params, abortSignal }) => fetchUser(params.id, abortSignal),
});
```
- **Interview tip:** "`resource` = Promise loader; `rxResource` = Observable loader (`stream`). Both cancel stale requests."

#### 02.6 Signal Store (cart / state)
- **File:** [`src/app/core/services/cart.store.ts`](src/app/core/services/cart.store.ts), demo in [`store-and-cd-demo.component.ts`](src/app/features/02-signals/store-and-cd-demo.component.ts)
- **Definition:** A `providedIn: 'root'` service holding private writable signals and exposing read-only signals + methods.
- **Analogy:** A bank: you can ask it to deposit, but cannot edit the ledger directly.
```ts
private _items = signal<CartItem[]>([]);
readonly items = this._items.asReadonly();
readonly total = computed(() => this._items().reduce(...));
```
- **Interview tip:** "Expose read-only signals plus intention-named methods; no NgRx required for modest apps."

#### 02.7 Change detection: `Default` vs `OnPush`, `ChangeDetectorRef`, zoneless
- **File:** [`store-and-cd-demo.component.ts`](src/app/features/02-signals/store-and-cd-demo.component.ts); config in [`app.config.ts`](src/app/app.config.ts)
- **Definition:** Change detection decides when the screen refreshes. `OnPush` checks only on input change/event/signal. Zoneless removes Zone.js entirely.
- **Analogy:** `Default` = a teacher re-checking every desk; `OnPush` = only desks that raised a hand.
```ts
provideZonelessChangeDetection()   // in app.config.ts
changeDetection: ChangeDetectionStrategy.OnPush
```
- **Interview tip:** "In v21 it is `provideZonelessChangeDetection()` (stable; the Experimental name is gone). Signals, events and `markForCheck` trigger updates."

---

### MODULE 03 — RxJS Mastery
Files: [`src/app/features/03-rxjs/`](src/app/features/03-rxjs/).

#### 03.1 Observable vs Promise; cold vs hot; custom Observable & teardown
- **File:** [`core-demo.component.ts`](src/app/features/03-rxjs/core-demo.component.ts)
- **Definition:** An Observable is a lazy stream of 0..n values you can cancel. A Promise yields one value, eagerly, and cannot be cancelled. Cold = each subscriber gets its own run; hot = subscribers share one source.
- **Analogy:** Promise = a delivered parcel. Observable = a Netflix series you can stop watching. Cold = your own DVD; hot = live TV.
```ts
new Observable<number>((sub) => {
  const id = setInterval(() => sub.next(1), 1000);
  return () => clearInterval(id);    // teardown
});
```
- **Interview tip:** "Nothing happens until `subscribe`; unsubscribing runs the teardown."

#### 03.2 Subject, BehaviorSubject, ReplaySubject, AsyncSubject
- **File:** [`subjects-demo.component.ts`](src/app/features/03-rxjs/subjects-demo.component.ts)
- **Definition:** Subjects are Observables you can push into; they multicast.
- **Analogy:** Subject = live radio; Behavior = radio that tells newcomers the current song; Replay = podcast of last N episodes; Async = only the final verdict.
```ts
const s = new BehaviorSubject(0);  // new subscribers get 0 immediately
```
- **Interview tip:** "Signals vs BehaviorSubject: both hold current state, but signals are synchronous and push-pull with no subscribe/unsubscribe."

#### 03.3 `switchMap`, `mergeMap`, `concatMap`, `exhaustMap`
- **File:** [`flattening-demo.component.ts`](src/app/features/03-rxjs/flattening-demo.component.ts)
- **Definition:** Map each value to an inner Observable and flatten the results.
- **Analogy:** `switchMap` = change TV channel (drop old); `mergeMap` = many cashiers at once; `concatMap` = single queue; `exhaustMap` = ignore the doorbell until you've answered.
```ts
click$.pipe(exhaustMap(() => login$))   // double-click safe
```
- **Interview tip:** "`switchMap` for search, `exhaustMap` for login/submit, `concatMap` for ordered writes, `mergeMap` for independent parallel work."

#### 03.4 Combination: `combineLatest`, `withLatestFrom`, `forkJoin`, `zip`, `merge`, `concat`, `race`
- **File:** [`operators-demo.component.ts`](src/app/features/03-rxjs/operators-demo.component.ts)
- **Definition:** Join several streams into one.
- **Analogy:** `forkJoin` = wait for all runners to finish; `race` = first runner wins; `zip` = pair up in order.
```ts
forkJoin({ user: user$, posts: posts$ })
```
- **Interview tip:** "`forkJoin` needs every source to complete; `combineLatest` emits whenever any source emits after all have emitted once."

#### 03.5 Filtering & timing: `debounceTime`, `throttleTime`, `auditTime`, `distinctUntilChanged`, `filter`, `take`, `takeWhile`, `first`
- **File:** [`operators-demo.component.ts`](src/app/features/03-rxjs/operators-demo.component.ts)
- **Definition:** Control which values pass and when.
- **Analogy:** `debounceTime` = wait until the speaker stops talking.
```ts
search$.pipe(debounceTime(300), distinctUntilChanged(), switchMap(q => api(q)))
```
- **Interview tip:** "Debounce = after silence; throttle = at most once per window, leading edge; audit = at most once per window, trailing edge."

#### 03.6 `scan`, `reduce`, `map`, `pairwise`, `bufferTime`
- **File:** [`operators-demo.component.ts`](src/app/features/03-rxjs/operators-demo.component.ts)
- **Definition:** Transform and accumulate. `scan` emits each running total; `reduce` only the final.
- **Analogy:** `scan` = a running bank balance; `reduce` = the final statement.
```ts
clicks$.pipe(scan((n) => n + 1, 0))
```
- **Interview tip:** "`reduce` needs completion; `scan` works on infinite streams."

#### 03.7 `share()` and `shareReplay({ bufferSize: 1, refCount: true })`
- **File:** [`core-demo.component.ts`](src/app/features/03-rxjs/core-demo.component.ts)
- **Definition:** Make a cold stream hot so subscribers share one execution; `shareReplay` also caches the last value for latecomers.
- **Analogy:** One kitchen cooking for the whole table.
```ts
config$ = http.get(url).pipe(shareReplay({ bufferSize: 1, refCount: true }));
```
- **Interview tip:** "Always set `refCount: true` so the source is released when nobody listens."

#### 03.8 `catchError`, `retry({count, delay})`, `timeout`, `finalize`
- **File:** [`operators-demo.component.ts`](src/app/features/03-rxjs/operators-demo.component.ts), real use in [`retry.interceptor.ts`](src/app/core/interceptors/retry.interceptor.ts)
- **Definition:** Handle failure, retry with delays, give up after a time limit, run cleanup.
- **Analogy:** Redialling a busy phone number, waiting longer each time.
```ts
retry({ count: 3, delay: (e, n) => timer(1000 * 2 ** n) })
```
- **Interview tip:** "Exponential backoff avoids hammering a struggling server. `finalize` runs on complete, error *and* unsubscribe."

#### 03.9 RxJS ↔ Signals: `toSignal()`, `toObservable()`
- **File:** [`interop-demo.component.ts`](src/app/features/03-rxjs/interop-demo.component.ts)
- **Definition:** Convert between the two reactive worlds.
- **Analogy:** A currency exchange counter.
```ts
const users = toSignal(users$, { initialValue: [] });
const q$ = toObservable(queryText);
```
- **Interview tip:** "`toSignal` auto-unsubscribes; `toObservable` emits asynchronously (effect timing). Must be called in an injection context."

---

### MODULE 04 — Directives, Host Composition & Pipes
Files: [`shared/directives/directives.ts`](src/app/shared/directives/directives.ts), [`shared/pipes/pipes.ts`](src/app/shared/pipes/pipes.ts), page [`directives-pipes-page.component.ts`](src/app/features/04-directives-pipes/directives-pipes-page.component.ts).

#### 04.1 Attribute directive with `host: {}`, `Renderer2`, `ElementRef`
- **Definition:** A class that adds behaviour/styling to an existing element.
- **Analogy:** A sticker that makes any gadget glow.
```ts
@Directive({ selector: '[appHighlight]', host: { '(mouseenter)': 'on()', '[class.hot]': 'hot' } })
```
`host` replaces `@HostBinding/@HostListener`.
- **Interview tip:** "Use `Renderer2` (not raw `nativeElement.style`) for platform-safe DOM writes."

#### 04.2 Structural directive (`*appHasRole`)
- **Definition:** Adds or removes a template from the DOM using `TemplateRef` + `ViewContainerRef`.
- **Analogy:** A VIP rope: only certain guests pass.
```ts
if (allowed) this.vcr.createEmbeddedView(this.tpl); else this.vcr.clear();
```
- **Interview tip:** "The `*` is sugar for wrapping the element in an `<ng-template>`."

#### 04.3 Directive Composition API (`hostDirectives`)
- **Definition:** Attach directives to a component's host from inside its decorator.
- **Analogy:** Pre-installed accessories on a phone.
```ts
@Component({ hostDirectives: [{ directive: Highlight, inputs: ['color'] }] })
```
- **Interview tip:** "It is composition over inheritance for behaviours."

#### 04.4 Built-in pipes: `async`, `date`, `currency`, `uppercase`, `keyvalue`
- **Definition:** Template-only value formatters.
- **Analogy:** A currency converter lens.
```html
{{ price | currency:'EUR' }} {{ obj | keyvalue }} {{ data$ | async }}
```
- **Interview tip:** "`async` subscribes and unsubscribes for you and marks for check."

#### 04.5 Custom pure vs impure pipes
- **Definition:** Pure pipes re-run only when the *input reference* changes; impure re-run every change-detection pass.
- **Analogy:** Pure = a calculator that recalculates only when you type; impure = one that recalculates every second.
```ts
@Pipe({ name: 'filterBy', pure: false })
```
- **Interview tip:** "Impure pipes can slow an app because they run on every cycle; prefer `computed()`."

---

### MODULE 05 — Forms
Files: [`src/app/features/05-forms/`](src/app/features/05-forms/), [`shared/components/star-rating.component.ts`](src/app/shared/components/star-rating.component.ts), [`shared/validators/validators.ts`](src/app/shared/validators/validators.ts).

#### 05.1 Template-driven forms (`ngModel`, `ngForm`, `ngModelGroup`, state classes)
- **File:** [`template-driven-demo.component.ts`](src/app/features/05-forms/template-driven-demo.component.ts)
- **Definition:** Forms defined mostly in HTML.
- **Analogy:** A paper form with labelled boxes.
```html
<form #f="ngForm"><input name="email" [(ngModel)]="email" required /></form>
```
Angular adds `ng-touched`, `ng-dirty`, `ng-valid`, `ng-invalid` classes.
- **Interview tip:** "Good for simple forms; reactive forms scale better and are easier to test."

#### 05.2 Typed reactive forms: `FormBuilder`, `NonNullableFormBuilder`, `FormGroup`, `FormControl`, `FormRecord`, `FormArray`
- **File:** [`reactive-demo.component.ts`](src/app/features/05-forms/reactive-demo.component.ts)
- **Definition:** Forms defined in TypeScript; every control is typed.
- **Analogy:** A blueprint made before the building.
```ts
form = inject(NonNullableFormBuilder).group({ name: [''], skills: this.fb.array<string>([]) });
```
- **Interview tip:** "`NonNullableFormBuilder` makes `reset()` return the initial value instead of `null`."

#### 05.3 Validators: built-in, custom, cross-field, async (debounced)
- **File:** [`validators.ts`](src/app/shared/validators/validators.ts), used in [`reactive-demo.component.ts`](src/app/features/05-forms/reactive-demo.component.ts)
- **Definition:** Functions that return `null` (valid) or an error object.
- **Analogy:** Airport checks: sync checks at the desk, async checks by phone.
```ts
export const match: ValidatorFn = (g) => g.get('a')?.value === g.get('b')?.value ? null : { mismatch: true };
```
- **Interview tip:** "Cross-field validators go on the *group*. Async validators run only if sync ones pass."

#### 05.4 `ControlValueAccessor` (Star Rating)
- **File:** [`star-rating.component.ts`](src/app/shared/components/star-rating.component.ts)
- **Definition:** The adapter that lets any component work with `formControlName`.
- **Analogy:** A universal travel plug.
```ts
providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => StarRating), multi: true }]
```
Implement `writeValue`, `registerOnChange`, `registerOnTouched`, `setDisabledState`.
- **Interview tip:** "CVA is the bridge between the forms API and a custom UI."

#### 05.5 Unified form events
- **File:** [`reactive-demo.component.ts`](src/app/features/05-forms/reactive-demo.component.ts)
- **Definition:** `control.events` emits `ValueChangeEvent`, `StatusChangeEvent`, `PristineChangeEvent`, `TouchedChangeEvent`.
- **Analogy:** One security camera feed instead of four.
```ts
control.events.subscribe(e => e instanceof ValueChangeEvent && log(e.value));
```
- **Interview tip:** "Replaces separate `valueChanges`/`statusChanges` subscriptions."

---

### MODULE 06 — Dependency Injection
Files: [`di-demo.components.ts`](src/app/features/06-dependency-injection/di-demo.components.ts), [`legacy-ngmodule.ts`](src/app/features/06-dependency-injection/legacy-ngmodule.ts), page [`di-page.component.ts`](src/app/features/06-dependency-injection/di-page.component.ts).

#### 06.1 DI basics, singleton, `inject()` vs constructor
- **Definition:** Angular builds objects you need and hands them over.
- **Analogy:** A restaurant: you order, you don't cook.
```ts
@Injectable({ providedIn: 'root' }) class Api {}
class C { api = inject(Api); }
```
- **Interview tip:** "`inject()` works in field initialisers, functional guards and interceptors where constructors don't exist."

#### 06.2 Resolution modifiers: `@Self`, `@SkipSelf`, `@Optional`, `@Host`
- **Definition:** Control where Angular looks in the injector tree.
- **Analogy:** "Ask only me", "ask my boss", "it's fine if nobody has it".
```ts
inject(Theme, { self: true, optional: true })
```
- **Interview tip:** "Modern syntax: `inject(Token, { self, skipSelf, optional, host })`."

#### 06.3 Provider recipes: `useClass`, `useExisting`, `useValue`, `useFactory`, `InjectionToken`
- **Files:** [`tokens.ts`](src/app/core/tokens.ts), demo in [`di-demo.components.ts`](src/app/features/06-dependency-injection/di-demo.components.ts)
- **Definition:** Ways to tell DI how to build a dependency.
- **Analogy:** Different ways to get a coffee: brew it, point to an existing pot, hand over a cup, or call a barista function.
```ts
export const API_URL = new InjectionToken<string>('API_URL');
{ provide: API_URL, useValue: environment.apiUrl }
```
- **Interview tip:** "Use `InjectionToken` for non-class values like URLs or config objects."

#### 06.4 `multi: true`
- **Definition:** Many providers collected into one array.
- **Analogy:** A suggestion box where everyone adds a slip.
```ts
{ provide: PLUGIN, useClass: A, multi: true }
```
- **Interview tip:** "Interceptors/validators in the old API used this pattern."

#### 06.5 Scopes: `providedIn: 'root'`, `providers`, `viewProviders`
- **Definition:** Where an instance lives. Component `providers` give each component its own copy; `viewProviders` hide it from projected content.
- **Analogy:** One company printer vs a personal printer per desk.
- **Interview tip:** "Component-level providers die with the component and give isolated state."

#### 06.6 `provideAppInitializer()`
- **Files:** [`app.config.ts`](src/app/app.config.ts), [`app-config.service.ts`](src/app/core/services/app-config.service.ts)
- **Definition:** Runs async code before the first screen renders.
- **Analogy:** The pilot's pre-flight checklist.
```ts
provideAppInitializer(() => inject(AppConfigService).load())
```
- **Interview tip:** "Replaces `APP_INITIALIZER`. A slow initialiser delays the whole app."

#### 06.7 Legacy `NgModule` (for interviews)
- **File:** [`legacy-ngmodule.ts`](src/app/features/06-dependency-injection/legacy-ngmodule.ts)
- **Definition:** The pre-standalone way: `declarations`, `imports`, `exports`, `providers`.
- **Analogy:** A department store: every shop must be registered in the building directory.
```ts
@NgModule({ declarations: [A], exports: [A] }) class LegacyModule {}
```
- **Interview tip:** "Standalone components import what they need directly; NgModules are now optional."

---

### MODULE 07 — Routing, Navigation & Guards
Files: [`src/app/features/07-routing/`](src/app/features/07-routing/), [`app.routes.ts`](src/app/app.routes.ts), [`auth.guards.ts`](src/app/core/guards/auth.guards.ts), [`router-strategies.ts`](src/app/core/router/router-strategies.ts).

#### 07.1 Route config, `RouterOutlet`, `RouterLink`, `RouterLinkActive`, 404, redirects
- **File:** [`app.routes.ts`](src/app/app.routes.ts)
- **Definition:** URL → component table.
- **Analogy:** A building directory.
```ts
{ path: '', redirectTo: 'home', pathMatch: 'full' }, { path: '**', component: NotFound }
```
- **Interview tip:** "Order matters: first match wins, so `**` goes last."

#### 07.2 Lazy loading: `loadComponent`, `loadChildren`, nested & named outlets
- **File:** [`routing.routes.ts`](src/app/features/07-routing/routing.routes.ts)
- **Definition:** Download code only when a route is visited.
- **Analogy:** Fetching a book from the library only when asked.
```ts
{ path: 'admin', loadChildren: () => import('./admin.routes').then(m => m.ROUTES) }
```
- **Interview tip:** "Lazy loading shrinks the initial bundle."

#### 07.3 `withComponentInputBinding()`
- **Definition:** Path params, query params and route `data` arrive as signal inputs.
- **Analogy:** The router hands you a note instead of you asking.
```ts
id = input<string>();   // route: /users/:id
```
- **Interview tip:** "Removes the need for `ActivatedRoute` for simple reads."

#### 07.4 Functional guards: `CanActivateFn`, `CanActivateChildFn`, `CanDeactivateFn`, `CanMatchFn`
- **File:** [`auth.guards.ts`](src/app/core/guards/auth.guards.ts)
- **Definition:** Functions the router runs to allow, block or redirect.
- **Analogy:** Door bouncers.
```ts
export const authGuard: CanActivateFn = () => inject(Auth).isLoggedIn() || inject(Router).parseUrl('/login');
```
- **Interview tip:** "Guards are UX, not security; the server must enforce permissions. `CanMatch` removes the route entirely."

#### 07.5 `ResolveFn`, `PreloadingStrategy`, `TitleStrategy`, `withViewTransitions()`
- **File:** [`router-strategies.ts`](src/app/core/router/router-strategies.ts), [`app.config.ts`](src/app/app.config.ts)
- **Definition:** Pre-fetch route data, preload chunks in background, centralise page titles, animate navigation.
- **Analogy:** Prepping the table before guests sit.
```ts
provideRouter(routes, withPreloading(SelectivePreloadingStrategy), withViewTransitions())
```
- **Interview tip:** "Resolvers delay navigation until data is ready; prefer showing a skeleton for slow data."

---

### MODULE 08 — HTTP, Interceptors & Resilience
Files: [`posts-api.service.ts`](src/app/features/08-http/posts-api.service.ts), [`http-page.component.ts`](src/app/features/08-http/http-page.component.ts), [`src/app/core/interceptors/`](src/app/core/interceptors/).

#### 08.1 Setup & CRUD
- **Definition:** `provideHttpClient(withFetch(), withInterceptors([...]))`, then typed `get/post/put/patch/delete`.
- **Analogy:** A courier service with a standard form.
```ts
http.get<Post[]>(url, { params: new HttpParams().set('_limit', 3) })
```
- **Interview tip:** "PUT replaces the whole resource; PATCH changes only some fields. `HttpParams` is immutable."

#### 08.2 Auth interceptor
- **File:** [`auth.interceptor.ts`](src/app/core/interceptors/auth.interceptor.ts)
- **Definition:** Clones each request adding `Authorization: Bearer …`.
- **Analogy:** Airport security stamping every boarding pass.
```ts
req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
```
- **Interview tip:** "Requests are immutable, so use `clone()`."

#### 08.3 Cache interceptor
- **File:** [`cache.interceptor.ts`](src/app/core/interceptors/cache.interceptor.ts)
- **Definition:** Returns a stored response with `of(...)` instead of hitting the network.
- **Analogy:** Answering from memory instead of re-reading the book.
- **Interview tip:** "Cache only safe, idempotent GETs, and plan invalidation."

#### 08.4 Retry with exponential backoff
- **File:** [`retry.interceptor.ts`](src/app/core/interceptors/retry.interceptor.ts)
- **Definition:** Re-sends failed requests with growing delay.
- **Analogy:** Knocking again, waiting longer each time.
- **Interview tip:** "Retry only idempotent requests and transient errors (5xx, network)."

#### 08.5 Global error + toast interceptor
- **File:** [`error.interceptor.ts`](src/app/core/interceptors/error.interceptor.ts), [`toast.service.ts`](src/app/core/services/toast.service.ts)
- **Definition:** One place to catch failed HTTP calls and notify the user.
- **Analogy:** A customer-service desk.
- **Interview tip:** "Order matters: requests go down the list, responses come back up."

#### 08.6 `HttpContext` / `HttpContextToken`
- **File:** [`http-context.ts`](src/app/core/interceptors/http-context.ts)
- **Definition:** Typed per-request metadata for interceptors.
- **Analogy:** A sticky note on a parcel: "Fragile".
```ts
export const SKIP_AUTH = new HttpContextToken<boolean>(() => false);
http.get(url, { context: new HttpContext().set(SKIP_AUTH, true) });
```
- **Interview tip:** "Cleaner than custom headers because it never leaves the browser."

#### 08.7 Progress & cancellation
- **File:** [`http-page.component.ts`](src/app/features/08-http/http-page.component.ts)
- **Definition:** `reportProgress: true, observe: 'events'` yields progress events; unsubscribe cancels.
- **Analogy:** A download bar; closing the tab cancels the parcel.
- **Interview tip:** "Unsubscribing from an HttpClient Observable aborts the request."

---

### MODULE 09 — Performance & Memory
Files: [`src/app/features/09-performance/`](src/app/features/09-performance/).

#### 09.1 `@defer` (viewport, interaction, hover, idle, timer, `when`, `prefetch`)
- **File:** [`performance-page.component.ts`](src/app/features/09-performance/performance-page.component.ts), [`heavy-widget.component.ts`](src/app/features/09-performance/heavy-widget.component.ts)
- **Definition:** Lazy-load part of a template.
- **Analogy:** Not unpacking a box until you need it.
```html
@defer (on viewport; prefetch on idle) { <heavy-widget /> }
@placeholder { <p>…</p> } @loading { <p>Loading</p> } @error { <p>Oops</p> }
```
- **Interview tip:** "`@defer` splits the component into its own chunk. The deferred component must be standalone."

#### 09.2 `NgOptimizedImage`
- **Definition:** `ngSrc` enforces width/height, lazy loading, and `priority` for LCP images.
- **Analogy:** A photo editor that sizes pictures before printing.
```html
<img ngSrc="hero.jpg" width="400" height="300" priority />
```
- **Interview tip:** "It warns when images cause layout shift. `placeholder` needs an image loader."

#### 09.3 Web Workers
- **File:** [`prime.worker.ts`](src/app/features/09-performance/prime.worker.ts)
- **Definition:** Run CPU-heavy code on another thread.
- **Analogy:** Hiring a back-office clerk so the front desk keeps serving.
```ts
const w = new Worker(new URL('./prime.worker', import.meta.url), { type: 'module' });
```
- **Interview tip:** "Workers cannot touch the DOM; communicate with `postMessage`."

#### 09.4 Memory leaks & `takeUntilDestroyed`
- **File:** [`leak-demo.component.ts`](src/app/features/09-performance/leak-demo.component.ts)
- **Definition:** Un-unsubscribed streams keep running after the component dies.
- **Analogy:** Leaving the tap running after leaving the house.
```ts
interval(1000).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(...)
```
- **Interview tip:** "Prefer `async` pipe, `toSignal`, or `takeUntilDestroyed`."

---

### MODULE 10 — Security, a11y, i18n
File: [`security-page.component.ts`](src/app/features/10-security-a11y-i18n/security-page.component.ts).

#### 10.1 XSS protection & `DomSanitizer`
- **Definition:** Angular sanitises bound HTML/URLs automatically. `bypassSecurityTrust*` disables that for trusted content only.
- **Analogy:** A mail-room scanner; bypassing it is signing "I vouch for this package".
```ts
this.sanitizer.bypassSecurityTrustHtml(trustedHtml)
```
- **Interview tip:** "Never bypass with user input. Prefer sanitising over trusting."

#### 10.2 Accessibility
- **Definition:** ARIA bindings, keyboard navigation, focus trap, live-region announcements (CDK a11y).
- **Analogy:** Ramps and braille signs for the web.
```html
<button [attr.aria-expanded]="open()" (keydown.escape)="close()">Menu</button>
```
- **Interview tip:** "Use native elements first; ARIA only fills gaps."

#### 10.3 i18n pipes (`I18nPluralPipe`, `I18nSelectPipe`, locale formatting)
- **Definition:** Pluralisation, gender/choice selection, and locale-aware dates/numbers.
- **Analogy:** A translator who knows "1 item" vs "2 items".
```html
{{ n | i18nPlural: {'=0':'none','=1':'one','other':'# items'} }}
```
- **Interview tip:** "Register locale data with `registerLocaleData` for non-English formatting."

---

### MODULE 11 — SSR, Hydration, Platform
File: [`ssr-page.component.ts`](src/app/features/11-ssr/ssr-page.component.ts).

> SSR is **explained and demonstrated safely but not enabled** so `ng serve` stays simple. Enable with `ng add @angular/ssr`.

#### 11.1 CSR vs SSR
- **Definition:** CSR builds the page in the browser; SSR sends ready HTML from the server.
- **Analogy:** Flat-pack furniture vs assembled furniture.
- **Interview tip:** "SSR improves first paint and SEO, at the cost of platform-safe code."

#### 11.2 Platform safety: `PLATFORM_ID`, `isPlatformBrowser`, `afterNextRender`
- **Definition:** Guard browser-only APIs.
- **Analogy:** Don't ask for the sea view in a room with no window.
```ts
if (isPlatformBrowser(this.platformId)) localStorage.setItem('k','v');
```
- **Interview tip:** "`afterNextRender` never runs on the server, so `window` is safe inside it."

#### 11.3 Hydration & `TransferState`
- **Definition:** The browser reuses server DOM and listeners are attached; `TransferState` ships server-fetched data to avoid a second request.
- **Analogy:** Handing over a filled-in form so the next clerk needn't ask again.
```ts
provideClientHydration(withEventReplay(), withIncrementalHydration())
```
- **Interview tip:** "`ngSkipHydration` opts a subtree out (e.g. DOM-mutating widgets)."

---

### MODULE 12 — Testing
Files: [`src/app/features/12-testing/`](src/app/features/12-testing/), page [`testing-page.component.ts`](src/app/features/12-testing/testing-page.component.ts).

> This repo uses **Vitest**. `fakeAsync`/`tick` need Zone.js, which this zoneless app doesn't load, so we use `vi.useFakeTimers()` and `vi.advanceTimersByTime()`.

#### 12.1 Fundamentals: `describe`, `beforeEach`, `it`, `expect`, `TestBed`
- **Definition:** `describe` groups, `it` is one test, `expect` asserts, `beforeEach` resets, `TestBed` builds a mini Angular app.
- **Analogy:** A pre-flight checklist.
- **Interview tip:** "Tests should be isolated, fast and deterministic."

#### 12.2 Component tests & signal inputs
- **File:** [`sample.component.spec.ts`](src/app/features/12-testing/sample.component.spec.ts)
- **Definition:** Create the component, set inputs, click, check the DOM.
```ts
fixture.componentRef.setInput('name', 'Ada');
await fixture.whenStable();
```
- **Analogy:** A crash-test dummy for UI.
- **Interview tip:** "Use `setInput`; signal inputs can't be assigned directly."

#### 12.3 HTTP tests
- **File:** [`posts-api.service.spec.ts`](src/app/features/12-testing/posts-api.service.spec.ts)
- **Definition:** `provideHttpClientTesting()` + `HttpTestingController` mock the backend.
```ts
const req = http.expectOne(url); req.flush(data); http.verify();
```
- **Analogy:** A fake post office.
- **Interview tip:** "Always call `verify()` to catch unanswered requests."

#### 12.4 Async & marble tests
- **File:** [`async-rxjs.spec.ts`](src/app/features/12-testing/async-rxjs.spec.ts)
- **Definition:** `TestScheduler` marble diagrams like `'-a-b-c|'` describe streams over virtual time; `-` = a frame, `|` = complete, `#` = error, `(ab|)` = same frame.
- **Analogy:** Sheet music for streams.
- **Interview tip:** "Marbles make time-based RxJS tests instant and deterministic."

#### 12.5 Router & guard tests
- **File:** [`guards.spec.ts`](src/app/features/12-testing/guards.spec.ts)
- **Definition:** `RouterTestingHarness.navigateByUrl()` runs real guards.
```ts
await harness.navigateByUrl('/private');
expect(router.url).toContain('login-required');
```
- **Analogy:** Crash-testing doors.
- **Interview tip:** "Guards use `inject()`, so test them through navigation."

---

### MODULE 13 — Enterprise Ecosystem
Files: [`src/app/features/13-enterprise/`](src/app/features/13-enterprise/).

#### 13.1 `<ng-container>`, `<ng-template>`, `<ng-content>`, `*ngTemplateOutlet`
- **File:** [`templates-demo.component.ts`](src/app/features/13-enterprise/templates-demo.component.ts)
- **Definition:** `ng-container` groups with no DOM node; `ng-template` is an unrendered blueprint; `ng-content` projects parent content; `ngTemplateOutlet` stamps a template with a context.
- **Analogy:** Paper clip / rubber stamp / picture frame / pressing the stamp.
```html
<ng-template #row let-name let-n="n">{{ name }} {{ n }}</ng-template>
<ng-container *ngTemplateOutlet="row; context: { $implicit: 'Ada', n: 1 }" />
```
- **Interview tip:** "`ng-container` avoids wrapper divs that break flex/table layouts. A template renders nothing until stamped."

#### 13.2 `:host`, `:host(.active)`, `:host-context`, CSS variables
- **File:** [`styling-animations-demo.component.ts`](src/app/features/13-enterprise/styling-animations-demo.component.ts)
- **Definition:** Selectors that style a component's own element, or react to ancestors.
- **Analogy:** The front door of a house; CSS variables are wall sockets.
```css
:host(.active) { border-color: blue; }
:host-context(.dark-theme) { color: white; }
```
- **Interview tip:** "CSS custom properties inherit through the encapsulation boundary."

#### 13.3 Angular animations
- **File:** [`styling-animations-demo.component.ts`](src/app/features/13-enterprise/styling-animations-demo.component.ts)
- **Definition:** `trigger`, `state`, `style`, `transition`, `animate`, `:enter`/`:leave`, `stagger`.
- **Analogy:** Stage directions for elements.
```ts
transition(':enter', [style({ opacity: 0 }), animate('250ms', style({ opacity: 1 }))])
```
- **Interview tip:** "Needs `provideAnimationsAsync()`; a transition fires only on a state change."

#### 13.4 CDK: virtual scroll, drag & drop, clipboard, overlay
- **File:** [`cdk-demo.component.ts`](src/app/features/13-enterprise/cdk-demo.component.ts)
- **Definition:** Behaviour-only building blocks.
- **Analogy:** A news ticker: only the visible words are printed.
```html
<cdk-virtual-scroll-viewport itemSize="28" style="height:220px">
  <div *cdkVirtualFor="let r of rows">{{ r }}</div>
</cdk-virtual-scroll-viewport>
```
- **Interview tip:** "Virtual scrolling renders only visible rows, so 100,000 items cost about the same as 10. The viewport needs a fixed height."

#### 13.5 Real-time stream with auto-reconnect
- **File:** [`realtime-storage-demo.component.ts`](src/app/features/13-enterprise/realtime-storage-demo.component.ts)
- **Definition:** A simulated WebSocket as an Observable with `retry` + backoff. The real `webSocket()` code is in the file header.
- **Analogy:** A phone call that redials when dropped.
- **Interview tip:** "Live streams never complete, so always unsubscribe."

#### 13.6 Reactive Local/Session storage
- **File:** [`storage.service.ts`](src/app/core/services/storage.service.ts), schema [`storage.model.ts`](src/app/models/storage.model.ts)
- **Definition:** `persistentSignal(key, fallback, kind)` auto-saves and syncs across tabs; SSR-safe.
- **Analogy:** A whiteboard photographed after every edit.
```ts
theme = storage.persistentSignal('theme', 'light');
```
- **Interview tip:** "Never store tokens in localStorage; it is readable by any script."

#### 13.7 Custom `ErrorHandler` vs interceptor
- **Files:** [`global-error-handler.ts`](src/app/core/error/global-error-handler.ts), [`errors-env-demo.component.ts`](src/app/features/13-enterprise/errors-env-demo.component.ts)
- **Definition:** `ErrorHandler` catches unexpected code errors; interceptors catch HTTP failures.
- **Analogy:** Fire alarm vs mailroom clerk.
```ts
{ provide: ErrorHandler, useClass: GlobalErrorHandler }
```
- **Interview tip:** "HTTP errors are handled Observable errors and never reach `ErrorHandler` unless re-thrown."

#### 13.8 Environments & `fileReplacements`
- **Files:** [`environment.ts`](src/environments/environment.ts), [`environment.development.ts`](src/environments/environment.development.ts), [`angular.json`](angular.json)
- **Definition:** At build time Angular swaps one file for another.
- **Analogy:** A phone with two SIM cards.
```json
"fileReplacements": [{ "replace": "src/environments/environment.ts", "with": "src/environments/environment.development.ts" }]
```
- **Interview tip:** "Environment files are bundled into public JS, so they are never secret."

#### 13.9 `httpResource()`
- **File:** [`http-resource-demo.component.ts`](src/app/features/13-enterprise/http-resource-demo.component.ts)
- **Definition:** A signal-native HTTP call that refetches when signals in its URL function change; uses `HttpClient` and your interceptors.
- **Analogy:** A smart thermostat.
```ts
post = httpResource<Post>(() => `${base}/posts/${this.id()}`);
```
- **Interview tip:** "Compare: `HttpClient` (Observable), `resource()` (Promise), `httpResource()` (signals + interceptors)."

#### 13.10 Angular Elements & PWA `SwUpdate`
- **File:** [`elements-pwa-demo.component.ts`](src/app/features/13-enterprise/elements-pwa-demo.component.ts)
- **Definition:** `createCustomElement` exports a component as a Web Component (live demo). `SwUpdate` (documented, not enabled) detects new app versions.
- **Analogy:** A universal plug; a shop assistant who keeps a back-room catalogue.
```ts
customElements.define('hello-element', createCustomElement(Hello, { injector }));
```
- **Interview tip:** "Check `customElements.get(tag)` first; defining twice throws."

---

## 5. Angular Glossary for Beginners

| Term | Plain English |
|---|---|
| **Decorator** | A `@Something()` label above a class that tells Angular what it is (`@Component`, `@Injectable`). |
| **Component** | A reusable piece of screen: HTML + CSS + TypeScript. |
| **Directive** | A class that changes an element's behaviour or structure (`*appHasRole`). |
| **Pipe** | A formatter used in templates: `{{ price | currency }}`. |
| **Standalone** | A component that imports what it needs directly, with no `NgModule`. Default since Angular 19. |
| **Observable** | A lazy stream of values over time that you can subscribe to and cancel. |
| **Stream** | Values arriving over time (clicks, HTTP responses, timers). |
| **Signal** | A value box that tells readers when it changes, like an Excel cell. |
| **Hydration** | The browser reusing server-rendered HTML and making it interactive. |
| **Lazy Loading** | Downloading code only when it is first needed. |
| **Guard** | A function that decides whether navigation may proceed. |
| **Interceptor** | A function that sees every HTTP request/response and can change it. |
| **Injection Context** | The moments when `inject()` is allowed: constructors, field initialisers, providers/factories, guards/interceptors. |
| **Provider** | A recipe telling DI how to create a dependency. |
| **Change Detection** | Angular's process of refreshing the screen after data changes. |
| **Zoneless** | Running without Zone.js; updates are triggered by signals and events. |
| **Teardown** | Cleanup code that runs when a subscription ends. |

---

## 6. Setup & Commands Guide

**Requirements:** Node.js **≥ 22.12** (Angular 21 CLI requirement) and npm.

| Command | What it does | Behind the scenes |
|---|---|---|
| `npm install` | Installs dependencies. If peer-dependency conflicts appear, use `npm install --legacy-peer-deps`. | Reads `package.json`, downloads packages into `node_modules/`. |
| `ng serve` (or `npm start`) | Dev server at http://localhost:4200 with live reload. | Compiles with esbuild + Vite, uses `development` settings and `environment.development.ts`. |
| `ng test` | Runs unit tests (Vitest). Use `ng test --watch=false` for one run. | Builds `*.spec.ts` files and runs them in a jsdom environment. |
| `ng build` | Production build into `dist/angular-mastery-showcase/browser`. | AOT compile, tree-shake, minify, hash filenames, code-split every lazy route. |
| `ng build --configuration development` | Unminified build with source maps. | Applies `fileReplacements` for the dev environment. |

If `ng` is not recognised, use `npx ng …`. On Windows PowerShell where scripts are blocked, use `npx.cmd ng …`.

To serve the production build locally: `npx http-server dist/angular-mastery-showcase/browser -p 4400 --proxy http://localhost:4400?` (any static server with an `index.html` fallback works).

---

## 7. Version Notes (read this if a tutorial disagrees)

- **Angular 21.2, TypeScript 5.9, RxJS 7.8, Vitest 4.** New projects no longer use Karma/Jasmine.
- `afterRender` is called **`afterEveryRender`**; `provideExperimentalZonelessChangeDetection` is now **`provideZonelessChangeDetection`**.
- `resource()` uses `params` + `loader`; `rxResource()` uses `params` + `stream`.
- The root component is `App` in `app.ts` (not `AppComponent`).
- `fakeAsync` needs Zone.js, so tests use Vitest fake timers.
- SSR and the service worker are **documented but not enabled**.
- Strict TypeScript is on: `strict`, `noImplicitOverride`, `noUncheckedIndexedAccess`.
- Not verified: I could not run `ng serve` or open the pages in a browser in my environment. `ng build` and `ng test` pass, so click through each page once yourself.
"# Angular_Mastery_ShubhamaySarkar_Lucifer" 
