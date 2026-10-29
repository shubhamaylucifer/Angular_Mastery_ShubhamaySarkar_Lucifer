/**
 * ============================================================================
 * FILE: reactive-demo.component.ts   (Module 05 - Reactive forms, typed)
 * ============================================================================
 * WHAT IS THIS?
 *   The "scalable" forms style: the form is built in TypeScript.
 *   Shows FormBuilder, NonNullableFormBuilder, FormGroup, FormControl,
 *   FormRecord, dynamic FormArray, built-in + custom + cross-field + async
 *   validators, the star-rating CVA and the unified `events` stream.
 *
 * REAL-WORLD ANALOGY:
 *   An architect's blueprint (the TS model) drawn first; the HTML is just the
 *   building made from it. Because it's code, you can test and reuse it.
 *
 * WHY DO WE NEED IT?
 *   Complex forms (dynamic rows, conditional fields, async checks) are far easier
 *   to manage as typed objects than as scattered template attributes.
 *
 * COMMON BEGINNER MISTAKE:
 *   `fb.control('')` gives `string | null` because reset() sets null. Use
 *   `NonNullableFormBuilder` so the type stays `string`.
 * ============================================================================
 */
import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormArray, FormControl, FormRecord, NonNullableFormBuilder, PristineChangeEvent, ReactiveFormsModule,
  StatusChangeEvent, TouchedChangeEvent, ValueChangeEvent, Validators,
} from '@angular/forms';
import { LogService } from '../../core/services/log.service';
import { StarRatingComponent } from '../../shared/components/star-rating.component';
import { noSpaces, passwordsMatch, usernameAvailable } from '../../shared/validators/validators';

const SRC = '05-forms';

