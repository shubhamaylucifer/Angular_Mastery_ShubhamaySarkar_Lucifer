/**
 * ============================================================================
 * FILE: posts-api.service.ts
 * ============================================================================
 * WHAT IS THIS?
 *   A typed data-access service wrapping HttpClient: GET / POST / PUT / PATCH /
 *   DELETE for "posts", plus HttpParams, HttpHeaders and HttpContext usage.
 *
 * REAL-WORLD ANALOGY:
 *   A waiter who knows the kitchen's (API's) language so the dining room
 *   (components) just says "one post please".
 *
 * WHY DO WE NEED IT?
 *   Keeps URLs, headers and types in ONE place, so components stay clean and the
 *   service can be replaced by a fake in unit tests.
 *
 * COMMON BEGINNER MISTAKE:
 *   Calling http.get() and never subscribing (nothing is sent!), or subscribing
 *   many times (many requests). HttpClient observables are COLD.
 * ============================================================================
 */
import { HttpClient, HttpContext, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../../core/tokens';
import { CACHEABLE, RETRY_ENABLED, SKIP_AUTH } from '../../core/interceptors/http-context';
import { NewPost, Post } from '../../models/user.model';

@Injectable({ providedIn: 'root' })
export class PostsApiService {
  private readonly http = inject(HttpClient);
  private readonly base = inject(API_URL);

  /** GET with HttpParams (?_limit=3&_page=1). HttpParams is IMMUTABLE: .set() returns a new one. */
  list(limit = 3, page = 1, cacheable = false): Observable<Post[]> {
    const params = new HttpParams().set('_limit', limit).set('_page', page);
    const context = new HttpContext().set(CACHEABLE, cacheable).set(SKIP_AUTH, true); // public endpoint
    return this.http.get<Post[]>(`${this.base}/posts`, { params, context });
  }

  get(id: number): Observable<Post> {
    return this.http.get<Post>(`${this.base}/posts/${id}`, { context: new HttpContext().set(SKIP_AUTH, true) });
  }

  /** Same endpoint WITHOUT SKIP_AUTH, so the auth interceptor attaches the token when logged in. */
  getWithAuth(id: number): Observable<Post> {
    return this.http.get<Post>(`${this.base}/posts/${id}`);
  }

  create(post: NewPost): Observable<Post> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=UTF-8', 'X-Demo': 'angular-mastery' });
    return this.http.post<Post>(`${this.base}/posts`, post, { headers });
  }

  /** PUT replaces the WHOLE resource. */
  replace(post: Post): Observable<Post> {
    return this.http.put<Post>(`${this.base}/posts/${post.id}`, post);
  }

  /** PATCH changes ONLY the given fields. */
  update(id: number, changes: Partial<Post>): Observable<Post> {
    return this.http.patch<Post>(`${this.base}/posts/${id}`, changes);
  }

  remove(id: number): Observable<object> {
    return this.http.delete(`${this.base}/posts/${id}`);
  }

  /** A deliberately failing URL so you can see retry + error interceptors work. */
  broken(withRetry: boolean): Observable<unknown> {
    const context = new HttpContext().set(RETRY_ENABLED, withRetry);
    return this.http.get(`${this.base}/this-endpoint-does-not-exist-404`, { context });
  }
}
