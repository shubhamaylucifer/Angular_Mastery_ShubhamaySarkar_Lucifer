/**
 * ============================================================================
 * FILE: validators.ts   (custom form validators)
 * ============================================================================
 * WHAT IS THIS?
 *   Hand-written validators:
 *    - noSpaces            : custom SYNC validator (control level)
 *    - passwordsMatch      : CROSS-FIELD validator (group level)
 *    - usernameAvailable   : ASYNC validator factory (debounced server check)
 *
 * REAL-WORLD ANALOGY:
 *   Validators are a customs officer: they inspect a value and either wave it
 *   through (return null) or stamp it with an error object ({ code: ... }).
 *
 * WHY DO WE NEED IT?
 *   Built-ins (required, minLength, email...) don't cover business rules such as
 *   "passwords must match" or "username must be unique".
 *
 * COMMON BEGINNER MISTAKE:
 *   Returning `false`/`true`. A validator returns `null` when VALID and an
 *   ERROR OBJECT when invalid. Also: an async validator is skipped until all
 *   sync validators pass.
 * ============================================================================
 */
import { AbstractControl, AsyncValidatorFn, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Observable, map, of, switchMap, timer } from 'rxjs';

/** SYNC, control-level: value must not contain whitespace. */
export const noSpaces: ValidatorFn = (control: AbstractControl): ValidationErrors | null =>
  /\s/.test(String(control.value ?? '')) ? { noSpaces: true } : null;

/** CROSS-FIELD, group-level: compare two sibling controls. */
export const passwordsMatch: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const pw = group.get('password')?.value as string | undefined;
  const confirm = group.get('confirm')?.value as string | undefined;
  return pw && confirm && pw !== confirm ? { passwordMismatch: true } : null;
};

export const TAKEN_USERNAMES: readonly string[] = ['admin', 'root', 'angular', 'shubham'];

/**
 * ASYNC validator FACTORY (a function returning a validator).
 * timer(500) = DEBOUNCE: if the user types again, Angular unsubscribes from the
 * previous check (switchMap semantics) before the 500ms pass, so we only
 * "call the server" for the final text.
 */
export function usernameAvailable(onCheck?: (name: string) => void): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const name = String(control.value ?? '').toLowerCase();
    if (!name) return of(null);
    return timer(500).pipe(
      switchMap(() => { onCheck?.(name); return of(TAKEN_USERNAMES.includes(name)); }),
      map((taken) => (taken ? { usernameTaken: true } : null)),
    );
  };
}
