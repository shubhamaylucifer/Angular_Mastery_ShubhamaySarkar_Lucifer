/**
 * ============================================================================
 * FILE: nav.config.ts
 * ============================================================================
 * WHAT IS THIS?
 *   The single list of all curriculum modules (title, URL, level). The sidebar,
 *   breadcrumb AND the router all derive from it.
 *
 * REAL-WORLD ANALOGY:
 *   A book's table of contents.
 *
 * WHY DO WE NEED IT?
 *   One source of truth. Rename a module here and every screen updates.
 *
 * COMMON BEGINNER MISTAKE:
 *   Hard-coding menu entries in HTML - then the menu and routes drift apart.
 * ============================================================================
 */
import { NavItem } from '../models/nav.model';

export const NAV_ITEMS: readonly NavItem[] = [
  { path: '01-components', title: '01 Components & Templates', level: 'Beginner', summary: 'Binding, control flow, lifecycle, communication, dynamic components' },
  { path: '02-signals', title: '02 Signals & Resource API', level: 'Beginner', summary: 'signal, computed, effect, linkedSignal, resource, zoneless' },
  { path: '03-rxjs', title: '03 RxJS Mastery', level: 'Beginner', summary: 'Observables, Subjects, operators, interop' },
  { path: '04-directives-pipes', title: '04 Directives & Pipes', level: 'Beginner', summary: 'Attribute/structural directives, hostDirectives, pipes' },
  { path: '05-forms', title: '05 Forms', level: 'Intermediate', summary: 'Template-driven, reactive, validators, CVA' },
  { path: '06-dependency-injection', title: '06 Dependency Injection', level: 'Intermediate', summary: 'Providers, tokens, scopes, legacy NgModule' },
  { path: '07-routing', title: '07 Routing & Guards', level: 'Intermediate', summary: 'Lazy loading, input binding, guards, resolvers' },
  { path: '08-http', title: '08 HTTP & Interceptors', level: 'Intermediate', summary: 'CRUD, interceptors, context, progress' },
  { path: '09-performance', title: '09 Performance & @defer', level: 'Advanced', summary: '@defer, NgOptimizedImage, workers, leaks' },
  { path: '10-security-a11y-i18n', title: '10 Security, a11y, i18n', level: 'Advanced', summary: 'XSS, DomSanitizer, ARIA, plural pipes' },
  { path: '11-ssr', title: '11 SSR & Hydration', level: 'Advanced', summary: 'PLATFORM_ID, TransferState, hydration' },
  { path: '12-testing', title: '12 Testing & Marbles', level: 'Advanced', summary: 'TestBed, HttpTestingController, TestScheduler' },
  { path: '13-enterprise', title: '13 Enterprise Ecosystem', level: 'Advanced', summary: 'Templates, CDK, animations, websockets, httpResource' },
];
