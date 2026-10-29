/**
 * ============================================================================
 * FILE: testing-page.component.ts   (MODULE 12 page)
 * ============================================================================
 * WHAT IS THIS?
 *   A teaching page about unit testing. It explains the test vocabulary
 *   (describe / beforeEach / it / expect / TestBed), shows real excerpts from
 *   the spec files in this folder, and lets you "run" a tiny test by hand.
 *
 * REAL-WORLD ANALOGY:
 *   Tests are a car's pre-flight checklist. Each `it` is one checkbox
 *   ("brakes work?"). `describe` is the section title ("Brakes"), and
 *   `beforeEach` is "reset the car to the same start state before each check".
 *
 * WHY DO WE NEED IT?
 *   Without tests every change is a gamble. With tests you refactor boldly:
 *   if something breaks, a red test tells you immediately.
 *
 * COMMON BEGINNER MISTAKE:
 *   Hitting a real server or relying on real time (setTimeout) in a test.
 *   Tests become slow and flaky. Mock HTTP with HttpTestingController and
 *   control the clock with fake timers / marble diagrams.
 *
 * NOTE: the real tests are the *.spec.ts files next to this page. Run them
 *   with `ng test`. Code samples below are plain strings kept in TypeScript so
 *   that curly braces never confuse the Angular template parser.
 * ============================================================================
 */
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FeaturePageComponent } from '../../shared/components/feature-page.component';
import { LogService } from '../../core/services/log.service';

const SRC = '12-testing';

/** One entry of the "vocabulary" table. */
interface Word {
  readonly term: string;
  readonly meaning: string;
}

/** A named code sample displayed in a <pre> block. */
interface Sample {
  readonly title: string;
  readonly file: string;
  readonly code: string;
}

