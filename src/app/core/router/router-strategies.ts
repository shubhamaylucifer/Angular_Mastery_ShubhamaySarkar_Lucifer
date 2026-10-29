/**
 * ============================================================================
 * FILE: router-strategies.ts
 * ============================================================================
 * WHAT IS THIS?
 *   Two small router customisations:
 *     1. AppTitleStrategy      - decides the browser TAB title for each page.
 *     2. SelectivePreloading   - decides which lazy chunks are downloaded in
 *                                the background after the app has started.
 *
 * REAL-WORLD ANALOGY:
 *   1. The label printed on a browser tab = a name tag on a person.
 *   2. Preloading = a waiter pre-fetching the dessert menu while you eat the
 *      main course, so it is instant when you ask.
 *
 * WHY DO WE NEED IT?
 *   Good titles help users, browser history and SEO. Preloading makes later
 *   navigation feel instant without slowing the first load.
 *
 * COMMON BEGINNER MISTAKE:
 *   Using `PreloadAllModules` for a huge app: it downloads EVERYTHING and eats
 *   mobile data. A selective strategy preloads only what you flag.
 * ============================================================================
 */
import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { PreloadingStrategy, Route, RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { Observable, of } from 'rxjs';
import { LogService } from '../services/log.service';

/** Extends Angular's abstract TitleStrategy. Router calls updateTitle() after each navigation. */
@Injectable({ providedIn: 'root' })
export class AppTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);

  // `override` is required because we set noImplicitOverride in tsconfig.
  override updateTitle(snapshot: RouterStateSnapshot): void {
    // buildTitle() finds the deepest `title:` defined in the route config.
    const pageTitle = this.buildTitle(snapshot);
    this.title.setTitle(pageTitle ? `${pageTitle} | Angular Mastery` : 'Angular Mastery Showcase');
  }
}

/** Preloads only routes that declare `data: { preload: true }`. */
@Injectable({ providedIn: 'root' })
export class SelectivePreloadingStrategy implements PreloadingStrategy {
  private readonly log = inject(LogService);

  preload(route: Route, load: () => Observable<unknown>): Observable<unknown> {
    if (route.data?.['preload']) {
      this.log.info('router', `preloading lazy route "${route.path}" in the background`);
      return load(); // trigger the download now
    }
    return of(null); // do nothing; it loads when the user navigates
  }
}
