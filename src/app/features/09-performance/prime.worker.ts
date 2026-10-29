/**
 * ============================================================================
 * FILE: prime.worker.ts   (Web Worker)
 * ============================================================================
 * WHAT IS THIS?
 *   Code that runs on a SEPARATE thread. Here: count prime numbers up to N
 *   (CPU-heavy). The page sends N via postMessage and receives the answer.
 *
 * REAL-WORLD ANALOGY:
 *   A back-office accountant. The receptionist (main thread) keeps greeting
 *   customers while the accountant crunches numbers in another room.
 *
 * WHY DO WE NEED IT?
 *   JavaScript is single-threaded. A 2-second loop on the main thread freezes
 *   clicks, scrolling and animations for 2 seconds.
 *
 * COMMON BEGINNER MISTAKE:
 *   Workers cannot touch the DOM or Angular services. They only exchange
 *   messages (data is COPIED, not shared).
 * ============================================================================
 */
/// <reference lib="webworker" />

addEventListener('message', ({ data }: MessageEvent<number>) => {
  let count = 0;
  for (let n = 2; n <= data; n++) {
    let prime = true;
    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) { prime = false; break; }
    }
    if (prime) count++;
  }
  postMessage(count);
});
