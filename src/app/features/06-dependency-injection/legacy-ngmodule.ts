/**
 * ============================================================================
 * FILE: legacy-ngmodule.ts   (ISOLATED legacy NgModule example)
 * ============================================================================
 * WHAT IS THIS?
 *   How Angular apps were structured BEFORE standalone components (Angular <= 14,
 *   still the default in many company code bases and in interviews):
 *   every component had to be DECLARED in an NgModule, and modules IMPORTED each
 *   other. This file is intentionally self-contained.
 *
 * REAL-WORLD ANALOGY:
 *   Old: a department store where every product must be registered with a
 *   department (module) before it can be sold.
 *   New (standalone): each product carries its own barcode (imports) and can
 *   be sold anywhere.
 *
 * WHY DO WE NEED IT?
 *   Reading legacy code and answering "what is the difference between
 *   declarations, imports, providers, exports and bootstrap?".
 *
 * COMMON BEGINNER MISTAKE:
 *   Declaring the same component in TWO modules ("is part of the declarations
 *   of 2 modules" error). A component belongs to exactly one NgModule.
 *   (Standalone components removed this whole class of problems.)
 *
 * HOW THE OLD WORLD LOOKED (main.ts, Angular <= 14):
 *      platformBrowserDynamic().bootstrapModule(AppModule)
 *   vs today:
 *      bootstrapApplication(App, appConfig)
 * ============================================================================
 */
import { CommonModule } from '@angular/common';
import { Component, Injectable, NgModule, Pipe, PipeTransform, inject } from '@angular/core';

/** A legacy-style pipe. NOT standalone -> must be declared in a module. */
@Pipe({ name: 'legacyShout', standalone: false })
export class LegacyShoutPipe implements PipeTransform {
  transform(v: string): string { return `${v.toUpperCase()}!!!`; }
}

/** A legacy-style service. Providers listed in a module's `providers` array. */
@Injectable()
export class LegacyGreetingService {
  greet(): string { return 'Hello from a service provided by a NgModule'; }
}

/** A legacy-style component (standalone: false => belongs to a module). */
@Component({
  selector: 'app-legacy-widget',
  standalone: false,
  template: `
    <div class="box">
      <strong>I am declared inside LegacyFeatureModule.</strong><br />
      {{ greeting }} - {{ 'shout' | legacyShout }}
    </div>
  `,
})
export class LegacyWidgetComponent {
  protected readonly greeting = inject(LegacyGreetingService).greet();
}

/**
 * The NgModule. Each metadata array has a job:
 *  - declarations : components/directives/pipes that BELONG to this module
 *  - imports      : other modules whose exported things this module's templates need
 *  - exports      : what OTHER modules may use when they import this one
 *  - providers    : services available to the module's injector
 *  - bootstrap    : (root module only) the first component to render
 */
@NgModule({
  declarations: [LegacyWidgetComponent, LegacyShoutPipe],
  imports: [CommonModule],
  exports: [LegacyWidgetComponent],
  providers: [LegacyGreetingService],
})
export class LegacyFeatureModule {}
