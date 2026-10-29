/**
 * ============================================================================
 * FILE: security-page.component.ts   (MODULE 10 page)
 * ============================================================================
 * WHAT IS THIS?
 *   Three topics on one page:
 *    A. Security: Angular's automatic XSS sanitisation and when to use
 *       DomSanitizer (bypassSecurityTrustHtml) - and why it is dangerous.
 *    B. Accessibility: ARIA bindings, keyboard navigation, focus trap (CDK
 *       FocusTrap) and screen-reader announcements (CDK LiveAnnouncer).
 *    C. Internationalisation: locale pipes, I18nPluralPipe, I18nSelectPipe.
 *
 * REAL-WORLD ANALOGY:
 *   Security = a bouncer who pats down every guest's pockets (sanitiser).
 *   a11y     = ramps, braille and captions so EVERYONE can use the building.
 *   i18n     = signs that automatically appear in the visitor's language.
 *
 * WHY DO WE NEED IT?
 *   XSS lets attackers run their script in your user's browser. ~15% of people
 *   have a disability; many use only the keyboard or a screen reader.
 *
 * COMMON BEGINNER MISTAKE:
 *   Using bypassSecurityTrust* "to make the error go away". You just turned off
 *   the bouncer. Only bypass for content YOU fully control.
 * ============================================================================
 */
import { A11yModule, LiveAnnouncer } from '@angular/cdk/a11y';
import {
  CurrencyPipe, DatePipe, DecimalPipe, I18nPluralPipe, I18nSelectPipe, PercentPipe, registerLocaleData,
} from '@angular/common';
import localeDe from '@angular/common/locales/de';
import localeFr from '@angular/common/locales/fr';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { LogService } from '../../core/services/log.service';
import { FeaturePageComponent } from '../../shared/components/feature-page.component';

const SRC = '10-security';

// Locale data is NOT bundled by default (keeps the app small). Register what you use.
registerLocaleData(localeDe, 'de');
registerLocaleData(localeFr, 'fr');

