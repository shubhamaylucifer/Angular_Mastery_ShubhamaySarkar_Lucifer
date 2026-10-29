/**
 * ============================================================================
 * FILE: directives.ts   (shared custom directives)
 * ============================================================================
 * WHAT IS THIS?
 *   Four reusable directives:
 *    - HighlightDirective   : ATTRIBUTE directive using `host: {}` metadata.
 *    - RendererTooltipDirective : attribute directive using Renderer2 + ElementRef.
 *    - HasRoleDirective     : STRUCTURAL directive (*appHasRole="'ADMIN'").
 *    - HoverTrackDirective + RoundedDirective : small directives used for
 *      the Directive COMPOSITION API (hostDirectives) in Module 04.
 *
 * REAL-WORLD ANALOGY:
 *   A directive is a sticker you put on an existing element that gives it a
 *   superpower, without creating a whole new component (which has its own
 *   template). Structural directives are bouncers: they decide whether the
 *   element is even added to the page.
 *
 * WHY DO WE NEED IT?
 *   Reusable behaviour (highlight on hover, permission checks) without
 *   copy-pasting event handlers into many components.
 *
 * COMMON BEGINNER MISTAKE:
 *   Touching `nativeElement.style` directly everywhere - it breaks on SSR and
 *   web workers. Prefer `host: {}` bindings or Renderer2.
 * ============================================================================
 */
import {
  Directive,
  ElementRef,
  Renderer2,
  TemplateRef,
  ViewContainerRef,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../models/user.model';

/**
 * 1) ATTRIBUTE DIRECTIVE with modern `host` metadata.
 *    Usage: <p appHighlight="gold">text</p>
 *    `host` binds properties/listeners ON THE ELEMENT that has the directive,
 *    replacing the old @HostBinding / @HostListener decorators.
 */
@Directive({
  selector: '[appHighlight]',
  host: {
    '[style.backgroundColor]': 'hovering() ? color() : null', // property binding on host
    '[style.transition]': '"background-color .2s"',
    '[class.is-hovered]': 'hovering()', // toggles a CSS class
    '(mouseenter)': 'hovering.set(true)', // event listener on host
    '(mouseleave)': 'hovering.set(false)',
  },
})
export class HighlightDirective {
  /** The attribute value itself is the input: appHighlight="gold". */
  readonly color = input('#fff3a3', { alias: 'appHighlight' });
  protected readonly hovering = signal(false);
}

/**
 * 2) ATTRIBUTE DIRECTIVE using Renderer2 + ElementRef.
 *    Renderer2 is Angular's SAFE way to touch the DOM (works on server too).
 */
@Directive({ selector: '[appTooltip]' })
export class RendererTooltipDirective {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);
  readonly appTooltip = input.required<string>();

  constructor() {
    effect(() => {
      // setAttribute / addClass are the Renderer2 equivalents of el.setAttribute / classList.add
      this.renderer.setAttribute(this.el.nativeElement, 'title', this.appTooltip());
      this.renderer.setStyle(this.el.nativeElement, 'borderBottom', '2px dotted #3b6fe0');
      this.renderer.setStyle(this.el.nativeElement, 'cursor', 'help');
    });
  }
}

/**
 * 3) STRUCTURAL DIRECTIVE: adds/removes the element from the DOM.
 *    Usage: <p *appHasRole="'ADMIN'">secret</p>
 *    The `*` is sugar: Angular wraps the element in an <ng-template>, and we
 *    receive that template (TemplateRef) plus a place to draw it (ViewContainerRef).
 */
@Directive({ selector: '[appHasRole]' })
export class HasRoleDirective {
  private readonly template = inject(TemplateRef<unknown>); // the blueprint (unrendered)
  private readonly container = inject(ViewContainerRef); // where to render it
  private readonly auth = inject(AuthService);

  readonly appHasRole = input.required<UserRole>();
  private rendered = false;

  constructor() {
    // Re-evaluate whenever the required role OR the logged-in role changes.
    effect(() => {
      const allowed = this.auth.role() === this.appHasRole();
      if (allowed && !this.rendered) {
        this.container.createEmbeddedView(this.template); // stamp the template onto the page
        this.rendered = true;
      } else if (!allowed && this.rendered) {
        this.container.clear(); // remove from DOM
        this.rendered = false;
      }
    });
  }
}

/** 4a) Tiny directive reused through hostDirectives: tracks hover. */
@Directive({
  selector: '[appHoverTrack]',
  host: { '(mouseenter)': 'hoverChange.emit(true)', '(mouseleave)': 'hoverChange.emit(false)' },
})
export class HoverTrackDirective {
  readonly hoverChange = output<boolean>();
}

/** 4b) Tiny directive reused through hostDirectives: rounded corners + padding. */
@Directive({
  selector: '[appRounded]',
  host: { '[style.borderRadius.px]': 'radius()', '[style.padding.px]': '8', '[style.border]': '"1px solid #c7d2f5"' },
})
export class RoundedDirective {
  readonly radius = input(12);
}
