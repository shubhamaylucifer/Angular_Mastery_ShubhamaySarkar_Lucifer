/**
 * ============================================================================
 * FILE: forms-page.component.ts   (MODULE 05 page)
 * ============================================================================
 * WHAT IS THIS?   Page with Template-driven and Reactive form demos.
 * ANALOGY         Two ways of filling the same paperwork: on paper vs on a computer.
 * WHY?            Learn both; real projects mostly use Reactive forms.
 * MISTAKE         Importing BOTH FormsModule and ReactiveFormsModule in one
 *                 component for the same form - pick one style per form.
 * ============================================================================
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FeaturePageComponent } from '../../shared/components/feature-page.component';
import { ReactiveDemoComponent } from './reactive-demo.component';
import { TemplateDrivenDemoComponent } from './template-driven-demo.component';

@Component({
  selector: 'app-forms-page',
  imports: [FeaturePageComponent, TemplateDrivenDemoComponent, ReactiveDemoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-feature-page
      title="05 Forms: Template-Driven, Reactive & Custom Controls"
      subtitle="Collect, validate and react to user input."
      level="Intermediate"
      source="05-forms"
      [bullets]="bullets"
    >
      <section class="card"><h2>A. Template-driven</h2><app-template-driven-demo /></section>
      <section class="card"><h2>B. Reactive (typed) + validators + CVA + events</h2><app-reactive-demo /></section>
    </app-feature-page>
  `,
})
export class FormsPageComponent {
  protected readonly bullets = [
    'Template-driven: [(ngModel)] + attributes in HTML. Reactive: FormGroup/FormControl objects in TypeScript.',
    'Angular adds ng-touched / ng-dirty / ng-valid / ng-invalid classes - inspect them in DevTools.',
    'Validators return null when valid, or an error object. Cross-field validators live on the parent group.',
    'The async validator waits 500ms (debounce) and shows "pending". Try usernames: admin, root, angular.',
    'The star rating is a ControlValueAccessor, so it works with formControlName like a native input.',
    'control.events is one unified stream of Value/Status/Pristine/Touched events.',
  ];
}
