/**
 * ============================================================================
 * FILE: sample.component.spec.ts   (COMPONENT testing)
 * ============================================================================
 * WHAT IS THIS?
 *   A unit test file ("spec"). It tests SampleComponent: creation, DOM text,
 *   button clicks, signal inputs (setInput) and outputs.
 *
 * REAL-WORLD ANALOGY:
 *   A checklist a pilot runs before take-off. Each `it()` is one tick-box;
 *   if any fails you know exactly which system is broken.
 *
 * WHY DO WE NEED IT?
 *   Tests let you refactor without fear and document expected behaviour.
 *
 * COMMON BEGINNER MISTAKE:
 *   Forgetting `await fixture.whenStable()` / `detectChanges()` after changing
 *   state, then asserting on a DOM that hasn't updated yet.
 *
 * VOCABULARY:
 *   describe(name, fn)  groups related tests ("a test suite").
 *   beforeEach(fn)      runs before EVERY it(): fresh, independent setup.
 *   it(name, fn)        ONE test case.
 *   expect(x).toBe(y)   an assertion; the test fails if it is false.
 *   TestBed             Angular's test "mini-app": configure it, then create
 *                       components inside it.
 *   fixture             wrapper around the created component:
 *                       fixture.componentInstance (the class),
 *                       fixture.nativeElement (the DOM),
 *                       fixture.componentRef.setInput() (set inputs).
 * ============================================================================
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SampleComponent } from './sample.component';

describe('SampleComponent', () => {
  let fixture: ComponentFixture<SampleComponent>;
  let host: HTMLElement;

  // Runs before each test so tests never share state.
  beforeEach(async () => {
    // Standalone components go in `imports` (not `declarations`).
    await TestBed.configureTestingModule({ imports: [SampleComponent] }).compileComponents();
    fixture = TestBed.createComponent(SampleComponent);
    host = fixture.nativeElement as HTMLElement;
    // A REQUIRED signal input must be set before the first change detection.
    fixture.componentRef.setInput('title', 'Hello tests');
    await fixture.whenStable(); // let Angular render the initial view
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the title passed through a signal input', () => {
    expect(host.querySelector('h4')?.textContent).toContain('Hello tests');
  });

  it('updates the DOM when the input changes', async () => {
    fixture.componentRef.setInput('title', 'Changed');
    await fixture.whenStable();
    expect(host.querySelector('h4')?.textContent).toBe('Changed');
  });

  it('increments the count and doubles it when the button is clicked', async () => {
    const button = host.querySelector('button') as HTMLButtonElement;
    button.click(); // simulate a user click
    button.click();
    await fixture.whenStable();
    expect(host.querySelector('[data-testid="count"]')?.textContent).toContain('Count: 2');
    expect(host.querySelector('[data-testid="double"]')?.textContent).toContain('Double: 4');
  });

  it('emits the output with the new count', () => {
    const emitted: number[] = [];
    // Outputs are subscribable: .subscribe() returns an unsubscribe handle.
    fixture.componentInstance.changed.subscribe((v) => emitted.push(v));
    (host.querySelector('button') as HTMLButtonElement).click();
    (host.querySelector('button') as HTMLButtonElement).click();
    expect(emitted).toEqual([1, 2]);
  });
});