@Component({
  selector: 'app-testing-page',
  imports: [FeaturePageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-feature-page
      title="12 Unit Testing & RxJS Marble Testing"
      subtitle="Prove your code works — automatically, in milliseconds, without a server."
      level="Advanced"
      source="12-testing"
      [bullets]="bullets"
    >
      <section class="card">
        <h2>A. The testing vocabulary</h2>
        <table>
          <thead><tr><th>Word</th><th>Plain English</th></tr></thead>
          <tbody>
            @for (w of words; track w.term) {
              <tr><td><code>{{ w.term }}</code></td><td>{{ w.meaning }}</td></tr>
            }
          </tbody>
        </table>
      </section>

      <section class="card">
        <h2>B. Try it: a mini test runner</h2>
        <p class="muted">
          We keep a tiny <code>add(a, b)</code> function. Click to run one "test" the same way a
          real framework would: arrange → act → assert.
        </p>
        <div class="row">
          <button class="btn primary" type="button" (click)="runPassing()">Run passing test</button>
          <button class="btn" type="button" (click)="runFailing()">Run failing test</button>
        </div>
        <p>Result: <strong [class.ok]="result() === 'PASS'" [class.bad]="result() === 'FAIL'">{{ result() }}</strong></p>
      </section>

      <section class="card">
        <h2>C. Real code from this repo</h2>
        @for (s of samples; track s.title) {
          <h3>{{ s.title }}</h3>
          <p class="muted">File: <code>{{ s.file }}</code></p>
          <pre><code>{{ s.code }}</code></pre>
        }
      </section>

      <section class="card">
        <h2>D. Marble diagram cheat-sheet</h2>
        <table>
          <thead><tr><th>Symbol</th><th>Meaning</th></tr></thead>
          <tbody>
            @for (m of marbles; track m.term) {
              <tr><td><code>{{ m.term }}</code></td><td>{{ m.meaning }}</td></tr>
            }
          </tbody>
        </table>
        <p class="muted">
          Example: <code>'-a-b-c|'</code> = wait 1 frame, emit a, wait, emit b, wait, emit c, then complete.
        </p>
      </section>

      <section class="card">
        <h2>E. <code>fakeAsync</code> vs Vitest fake timers</h2>
        <p>
          Classic Angular tests use <code>fakeAsync()</code> + <code>tick()</code>, which rely on
          <strong>Zone.js</strong>. This repo is <strong>zoneless</strong> and runs on
          <strong>Vitest</strong>, so we use <code>vi.useFakeTimers()</code> and
          <code>vi.advanceTimersByTime(ms)</code> instead. The idea is identical: time moves only when you say so.
        </p>
      </section>
    </app-feature-page>
  `,
  styles: `
    table { width: 100%; border-collapse: collapse; }
    th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
    pre { overflow-x: auto; }
    .ok { color: #1a7f37; }
    .bad { color: #cf222e; }
  `,
})
export class TestingPageComponent {
  private readonly log = inject(LogService);

  protected readonly result = signal<'-' | 'PASS' | 'FAIL'>('-');

  protected readonly bullets = [
    '`describe` groups tests, `it` is one test, `expect` checks a result, `beforeEach` resets the stage.',
    '`TestBed` builds a mini Angular app just for the test so components and services get their dependencies.',
    'Mock HTTP with `provideHttpClientTesting()` + `HttpTestingController` — tests never touch a real server.',
    'Time-based code is tested with Vitest fake timers or RxJS `TestScheduler` marble diagrams like `-a-b-c|`.',
    'Functional guards are tested by navigating with `RouterTestingHarness`.',
  ];

  protected readonly words: readonly Word[] = [
    { term: 'describe(name, fn)', meaning: 'A folder for related tests, e.g. "Cart store".' },
    { term: 'it(name, fn)', meaning: 'One test: "it adds an item". Reads like a sentence.' },
    { term: 'beforeEach(fn)', meaning: 'Runs before every test so each starts from a clean state.' },
    { term: 'expect(x).toBe(y)', meaning: 'The assertion. If x is not y, the test fails.' },
    { term: 'TestBed', meaning: 'Angular\'s test workshop: configure providers/imports, then create components or inject services.' },
    { term: 'fixture', meaning: 'A wrapper around a created component: gives you the instance and the DOM.' },
    { term: 'fixture.detectChanges()', meaning: 'Asks Angular to refresh the template. (Zoneless: await fixture.whenStable().)' },
    { term: 'fixture.componentRef.setInput()', meaning: 'The correct way to set a signal input() from a test.' },
    { term: 'HttpTestingController', meaning: 'A fake backend. You choose which request to answer and with what.' },
    { term: 'vi.fn() / vi.spyOn()', meaning: 'Spies: fake functions that record how they were called.' },
  ];

  protected readonly marbles: readonly Word[] = [
    { term: '-', meaning: 'One frame of virtual time passes (nothing happens).' },
    { term: 'a, b, c …', meaning: 'A value is emitted. The real value comes from the values object.' },
    { term: '|', meaning: 'The stream completes.' },
    { term: '#', meaning: 'The stream errors.' },
    { term: '(ab|)', meaning: 'Several things in the SAME frame.' },
    { term: '^', meaning: 'Subscription point (hot observables).' },
  ];

  protected readonly samples: readonly Sample[] = [
    {
      title: '1. Component test with a signal input',
      file: 'src/app/features/12-testing/sample.component.spec.ts',
      code: [
        "describe('SampleComponent', () => {",
        '  beforeEach(async () => {',
        '    await TestBed.configureTestingModule({ imports: [SampleComponent] }).compileComponents();',
        '  });',
        "  it('shows the name', async () => {",
        '    const fixture = TestBed.createComponent(SampleComponent);',
        "    fixture.componentRef.setInput('name', 'Ada');",
        '    await fixture.whenStable();',
        "    expect(fixture.nativeElement.textContent).toContain('Ada');",
        '  });',
        '});',
      ].join('\n'),
    },
    {
      title: '2. HTTP test with a fake backend',
      file: 'src/app/features/12-testing/posts-api.service.spec.ts',
      code: [
        'TestBed.configureTestingModule({',
        '  providers: [provideHttpClient(), provideHttpClientTesting()],',
        '});',
        'const http = TestBed.inject(HttpTestingController);',
        '// ...call the service, then answer the request by hand:',
        "const req = http.expectOne('http://fake-api/posts/1');",
        "expect(req.request.method).toBe('GET');",
        'req.flush({ id: 1, title: "Hi" });',
        'http.verify(); // fail if any request was left unanswered',
      ].join('\n'),
    },
    {
      title: '3. Marble test with TestScheduler',
      file: 'src/app/features/12-testing/async-rxjs.spec.ts',
      code: [
        'const scheduler = new TestScheduler((actual, expected) => expect(actual).toEqual(expected));',
        'scheduler.run(({ cold, expectObservable }) => {',
        "  const source = cold('-a-b-c|', { a: 1, b: 2, c: 3 });",
        '  const result = source.pipe(map((n) => n * 10));',
        "  expectObservable(result).toBe('-a-b-c|', { a: 10, b: 20, c: 30 });",
        '});',
      ].join('\n'),
    },
    {
      title: '4. Guard test with RouterTestingHarness',
      file: 'src/app/features/12-testing/guards.spec.ts',
      code: [
        'TestBed.configureTestingModule({',
        "  providers: [provideRouter([{ path: 'private', component: PrivateStub, canActivate: [authGuard] }])],",
        '});',
        'const harness = await RouterTestingHarness.create();',
        "await harness.navigateByUrl('/private');",
        '// Logged out -> guard redirected us:',
        "expect(TestBed.inject(Router).url).toContain('login-required');",
      ].join('\n'),
    },
  ];

  /** Tiny function under test. */
  private add(a: number, b: number): number {
    return a + b;
  }

  protected runPassing(): void {
    const actual = this.add(2, 3); // ACT
    const ok = actual === 5; // ASSERT: expect(add(2,3)).toBe(5)
    this.result.set(ok ? 'PASS' : 'FAIL');
    this.log.success(SRC, `expect(add(2, 3)).toBe(5) -> got ${actual} -> PASS`);
  }

  protected runFailing(): void {
    const actual = this.add(2, 3);
    const ok = actual === 6; // deliberately wrong expectation
    this.result.set(ok ? 'PASS' : 'FAIL');
    this.log.error(SRC, `expect(add(2, 3)).toBe(6) -> got ${actual} -> FAIL (a red test = a bug caught)`);
  }
}
