/**
 * ============================================================================
 * FILE: main.ts
 * ============================================================================
 * WHAT IS THIS?
 *   The very first TypeScript file the browser runs. It "boots" (starts) Angular.
 *
 * REAL-WORLD ANALOGY:
 *   The ignition key of a car.
 *
 * WHY DO WE NEED IT?
 *   Something must create the root component, attach it to <app-root> in
 *   index.html and apply the configuration.
 *
 * COMMON BEGINNER MISTAKE:
 *   Putting app logic here. It should stay 5 lines long.
 * ============================================================================
 */
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// 1) bootstrapApplication(rootComponent, config) starts Angular.
// 2) It returns a Promise; `.catch` prints start-up failures.
bootstrapApplication(App, appConfig).catch((err) => console.error(err));
