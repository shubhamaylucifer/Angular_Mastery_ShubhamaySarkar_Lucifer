/**
 * ============================================================================
 * FILE: cdk-demo.component.ts   (MODULE 13 - Angular CDK essentials)
 * ============================================================================
 * WHAT IS THIS?
 *   The CDK (Component Dev Kit) is a toolbox of behaviour-only building blocks
 *   (no visual style). Four are shown here:
 *     1. Virtual scrolling   <cdk-virtual-scroll-viewport> - 100,000 rows smoothly
 *     2. Drag and drop       cdkDropList / cdkDrag         - a Kanban board
 *     3. Clipboard           cdkCopyToClipboard            - one-click copy
 *     4. Overlay             Overlay + CdkConnectedOverlay - floating dropdown
 *
 * REAL-WORLD ANALOGY:
 *   Virtual scroll = a TV news ticker: only the few words on screen are really
 *   "printed"; the rest of the infinite tape is imaginary until it scrolls in.
 *   Overlay = a sticky note on the glass of your monitor: it floats above the
 *   page instead of living inside it.
 *
 * WHY DO WE NEED IT?
 *   Rendering 100,000 DOM rows makes the browser freeze (each row = a DOM node
 *   to create, style and lay out). Drag-drop, overlays and focus handling are
 *   very tricky to build correctly by hand.
 *
 * COMMON BEGINNER MISTAKE:
 *   Forgetting to give the virtual-scroll viewport a FIXED HEIGHT (it then
 *   renders nothing or everything) and forgetting `itemSize` (row height in px).
 *   For Overlay, also import 'overlay-prebuilt.css' (see angular.json styles).
 * ============================================================================
 */
