import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { GooglePlacesService } from './google-places.service';

describe('GooglePlacesService caching & abort', () => {
  let service: GooglePlacesService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(GooglePlacesService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('caches autocomplete results', (done) => {
    service.autocompleteAbortable('New', results => {
      expect(results.length).toBe(1);
      // Second call should NOT issue another HTTP request
      service.autocompleteAbortable('New', results2 => {
        expect(results2.length).toBe(1);
        done();
      });
    });
    const req = http.expectOne(r => r.url.includes('/api/places/autocomplete'));
    req.flush({ predictions: [{ description: 'New York, NY', place_id: 'x' }] });
  });

  it('aborts previous autocomplete subscription', (done) => {
    let callCount = 0;
    service.autocompleteAbortable('Sea', r => { callCount++; });
    // Immediately issue a new query which should unsubscribe previous
    service.autocompleteAbortable('Seattle', r => {
      expect(callCount).toBe(0); // previous should never deliver because aborted before flush
      done();
    });
    // Only latest request flushed
    http.match(req => req.url.includes('/api/places/autocomplete'))[0].flush({ predictions: [{ description: 'Seattle, WA', place_id: 'y' }] });
  });
});
