/**
 * ============================================================================
 * FILE: templates-demo.component.ts   (MODULE 13 - Template containers)
 * ============================================================================
 * WHAT IS THIS?
 *   The four "template container" tools that Angular interviews love:
 *     <ng-container>      group things WITHOUT adding an extra DOM element
 *     <ng-template>       a blueprint that is NOT drawn until somebody stamps it
 *     <ng-content>        a hole where the PARENT's content is projected
 *     *ngTemplateOutlet   stamps a blueprint here (with its own data = context)
 *
 * REAL-WORLD ANALOGY:
 *   - ng-container = a paper clip: holds papers together, adds no extra paper.
 *   - ng-template  = a rubber stamp that has not touched the page yet.
 *   - ngTemplateOutlet = pressing the stamp (you can press it many times).
 *   - ng-content   = a picture frame: whoever hangs the frame chooses the picture.
 *
 * WHY DO WE NEED IT?
 *   Extra wrapper <div>s break CSS layouts (tables, flexbox, grids). Reusable
 *   snippets avoid copy-paste. Slots let you build flexible components.
 *
 * COMMON BEGINNER MISTAKE:
 *   Expecting <ng-template> to show itself. It renders NOTHING until you stamp
 *   it with ngTemplateOutlet (or a structural directive does it for you).
 * ============================================================================
 */
import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { LogService } from '../../core/services/log.service';

const SRC = '13-enterprise';

/** A "frame" component. The PARENT decides what appears inside the two holes. */
@Component({
  selector: 'app-fancy-box',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fancy">
      <div class="fancy-title">
        <!-- select="[box-title]" => only children carrying a box-title attribute land here -->
        <ng-content select="[box-title]" />
      </div>
      <div>
        <!-- no select => everything else (the default slot) -->
        <ng-content />
      </div>
    </div>
  `,
  styles: `
    .fancy { border: 2px solid #7c5cd8; border-radius: 8px; padding: .5rem .7rem; background: #faf8ff; }
    .fancy-title { font-weight: 700; color: #7c5cd8; margin-bottom: .25rem; }
  `,
})
export class FancyBoxComponent {}

interface Player {
  readonly name: string;
  readonly score: number;
}

@Component({
  selector: 'app-templates-demo',
  imports: [NgTemplateOutlet, FancyBoxComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="card">
      <h2>1. &lt;ng-container&gt; — group without a wrapper</h2>
      <div class="grid-2">
        <div>
          <h3>With &lt;ng-container&gt;</h3>
          <div #withContainer class="demo-area">
            @for (p of players; track p.name) {
              <ng-container>
                <b>{{ p.name }}</b><i>{{ p.score }}</i>
              </ng-container>
            }
          </div>
        </div>
        <div>
          <h3>With a &lt;div&gt; wrapper</h3>
          <div #withDiv class="demo-area">
            @for (p of players; track p.name) {
              <div class="wrap">
                <b>{{ p.name }}</b><i>{{ p.score }}</i>
              </div>
            }
          </div>
        </div>
      </div>
      <button class="btn" type="button" (click)="inspect()">Inspect the real DOM</button>
      <p class="muted">
        {{ report() }}
      </p>
    </section>

    <section class="card">
      <h2>2. &lt;ng-template&gt; + *ngTemplateOutlet — a stamp you can press many times</h2>
      <!--
        This ng-template is a BLUEPRINT. "let-name" receives the $implicit value,
        "let-score='score'" receives the context property called score.
      -->
      <ng-template #badge let-name let-score="score">
        <span class="pill">{{ name }}: {{ score }} pts</span>
      </ng-template>

      <p>The same blueprint stamped once per player (each time with different data):</p>
      <div class="row">
        @for (p of players; track p.name) {
          <ng-container *ngTemplateOutlet="badge; context: { $implicit: p.name, score: p.score }" />
        }
      </div>

      <ng-template #secret>
        <p class="pill">I did not exist in the DOM until you clicked!</p>
      </ng-template>
      <button class="btn" type="button" (click)="toggleSecret()">{{ showSecret() ? 'Remove' : 'Stamp' }} the hidden blueprint</button>
      @if (showSecret()) {
        <ng-container *ngTemplateOutlet="secret" />
      }
    </section>

    <section class="card">
      <h2>3. &lt;ng-content&gt; — the parent fills the holes</h2>
      <app-fancy-box>
        <span box-title>I go into the "title" slot</span>
        <p>I have no attribute, so I land in the default slot.</p>
      </app-fancy-box>
    </section>
  `,
  styles: `
    .demo-area { border: 1px dashed #bbb; padding: .4rem; min-height: 2rem; }
    .demo-area b { margin-right: .3rem; }
    .demo-area i { margin-right: .8rem; color: #5d6781; }
    .wrap { background: #fff3d9; margin: 2px 0; }
    .pill { display: inline-block; background: #e6edfd; color: #3b6fe0; border-radius: 999px; padding: 2px 10px; }
  `,
})
export class TemplatesDemoComponent {
  private readonly log = inject(LogService);

  protected readonly players: readonly Player[] = [
    { name: 'Asha', score: 90 },
    { name: 'Ben', score: 75 },
    { name: 'Chen', score: 82 },
  ];

  /** `viewChild.required` = signal query for an element marked with #template-variable. */
  private readonly withContainer = viewChild.required<ElementRef<HTMLElement>>('withContainer');
  private readonly withDiv = viewChild.required<ElementRef<HTMLElement>>('withDiv');

  protected readonly report = signal('Click "Inspect the real DOM" to count elements.');
  protected readonly showSecret = signal(false);

  protected inspect(): void {
    const a = this.withContainer().nativeElement;
    const b = this.withDiv().nativeElement;
    const msg =
      `ng-container version: ${a.children.length} direct children, ${a.querySelectorAll('.wrap').length} wrappers. ` +
      `div version: ${b.children.length} direct children (every one is an extra wrapper <div>).`;
    this.report.set(msg);
    this.log.info(SRC, msg);
  }

  protected toggleSecret(): void {
    this.showSecret.update((v) => !v);
    this.log.info(SRC, `ng-template stamped via ngTemplateOutlet: ${this.showSecret()}`);
  }
}