import { CdkDrag, CdkDropList, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Clipboard } from '@angular/cdk/clipboard';
import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
import { CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { LogService } from '../../core/services/log.service';

const SRC = '13-enterprise';

@Component({
  selector: 'app-cdk-demo',
  imports: [
    CdkVirtualScrollViewport, CdkFixedSizeVirtualScroll, CdkVirtualForOf,
    CdkDropList, CdkDrag,
    CdkOverlayOrigin, CdkConnectedOverlay,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="card">
      <h2>1. Virtual scrolling — 100,000 rows</h2>
      <p class="muted">
        Scroll the left box: only ~10 rows exist in the DOM at any time. The right box renders
        2,000 rows with a normal <code>&#64;for</code> (try scrolling it, then imagine 100,000).
      </p>
      <div class="grid-2">
        <div>
          <h3>cdk-virtual-scroll-viewport (100,000 items)</h3>
          <!-- itemSize = row height in px. The viewport MUST have a fixed height (see CSS). -->
          <cdk-virtual-scroll-viewport itemSize="28" class="viewport">
            <div *cdkVirtualFor="let row of bigList" class="vrow">Row #{{ row }}</div>
          </cdk-virtual-scroll-viewport>
        </div>
        <div>
          <h3>Plain &#64;for (2,000 items)</h3>
          <div class="viewport plain-scroll">
            @for (row of smallList; track row) {
              <div class="vrow">Row #{{ row }}</div>
            }
          </div>
        </div>
      </div>
    </section>

    <section class="card">
      <h2>2. Drag and drop — Kanban board</h2>
      <div class="board">
        @for (col of columns; track col.id) {
          <div class="column">
            <h3>{{ col.title }} ({{ col.items().length }})</h3>
            <!-- cdkDropList = a zone items can be dropped in.
                 cdkDropListConnectedTo links the zones so cards can travel between them. -->
            <div
              cdkDropList
              [id]="col.id"
              [cdkDropListData]="col.items()"
              [cdkDropListConnectedTo]="connectedIds"
              (cdkDropListDropped)="drop($event, col.id)"
              class="dropzone"
            >
              @for (task of col.items(); track task) {
                <!-- cdkDrag = this element can be picked up and moved. -->
                <div cdkDrag class="task">{{ task }}</div>
              }
            </div>
          </div>
        }
      </div>
    </section>

    <section class="card">
      <h2>3. Clipboard &amp; 4. Overlay</h2>
      <div class="row">
        <code>npm install &#64;angular/cdk</code>
        <button class="btn" type="button" (click)="copy()">Copy to clipboard</button>
        <span class="ok">{{ copied() ? 'Copied!' : '' }}</span>
      </div>

      <div class="row" style="margin-top:.7rem">
        <!-- cdkOverlayOrigin marks the element the floating panel is attached to. -->
        <button class="btn primary" type="button" cdkOverlayOrigin #origin="cdkOverlayOrigin" (click)="toggleMenu()">
          Open floating menu
        </button>
      </div>

      <!--
        This <ng-template> is the overlay's content. CdkConnectedOverlay renders it
        in a special layer at the end of <body>, floating above everything else.
      -->
      <ng-template
        cdkConnectedOverlay
        [cdkConnectedOverlayOrigin]="origin"
        [cdkConnectedOverlayOpen]="menuOpen()"
        [cdkConnectedOverlayHasBackdrop]="true"
        cdkConnectedOverlayBackdropClass="cdk-overlay-transparent-backdrop"
        (backdropClick)="menuOpen.set(false)"
        (detach)="menuOpen.set(false)"
      >
        <ul class="menu">
          @for (m of menuItems; track m) {
            <li><button class="btn" type="button" (click)="pick(m)">{{ m }}</button></li>
          }
        </ul>
      </ng-template>
    </section>
  `,
  styles: `
    .viewport { height: 220px; border: 1px solid #dfe3ee; border-radius: 8px; background: #fff; }
    .plain-scroll { overflow: auto; }
    .vrow { height: 28px; line-height: 28px; padding: 0 .6rem; border-bottom: 1px solid #f0f2f8; }
    .board { display: grid; grid-template-columns: repeat(3, 1fr); gap: .75rem; }
    .column { background: #f0f2f8; border-radius: 8px; padding: .5rem; }
    .dropzone { min-height: 120px; }
    .task { background: #fff; border: 1px solid #dfe3ee; border-radius: 6px; padding: .4rem .6rem; margin: .3rem 0; cursor: grab; }
    .menu { list-style: none; margin: 4px 0 0; padding: .4rem; background: #fff; border: 1px solid #dfe3ee; border-radius: 8px; box-shadow: 0 6px 18px rgba(0,0,0,.18); display: flex; flex-direction: column; gap: 4px; }
    /* CDK adds these classes while dragging - style them to look polished. */
    .cdk-drag-preview { background: #fff; border: 1px solid #3b6fe0; border-radius: 6px; padding: .4rem .6rem; box-shadow: 0 6px 16px rgba(0,0,0,.25); }
    .cdk-drag-placeholder { opacity: .3; }
    .cdk-drag-animating { transition: transform 200ms; }
  `,
})
export class CdkDemoComponent {
  private readonly log = inject(LogService);
  private readonly clipboard = inject(Clipboard);

  // `Array.from({length: n}, fn)` builds an array of n items.
  protected readonly bigList = Array.from({ length: 100_000 }, (_, i) => i + 1);
  protected readonly smallList = Array.from({ length: 2_000 }, (_, i) => i + 1);

  protected readonly columns = [
    { id: 'todo', title: 'To do', items: signal(['Learn signals', 'Read RxJS docs', 'Write tests']) },
    { id: 'doing', title: 'Doing', items: signal(['Build Kanban']) },
    { id: 'done', title: 'Done', items: signal(['Install Angular']) },
  ] as const;
  protected readonly connectedIds = this.columns.map((c) => c.id);

  protected readonly copied = signal(false);
  protected readonly menuOpen = signal(false);
  protected readonly menuItems = ['Profile', 'Settings', 'Sign out'];

  /**
   * Called when a card is dropped. `event.previousContainer` = where it came from,
   * `event.container` = where it landed. Same list => reorder; different => move.
   */
  protected drop(event: CdkDragDrop<string[]>, targetId: string): void {
    const target = this.columns.find((c) => c.id === targetId);
    const source = this.columns.find((c) => c.id === event.previousContainer.id);
    if (!target || !source) return;

    // Work on COPIES: the CDK helpers mutate arrays, but our signals hold immutable ones.
    const from = [...source.items()];
    const to = source === target ? from : [...target.items()];

    if (source === target) {
      moveItemInArray(from, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(from, to, event.previousIndex, event.currentIndex);
      target.items.set(to);
    }
    source.items.set(from);
    this.log.info(SRC, `drag-drop: moved card from "${source.title}" to "${target.title}"`);
  }

  protected copy(): void {
    const ok = this.clipboard.copy('npm install @angular/cdk');
    this.copied.set(ok);
    this.log.info(SRC, `Clipboard.copy() -> ${ok ? 'copied' : 'failed'}`);
    setTimeout(() => this.copied.set(false), 1500);
  }

  protected toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }

  protected pick(item: string): void {
    this.menuOpen.set(false);
    this.log.success(SRC, `overlay menu: picked "${item}"`);
  }
}
