/**
 * ============================================================================
 * FILE: home.component.ts
 * ============================================================================
 * WHAT IS THIS?   The welcome screen with a study-order list.
 * ANALOGY         The "start here" signpost at a trail head.
 * WHY?            A fresher needs to know where to begin.
 * MISTAKE         Jumping straight to Module 09 - study 01 -> 13 in order.
 * ============================================================================
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NAV_ITEMS } from '../core/nav.config';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1>Welcome to Angular Mastery Showcase</h1>
    <p>
      A learn-by-clicking reference. Every page has a <strong>Fresher's Study Card</strong> (what to look at),
      a <strong>live demo</strong> and an <strong>Event Log</strong> (what happened). Work through the modules in order.
    </p>
    <div class="card">
      <ol>
        @for (n of items; track n.path) {
          <li>
            <a [routerLink]="['/', n.path]">{{ n.title }}</a>
            <span class="badge" [class]="n.level">{{ n.level }}</span>
            <span class="muted"> - {{ n.summary }}</span>
          </li>
        }
      </ol>
    </div>
    <p class="muted">Try the "Login as Admin" button in the header - guards and role directives react to it.</p>
  `,
})
export class HomeComponent {
  protected readonly items = NAV_ITEMS;
}