@Component({
  selector: 'app-reactive-demo',
  imports: [ReactiveFormsModule, StarRatingComponent, JsonPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" class="stack" novalidate>
      <div class="grid-2">
        <div>
          <label for="r-user">Username (try "admin" - async check, 500ms debounce)</label>
          <input id="r-user" formControlName="username" />
          @let u = form.controls.username;
          @if (u.pending) { <div class="muted">checking availability...</div> }
          @if (u.touched && u.errors) {
            @if (u.errors['required']) { <div class="field-error">Required.</div> }
            @if (u.errors['minlength']) { <div class="field-error">At least 3 characters.</div> }
            @if (u.errors['noSpaces']) { <div class="field-error">No spaces allowed (custom sync validator).</div> }
            @if (u.errors['usernameTaken']) { <div class="field-error">That username is taken (async validator).</div> }
          }
        </div>
        <div>
          <label for="r-email">Email</label>
          <input id="r-email" type="email" formControlName="email" />
          @if (form.controls.email.touched && form.controls.email.invalid) { <div class="field-error">Valid email required.</div> }
        </div>
      </div>

      <!-- Nested group with CROSS-FIELD validator (applied on the group) -->
      <fieldset formGroupName="passwords">
        <legend>Passwords (cross-field validator)</legend>
        <div class="grid-2">
          <div><label for="r-pw">Password (min 6)</label><input id="r-pw" type="password" formControlName="password" /></div>
          <div><label for="r-pw2">Confirm</label><input id="r-pw2" type="password" formControlName="confirm" /></div>
        </div>
        @if (form.controls.passwords.errors?.['passwordMismatch'] && form.controls.passwords.controls.confirm.touched) {
          <div class="field-error">Passwords do not match.</div>
        }
      </fieldset>

      <div>
        <label>Rating (custom ControlValueAccessor)</label>
        <app-star-rating formControlName="rating" />
        <span class="muted">value = {{ form.controls.rating.value }}</span>
      </div>

      <!-- Dynamic FormArray -->
      <fieldset>
        <legend>Skills (FormArray)</legend>
        <div formArrayName="skills" class="stack">
          @for (ctrl of form.controls.skills.controls; track $index; let i = $index) {
            <div class="row">
              <input [formControlName]="i" [attr.aria-label]="'Skill ' + (i + 1)" />
              <button class="btn" type="button" (click)="removeSkill(i)">remove</button>
            </div>
          }
        </div>
        <button class="btn" type="button" (click)="addSkill()">+ add skill</button>
      </fieldset>

      <!-- FormRecord: keys are dynamic (user-defined) but all values share one type -->
      <fieldset>
        <legend>Preferences (FormRecord&lt;FormControl&lt;boolean&gt;&gt;)</legend>
        <div class="row">
          @for (key of prefKeys(); track key) {
            <label><input type="checkbox" [formControl]="prefs.controls[key]!" /> {{ key }}</label>
          }
          <button class="btn" type="button" (click)="addPref()">+ add preference</button>
        </div>
      </fieldset>

      <div class="row">
        <button class="btn primary" type="submit">Submit (valid: {{ form.valid }})</button>
        <button class="btn" type="button" (click)="form.reset()">reset()</button>
        <button class="btn" type="button" (click)="fill()">patchValue()</button>
      </div>
    </form>

    <pre><code>{{ form.value | json }}</code></pre>
    <p class="muted">Unified events (ValueChange / StatusChange / PristineChange / TouchedChange) are printed in the Event Log below.</p>
  `,
  styles: `
    input.ng-invalid.ng-touched { border-color: var(--err); }
    fieldset { border: 1px solid var(--border); border-radius: 8px; }
  `,
})
export class ReactiveDemoComponent {
  private readonly log = inject(LogService);
  private readonly destroyRef = inject(DestroyRef);

  /** NonNullableFormBuilder: every control's reset value is its initial value (never null). */
  private readonly fb = inject(NonNullableFormBuilder);

  /** FormRecord: a group whose keys are decided at runtime. */
  protected readonly prefs = new FormRecord<FormControl<boolean>>({
    newsletter: new FormControl(true, { nonNullable: true }),
  });
  protected readonly prefKeys = signal<string[]>(['newsletter']);

  /** The whole form is STRICTLY TYPED: form.value.username is `string | undefined`, etc. */
  protected readonly form = this.fb.group({
    username: this.fb.control('', {
      validators: [Validators.required, Validators.minLength(3), noSpaces],
      asyncValidators: [usernameAvailable((n) => this.log.info(SRC, `async validator: "server" checked "${n}"`))],
    }),
    email: this.fb.control('', [Validators.required, Validators.email]),
    passwords: this.fb.group(
      { password: this.fb.control('', [Validators.required, Validators.minLength(6)]), confirm: this.fb.control('') },
      { validators: passwordsMatch },
    ),
    rating: this.fb.control(0, Validators.min(1)),
    skills: this.fb.array([this.fb.control('Angular')]),
    prefs: this.prefs,
  });

  constructor() {
    /**
     * Unified form events (Angular 18+): ONE stream replaces valueChanges +
     * statusChanges + manual touched/pristine checks. Use instanceof to tell them apart.
     */
    this.form.controls.username.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((e) => {
      if (e instanceof ValueChangeEvent) this.log.info(SRC, `events: ValueChangeEvent -> "${e.value}"`);
      else if (e instanceof StatusChangeEvent) this.log.info(SRC, `events: StatusChangeEvent -> ${e.status}`);
      else if (e instanceof PristineChangeEvent) this.log.info(SRC, `events: PristineChangeEvent -> pristine=${e.pristine}`);
      else if (e instanceof TouchedChangeEvent) this.log.info(SRC, `events: TouchedChangeEvent -> touched=${e.touched}`);
    });
  }

  protected addSkill(): void { (this.form.controls.skills as FormArray).push(this.fb.control('')); }
  protected removeSkill(i: number): void { this.form.controls.skills.removeAt(i); }
  protected addPref(): void {
    const key = `option${this.prefKeys().length + 1}`;
    this.prefs.addControl(key, new FormControl(false, { nonNullable: true }));
    this.prefKeys.update((k) => [...k, key]);
  }
  protected fill(): void {
    this.form.patchValue({ username: 'newuser', email: 'a@b.com', rating: 4 });
    this.log.info(SRC, 'patchValue() filled some fields');
  }
  protected submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) { this.log.warn(SRC, 'reactive form: submit blocked - invalid'); return; }
    this.log.success(SRC, `reactive form submitted: ${JSON.stringify(this.form.getRawValue())}`);
  }
}

