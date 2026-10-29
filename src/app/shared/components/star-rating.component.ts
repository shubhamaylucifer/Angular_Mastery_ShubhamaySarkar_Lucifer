/**
 * ============================================================================
 * FILE: star-rating.component.ts   (ControlValueAccessor)
 * ============================================================================
 * WHAT IS THIS?
 *   A reusable 1-5 star widget that behaves like a native <input>: you can put
 *   `formControlName="rating"` (or [(ngModel)]) directly on <app-star-rating>.
 *   The interface that makes this possible is ControlValueAccessor (CVA).
 *
 * REAL-WORLD ANALOGY:
 *   A universal travel adapter. Angular Forms speaks one "plug" (writeValue,
 *   registerOnChange...). Your custom widget implements that plug, so the form
 *   can drive it exactly like an <input> or <select>.
 *
 * WHY DO WE NEED IT?
 *   Without CVA, custom widgets cannot take part in validation, dirty/touched
 *   tracking or form.value - you would wire events by hand everywhere.
 *
 * COMMON BEGINNER MISTAKE:
 *   Forgetting `NG_VALUE_ACCESSOR` in `providers`, or forgetting to call
 *   `onTouched()`. Then the control never becomes "touched" and validation
 *   messages never appear.
 * ============================================================================
 */
import { ChangeDetectionStrategy, Component, forwardRef, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-star-rating',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Register this component as a value accessor so Angular Forms can find it.
  // forwardRef() is needed because the class is referenced before it is defined.
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => StarRatingComponent), multi: true }],
  template: `
    <div class="stars" role="radiogroup" aria-label="Rating">
      @for (s of stars; track s) {
        <button type="button" role="radio" class="star" [class.on]="s <= value()"
          [attr.aria-checked]="s === value()" [attr.aria-label]="s + ' star' + (s > 1 ? 's' : '')"
          [disabled]="disabled()" (click)="select(s)" (blur)="touch()">&#9733;</button>
      }
    </div>
  `,
  styles: `
    .star { background: none; border: 0; font-size: 1.7rem; cursor: pointer; color: #c9cfe0; padding: 0 2px; }
    .star.on { color: #f5b301; }
    .star:disabled { cursor: not-allowed; opacity: .5; }
  `,
})
export class StarRatingComponent implements ControlValueAccessor {
  protected readonly stars = [1, 2, 3, 4, 5];
  protected readonly value = signal(0);
  protected readonly disabled = signal(false);

  // Callbacks that Angular Forms hands to us. Placeholders until registered.
  private onChange: (v: number) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  /** Form -> widget: the form wants to SHOW this value (setValue / patchValue / reset). */
  writeValue(v: number | null): void { this.value.set(v ?? 0); }
  /** Angular gives us a function to call when the USER changes the value. */
  registerOnChange(fn: (v: number) => void): void { this.onChange = fn; }
  /** Angular gives us a function to call when the control is "touched" (blurred). */
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  /** Form disables/enables the control (control.disable()). */
  setDisabledState(isDisabled: boolean): void { this.disabled.set(isDisabled); }

  protected select(v: number): void {
    this.value.set(v);
    this.onChange(v); // widget -> form
    this.onTouched();
  }
  protected touch(): void { this.onTouched(); }
}
