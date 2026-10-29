/**
 * ============================================================================
 * FILE: enterprise-page.component.ts   (MODULE 13 page)
 * ============================================================================
 * WHAT IS THIS?
 *   The page that assembles every Module 13 demo under the shared
 *   <app-feature-page> shell (Study Card at the top, Event Log at the bottom).
 *
 * REAL-WORLD ANALOGY:
 *   The table of contents + stage of a theatre: each demo component is an act.
 *
 * WHY DO WE NEED IT?
 *   Keeping each topic in its own small component keeps files readable and
 *   shows the "container/presentational" split used in real projects.
 *
 * COMMON BEGINNER MISTAKE:
 *   Putting 1,500 lines of unrelated demos into ONE component file.
 * ============================================================================
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FeaturePageComponent } from '../../shared/components/feature-page.component';
import { CdkDemoComponent } from './cdk-demo.component';
import { ElementsPwaDemoComponent } from './elements-pwa-demo.component';
import { ErrorsEnvDemoComponent } from './errors-env-demo.component';
import { HttpResourceDemoComponent } from './http-resource-demo.component';
import { RealtimeStorageDemoComponent } from './realtime-storage-demo.component';
import { StylingAnimationsDemoComponent } from './styling-animations-demo.component';
import { TemplatesDemoComponent } from './templates-demo.component';

@Component({
  selector: 'app-enterprise-page',
  imports: [
    FeaturePageComponent, TemplatesDemoComponent, StylingAnimationsDemoComponent, CdkDemoComponent,
    RealtimeStorageDemoComponent, ErrorsEnvDemoComponent, HttpResourceDemoComponent, ElementsPwaDemoComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-feature-page
      title="13 Enterprise Ecosystem"
      subtitle="Template containers, styling, animations, CDK, real-time data, error handling and extras."
      level="Advanced"
      source="13-enterprise"
      [bullets]="bullets"
    >
      <app-templates-demo />
      <app-styling-animations-demo />
      <app-cdk-demo />
      <app-realtime-storage-demo />
      <app-errors-env-demo />
      <app-http-resource-demo />
      <app-elements-pwa-demo />
    </app-feature-page>
  `,
})
export class EnterprisePageComponent {
  protected readonly bullets = [
    '<ng-container> groups without a DOM node; <ng-template> is an unrendered blueprint; <ng-content> projects parent content; *ngTemplateOutlet stamps blueprints with a context.',
    ':host, :host(.active), :host-context(.dark-theme) style a component from the inside; CSS variables cross the encapsulation wall.',
    'Angular animations need a state CHANGE: trigger → state/transition → animate, plus :enter/:leave and stagger.',
    'The CDK gives behaviour without styling: virtual scroll, drag & drop, clipboard, overlay.',
    'Real-time = a stream that never completes: add retry with back-off and always unsubscribe.',
    'ErrorHandler catches unexpected code errors; interceptors handle HTTP failures; environment files are swapped by fileReplacements.',
    'httpResource() is signal-native HTTP; Angular Elements exports components as Web Components; SwUpdate manages PWA versions.',
  ];
}
