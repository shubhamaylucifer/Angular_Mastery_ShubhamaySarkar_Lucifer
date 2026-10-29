/**
 * ============================================================================
 * FILE: posts-api.service.spec.ts   (SERVICE + HTTP testing)
 * ============================================================================
 * WHAT IS THIS?
 *   Tests PostsApiService WITHOUT any network. `provideHttpClientTesting()`
 *   replaces the real HTTP backend with a fake; `HttpTestingController` lets
 *   the test inspect each request and decide the response.
 *
 * REAL-WORLD ANALOGY:
 *   A flight simulator. The plane (service) believes it's flying; nothing real
 *   can crash.
 *
 * WHY DO WE NEED IT?
 *   Real servers are slow, flaky and change data. Tests must be fast and
 *   deterministic.
 *
 * COMMON BEGINNER MISTAKE:
 *   Forgetting `httpMock.verify()` in afterEach - then unexpected extra requests
 *   go unnoticed. Also: nothing happens until you subscribe().
 * ============================================================================
 */
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { authInterceptor } from '../../core/interceptors/auth.interceptor';
import { AuthService } from '../../core/services/auth.service';
import { API_URL } from '../../core/tokens';
import { Post } from '../../models/user.model';
import { PostsApiService } from '../08-http/posts-api.service';

describe('PostsApiService (HTTP mocked)', () => {
  let service: PostsApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])), // real interceptor under test too
        provideHttpClientTesting(), // MUST come after provideHttpClient: swaps the backend
        { provide: API_URL, useValue: 'http://fake-api' }, // DI makes the base URL swappable
      ],
    });
    service = TestBed.inject(PostsApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify()); // fails if a request was made but not expected/flushed

  it('GETs a list with query params', () => {
    const fake: Post[] = [{ id: 1, userId: 1, title: 't', body: 'b' }];
    let result: Post[] | undefined;
    service.list(3, 2).subscribe((r) => (result = r));

    // Find the pending request and assert on it.
    const req = httpMock.expectOne((r) => r.url === 'http://fake-api/posts');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('_limit')).toBe('3');
    expect(req.request.params.get('_page')).toBe('2');

    req.flush(fake); // "the server answered with this body"
    expect(result).toEqual(fake);
  });

  it('POSTs a new post with a custom header', () => {
    service.create({ userId: 1, title: 'x', body: 'y' }).subscribe();
    const req = httpMock.expectOne('http://fake-api/posts');
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('X-Demo')).toBe('angular-mastery');
    expect(req.request.body).toEqual({ userId: 1, title: 'x', body: 'y' });
    req.flush({ id: 101, userId: 1, title: 'x', body: 'y' });
  });

  it('surfaces server errors to the subscriber', () => {
    let status = 0;
    service.get(999).subscribe({ error: (e: { status: number }) => (status = e.status) });
    httpMock.expectOne('http://fake-api/posts/999').flush('Not found', { status: 404, statusText: 'Not Found' });
    expect(status).toBe(404);
  });

  it('auth interceptor adds the Bearer token for non-public calls (but not SKIP_AUTH calls)', () => {
    TestBed.inject(AuthService).login('ADMIN');

    service.getWithAuth(1).subscribe();
    const authed = httpMock.expectOne('http://fake-api/posts/1');
    expect(authed.request.headers.get('Authorization')).toBe('Bearer fake.jwt.ADMIN');
    authed.flush({});

    service.get(1).subscribe(); // uses SKIP_AUTH context internally
    const publicReq = httpMock.expectOne('http://fake-api/posts/1');
    expect(publicReq.request.headers.has('Authorization')).toBe(false);
    publicReq.flush({});
  });

});