@Component({
  selector: 'app-security-page',
  imports: [FeaturePageComponent, A11yModule, DatePipe, CurrencyPipe, DecimalPipe, PercentPipe, I18nPluralPipe, I18nSelectPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-feature-page
      title="10 Security, Accessibility & Internationalisation"
      subtitle="Make it safe, usable by everyone, and global."
      level="Advanced"
      source="10-security"
      [bullets]="bullets"
    >
      <section class="card">
        <h2>A. XSS protection &amp; DomSanitizer</h2>
        <label for="xss">HTML you type (try &lt;img src=x onerror=alert(1)&gt; or &lt;b&gt;bold&lt;/b&gt;):</label>
        <textarea id="xss" rows="2" style="width:100%" [value]="html()" (input)="html.set($any($event.target).value)"></textarea>
        <div class="grid-2">
          <div class="box">
            <strong>1. Interpolation {{ '{{ }}' }}</strong> (text only - always safe)
            <div>{{ html() }}</div>
          </div>
          <div class="box">
            <strong>2. [innerHTML]</strong> (Angular SANITISES: scripts &amp; handlers stripped)
            <div [innerHTML]="html()"></div>
          </div>
          <div class="box">
            <strong>3. bypassSecurityTrustHtml</strong> (sanitiser OFF - dangerous!)
            <div [innerHTML]="trusted()"></div>
          </div>
          <div class="box">
            <strong>URL binding</strong>: <code>javascript:</code> links are neutralised
            <a [href]="badUrl">click (becomes unsafe: ...)</a>
          </div>
        </div>
        <div class="row">
          <label><input type="checkbox" [checked]="bypass()" (change)="bypass.set(!bypass())" /> enable bypass for box 3 (only for trusted content!)</label>
        </div>
      </section>

      <section class="card">
        <h2>B. Accessibility</h2>
        <div class="grid-2">
          <div class="stack">
            <h3>ARIA bindings</h3>
            <button class="btn" type="button" [attr.aria-expanded]="open()" aria-controls="panel1" (click)="toggle()">
              {{ open() ? 'Collapse' : 'Expand' }} panel
            </button>
            <div id="panel1" role="region" aria-label="Demo panel" [hidden]="!open()" class="box">Panel content (aria-expanded updates for screen readers).</div>

            <h3>Keyboard navigation</h3>
            <div role="toolbar" aria-label="Formatting" class="row" (keydown)="onToolbarKey($event)">
              @for (t of tools; track t; let i = $index) {
                <button #tb class="btn" type="button" [attr.tabindex]="i === activeTool() ? 0 : -1" (focus)="activeTool.set(i)">{{ t }}</button>
              }
            </div>
            <span class="muted">Tab into the toolbar, then use &larr; &rarr; (roving tabindex).</span>
          </div>

          <div class="stack">
            <h3>Focus trap (CDK)</h3>
            <button class="btn" type="button" (click)="trap.set(!trap())">{{ trap() ? 'Close' : 'Open' }} modal-like box</button>
            @if (trap()) {
              <!-- cdkTrapFocus keeps Tab inside this box; autoCapture focuses it on open and restores focus on close -->
              <div class="box" cdkTrapFocus [cdkTrapFocusAutoCapture]="true" role="dialog" aria-modal="true" aria-label="Focus trap demo">
                <p>Press Tab repeatedly: focus cannot escape.</p>
                <input aria-label="first field" />
                <button class="btn" type="button">Another button</button>
                <button class="btn primary" type="button" (click)="trap.set(false)">Close</button>
              </div>
            }

            <h3>Screen-reader announcement</h3>
            <button class="btn" type="button" (click)="announce()">LiveAnnouncer.announce()</button>
            <span class="muted">Turn on a screen reader (NVDA / VoiceOver) to hear it. Last: "{{ lastAnnouncement() }}"</span>
          </div>
        </div>
      </section>

      <section class="card">
        <h2>C. Internationalisation (locale pipes)</h2>
        <div class="row">
          <label for="loc">Locale:</label>
          <select id="loc" (change)="locale.set($any($event.target).value)">
            <option value="en-US">en-US</option><option value="de">de (Germany)</option><option value="fr">fr (France)</option>
          </select>
        </div>
        <table>
          <tbody>
            <tr><td>date</td><td>{{ now | date: 'fullDate' : undefined : locale() }}</td></tr>
            <tr><td>currency</td><td>{{ 1234567.891 | currency: currencyCode() : 'symbol' : '1.2-2' : locale() }}</td></tr>
            <tr><td>number</td><td>{{ 1234567.891 | number: '1.1-2' : locale() }}</td></tr>
            <tr><td>percent</td><td>{{ 0.256 | percent: '1.0-1' : locale() }}</td></tr>
          </tbody>
        </table>

        <h3>I18nPluralPipe</h3>
        <div class="row">
          <button class="btn" type="button" (click)="messages.update(n => Math.max(0, n - 1))">-</button>
          <strong>{{ messages() }}</strong>
          <button class="btn" type="button" (click)="messages.update(n => n + 1)">+</button>
          <span>{{ messages() | i18nPlural: pluralMap }}</span>
        </div>

        <h3>I18nSelectPipe</h3>
        <div class="row">
          <select aria-label="Gender" (change)="gender.set($any($event.target).value)">
            <option value="female">female</option><option value="male">male</option><option value="other">other</option>
          </select>
          <span>{{ gender() | i18nSelect: genderMap }}</span>
        </div>
      </section>
    </app-feature-page>
  `,
})
export class SecurityPageComponent {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly announcer = inject(LiveAnnouncer);
  private readonly log = inject(LogService);
  protected readonly Math = Math;

  // ---- security ----
  protected readonly html = signal('<b>bold</b> <img src="x" onerror="alert(\'XSS!\')"> <script>alert(1)</script> safe text');
  protected readonly bypass = signal(false);
  protected readonly badUrl = 'javascript:alert("xss")';
  /** SafeHtml wraps the string so Angular will NOT sanitise it. */
  protected readonly trusted = computed<SafeHtml | string>(() =>
    this.bypass() ? this.sanitizer.bypassSecurityTrustHtml(this.html()) : '(enable the checkbox to bypass the sanitiser)');

  // ---- a11y ----
  protected readonly open = signal(false);
  protected readonly trap = signal(false);
  protected readonly lastAnnouncement = signal('-');
  protected readonly tools = ['Bold', 'Italic', 'Underline', 'Link'];
  protected readonly activeTool = signal(0);

  // ---- i18n ----
  protected readonly now = new Date(2025, 10, 5);
  protected readonly locale = signal('en-US');
  protected readonly currencyCode = computed(() => (this.locale() === 'en-US' ? 'USD' : 'EUR'));
  protected readonly messages = signal(1);
  protected readonly pluralMap = { '=0': 'No new messages', '=1': 'One new message', other: '# new messages' };
  protected readonly gender = signal('female');
  protected readonly genderMap = { female: 'She replied.', male: 'He replied.', other: 'They replied.' };

  protected readonly bullets = [
    'Angular treats every value as untrusted: {{ }} escapes text and [innerHTML] strips scripts and event handlers automatically.',
    'DomSanitizer.bypassSecurityTrustHtml switches that protection OFF for one value — try box 3 with the checkbox on.',
    'ARIA attributes (aria-expanded, role, aria-label) describe UI state to screen readers; bind them with [attr.aria-*].',
    'A roving tabindex toolbar and CDK focus trap show correct keyboard handling; LiveAnnouncer speaks status updates.',
    'Locale pipes format dates/currency/numbers per locale; I18nPlural and I18nSelect choose a message by value.',
  ];

  protected toggle(): void { this.open.update((v) => !v); }

  protected onToolbarKey(ev: KeyboardEvent): void {
    const dir = ev.key === 'ArrowRight' ? 1 : ev.key === 'ArrowLeft' ? -1 : 0;
    if (!dir) return;
    const buttons = Array.from((ev.currentTarget as HTMLElement).querySelectorAll<HTMLButtonElement>('button'));
    const next = (this.activeTool() + dir + buttons.length) % buttons.length;
    this.activeTool.set(next);
    buttons[next]?.focus();
    ev.preventDefault();
  }

  protected announce(): void {
    const msg = `Saved at ${new Date().toLocaleTimeString()}`;
    void this.announcer.announce(msg, 'polite');
    this.lastAnnouncement.set(msg);
    this.log.info(SRC, `LiveAnnouncer.announce("${msg}")`);
  }
}
