/**
 * ============================================================================
 * FILE: binding-demo.component.ts   (Module 01 - data binding + control flow)
 * ============================================================================
 * WHAT IS THIS?
 *   Shows the 4 kinds of data binding and Angular's built-in template control
 *   flow: @if/@else, @for, @switch/@case, @empty and @let.
 *
 * REAL-WORLD ANALOGY:
 *   A template is a mail-merge letter: "Dear {{ name }}". Binding fills the
 *   blanks; control flow decides which paragraphs are printed and how often.
 *
 * WHY DO WE NEED IT?
 *   Without binding you would write document.getElementById(...).textContent =
 *   ... by hand for every change. Angular keeps screen and data in sync.
 *
 * COMMON BEGINNER MISTAKE:
 *   Forgetting `track` in @for. It is mandatory: it tells Angular how to
 *   recognise each row so it can MOVE existing DOM nodes instead of destroying
 *   and rebuilding them all when the array changes (faster + keeps focus/state).
 * ============================================================================
 */
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LogService } from '../../core/services/log.service';

type Status = 'todo' | 'doing' | 'done';
interface Task { readonly id: number; readonly title: string; readonly status: Status; }

const SRC = '01-components';

@Component({
  selector: 'app-binding-demo',
  // FormsModule provides `ngModel` which powers the [( )] banana-in-a-box syntax.
  imports: [FormsModule, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid-2">
      <div class="box stack">
        <h3>1. Data binding</h3>

        <!-- INTERPOLATION {{ }}: class data -> text on screen (one way: TS -> HTML). -->
        <p>Hello, <strong>{{ name() }}</strong>! (length: {{ name().length }})</p>

        <!-- PROPERTY BINDING [prop]="expr": class data -> a DOM property. -->
        <input [value]="name()" [disabled]="locked()" aria-label="One-way bound input" />

        <!-- EVENT BINDING (event)="handler()": user action -> class method. -->
        <div class="row">
          <button class="btn" type="button" (click)="toggleLock()">{{ locked() ? 'Unlock' : 'Lock' }} input</button>
          <button class="btn" type="button" (click)="shout($event)">Shout (see $event)</button>
        </div>

        <!-- TWO-WAY BINDING [(ngModel)]: banana-in-a-box = [prop] + (event) combined. -->
        <label for="twoway">Two-way: type here and watch the text above change</label>
        <input id="twoway" [(ngModel)]="name" />
      </div>

      <div class="box stack">
        <h3>2. Control flow</h3>

        <!-- @if / @else -->
        @if (tasks().length > 3) {
          <p class="warn">More than 3 tasks - busy day!</p>
        } @else {
          <p class="ok">A light list ({{ tasks().length }} tasks).</p>
        }

        <!-- @let declares a read-only local template variable. -->
        @let done = doneCount();
        @let pct = tasks().length ? (done / tasks().length) * 100 : 0;
        <p class="muted">&#64;let: {{ done }} done = {{ pct | number: '1.0-0' }}%</p>

        <div class="row">
          <button class="btn" type="button" (click)="add()">Add task</button>
          <button class="btn" type="button" (click)="removeFirst()">Remove first</button>
          <button class="btn" type="button" (click)="clear()">Clear all</button>
        </div>
      </div>
    </div>

    <table aria-label="Tasks with @for contextual variables">
      <thead><tr><th>$index</th><th>$first</th><th>$last</th><th>$even</th><th>$odd</th><th>$count</th><th>Task</th><th>&#64;switch</th></tr></thead>
      <tbody>
        <!--
          @for (item of list; track item.id; let i = $index, ...)
          "track item.id" -> the unique key Angular uses to recognise rows.
          Built-in context variables must be aliased with "let".
        -->
        @for (t of tasks(); track t.id; let i = $index, first = $first, last = $last, even = $even, odd = $odd, count = $count) {
          <tr>
            <td>{{ i }}</td><td>{{ first }}</td><td>{{ last }}</td><td>{{ even }}</td><td>{{ odd }}</td><td>{{ count }}</td>
            <td>{{ t.title }}</td>
            <td>
              <!-- @switch / @case: like a JS switch for templates. -->
              @switch (t.status) {
                @case ('todo') { <span class="badge">TODO</span> }
                @case ('doing') { <span class="badge Intermediate">DOING</span> }
                @default { <span class="badge Beginner">DONE</span> }
              }
              <button class="btn" type="button" (click)="advance(t.id)" [attr.aria-label]="'Advance ' + t.title">next</button>
            </td>
          </tr>
        } @empty {
          <!-- @empty renders when the collection has zero items. -->
          <tr><td colspan="8" class="muted">No tasks yet - click "Add task".</td></tr>
        }
      </tbody>
    </table>
  `,
})
export class BindingDemoComponent {
  private readonly log = inject(LogService);

  protected readonly name = signal('Angular');
  protected readonly locked = signal(false);
  protected readonly tasks = signal<readonly Task[]>([
    { id: 1, title: 'Learn binding', status: 'done' },
    { id: 2, title: 'Learn @for', status: 'doing' },
    { id: 3, title: 'Learn @switch', status: 'todo' },
  ]);
  private nextId = 4;
  protected readonly doneCount = computed(() => this.tasks().filter((t) => t.status === 'done').length);

  protected toggleLock(): void {
    this.locked.update((v) => !v);
    this.log.info(SRC, `Property binding: input disabled = ${this.locked()}`);
  }
  protected shout(ev: Event): void {
    // `$event` in the template is the raw DOM event object.
    this.log.info(SRC, `Event binding: received a "${ev.type}" event`);
    this.name.update((n) => n.toUpperCase());
  }
  protected add(): void {
    const id = this.nextId++;
    // Immutable update: create a NEW array (signals compare by reference).
    this.tasks.update((l) => [...l, { id, title: `Task #${id}`, status: 'todo' }]);
    this.log.info(SRC, `@for: added task ${id}; Angular only creates one new row (thanks to track)`);
  }
  protected removeFirst(): void { this.tasks.update((l) => l.slice(1)); }
  protected clear(): void { this.tasks.set([]); this.log.warn(SRC, '@empty branch is now shown'); }
  protected advance(id: number): void {
    const order: Status[] = ['todo', 'doing', 'done'];
    this.tasks.update((l) => l.map((t) => (t.id === id ? { ...t, status: order[(order.indexOf(t.status) + 1) % 3] ?? 'todo' } : t)));
  }
}
