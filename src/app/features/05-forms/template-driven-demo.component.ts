/**
 * ============================================================================
 * FILE: template-driven-demo.component.ts   (Module 05 - Template-driven forms)
 * ============================================================================
 * WHAT IS THIS?
 *   The "easy" forms style: the TEMPLATE owns the form. You write
 *   [(ngModel)], `name="..."`, #ref="ngModel" and Angular builds the model.
 *
 * REAL-WORLD ANALOGY:
 *   A paper form handed out at a counter: the form itself (HTML) carries the
 *   rules; the clerk (Angular) reads it.
 *
 * WHY DO WE NEED IT?
 *   Fast for small forms (login, search). Good to know for interviews.
 *
 * COMMON BEGINNER MISTAKE:
 *   Forgetting `name="..."` on an input inside <form>. ngModel needs the name to
 *   register the control, otherwise you get "No name attribute" errors.
 * ============================================================================
 */
import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { LogService } from '../../core/services/log.service';

@Component({
  selector: 'app-template-driven-demo',
  imports: [FormsModule, JsonPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- #f="ngForm" exposes the NgForm directive instance so we can read f.valid, f.value ... -->
    <form #f="ngForm" (ngSubmit)="submit(f)" novalidate class="stack">
      <div>
        <label for="td-name">Name (required, min 3)</label>
        <!-- #nameCtl="ngModel" gives access to the control's state (touched, dirty, errors) -->
        <input id="td-name" name="name" [(ngModel)]="model.name" required minlength="3" #nameCtl="ngModel" />
        @if (nameCtl.invalid && (nameCtl.touched || f.submitted)) {
          <div class="field-error">Name must be at least 3 characters.</div>
        }
      </div>

      <!-- ngModelGroup groups several controls into a nested object: value.address.{city,zip} -->
      <fieldset ngModelGroup="address" #addr="ngModelGroup">
        <legend>Address group (valid: {{ addr.valid }})</legend>
        <label for="td-city">City</label>
        <input id="td-city" name="city" [(ngModel)]="model.city" required />
        <label for="td-zip">ZIP (5 digits)</label>
        <input id="td-zip" name="zip" [(ngModel)]="model.zip" required pattern="[0-9]{5}" />
      </fieldset>

      <div class="row">
        <button class="btn primary" type="submit">Submit</button>
        <button class="btn" type="button" (click)="f.resetForm()">Reset</button>
      </div>
    </form>

    <p class="muted">
      CSS state classes Angular adds automatically: <code>ng-untouched/ng-touched</code>, <code>ng-pristine/ng-dirty</code>,
      <code>ng-valid/ng-invalid</code>. Open DevTools &rarr; Elements and watch the input's class list!
    </p>
    <pre><code>valid: {{ f.valid }} | dirty: {{ f.dirty }} | touched: {{ f.touched }}
value: {{ f.value | json }}</code></pre>
  `,
  styles: `
    /* Style the ng-* classes Angular puts on the inputs */
    input.ng-invalid.ng-touched { border-color: var(--err); background: #fff5f4; }
    input.ng-valid.ng-dirty { border-color: var(--ok); }
    fieldset { border: 1px solid var(--border); border-radius: 8px; }
  `,
})
export class TemplateDrivenDemoComponent {
  private readonly log = inject(LogService);
  protected model = { name: '', city: '', zip: '' };

  protected submit(f: NgForm): void {
    if (f.invalid) { this.log.warn('05-forms', 'template-driven: submit blocked - form invalid'); return; }
    this.log.success('05-forms', `template-driven submitted: ${JSON.stringify(f.value)}`);
  }
}
