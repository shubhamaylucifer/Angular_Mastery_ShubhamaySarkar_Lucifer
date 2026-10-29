/**
 * ============================================================================
 * FILE: encapsulation-demo.component.ts  (Module 01 - ViewEncapsulation)
 * ============================================================================
 * WHAT IS THIS?
 *   Three tiny components, each with `p { ... }` CSS but a different
 *   ViewEncapsulation mode. Compare which paragraphs get styled by a GLOBAL
 *   rule (below) and which of their own styles leak out.
 *
 * REAL-WORLD ANALOGY:
 *   Apartments. Emulated = walls with a private key-card per flat (Angular adds
 *   unique attributes). ShadowDom = a real soundproof room (browser feature).
 *   None = an open-plan office where everyone's rules apply to everyone.
 *
 * WHY DO WE NEED IT?
 *   So the `.title` style of one component doesn't accidentally recolour
 *   another component's `.title`.
 *
 * COMMON BEGINNER MISTAKE:
 *   Setting `ViewEncapsulation.None` "to make the CSS work" - it makes your
 *   styles global and affects the entire app.
 * ============================================================================
 */
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-enc-emulated',
  encapsulation: ViewEncapsulation.Emulated, // the DEFAULT
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p class="demo-p">Emulated: Angular adds _ngcontent-xxx attributes. My blue border stays inside.</p>`,
  styles: `.demo-p { border: 2px solid royalblue; padding: .4rem; margin: .25rem 0; }`,
})
export class EmulatedComponent {}

@Component({
  selector: 'app-enc-shadow',
  encapsulation: ViewEncapsulation.ShadowDom, // real browser Shadow DOM
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p class="demo-p">ShadowDom: truly isolated. Even the global green rule can NOT reach me.</p>`,
  styles: `.demo-p { border: 2px solid seagreen; padding: .4rem; margin: .25rem 0; }`,
})
export class ShadowComponent {}

@Component({
  selector: 'app-enc-none',
  encapsulation: ViewEncapsulation.None, // styles become GLOBAL
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p class="demo-p">None: my orange dotted border is injected globally and LEAKS everywhere.</p>`,
  styles: `.leaky-note { outline: 2px dotted darkorange; }`,
})
export class NoneComponent {}

@Component({
  selector: 'app-encapsulation-demo',
  imports: [EmulatedComponent, ShadowComponent, NoneComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // This (Emulated) parent styles `.demo-p` - it only reaches ITS OWN template.
  styles: `.demo-p { background: #fff7d6; } .global-test { color: crimson; }`,
  template: `
    <p class="demo-p">I am in the parent. My yellow background applies only to the parent's own paragraphs.</p>
    <app-enc-emulated />
    <app-enc-shadow />
    <app-enc-none />
    <p class="leaky-note">I am a parent paragraph that picked up the LEAKED .leaky-note class from the "None" component.</p>
  `,
})
export class EncapsulationDemoComponent {}
