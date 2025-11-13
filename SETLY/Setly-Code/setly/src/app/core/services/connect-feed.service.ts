import { Injectable, Signal, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AnyConnectPost, ConnectFeedResponse, ConnectFilterParams, PersonPost } from '../../features/connect/models/connect.models';
import { AnalyticsService } from './analytics.service';
import { ToastService } from './toast.service';
import { catchError, map, of } from 'rxjs';

interface InternalState {
  posts: AnyConnectPost[];
  nextCursor?: string;
  loading: boolean;
  params?: ConnectFilterParams;
  mockPages?: number; // count of pages served by mock fallback to avoid infinite scroll
}

@Injectable({ providedIn: 'root' })
export class ConnectFeedService {
  private readonly state = signal<InternalState>({ posts: [], loading: false, mockPages: 0 });
  private http = inject(HttpClient);
  private toast = inject(ToastService);

  // Local room images
  private readonly ROOM_IMAGES = [
  '/assets/images%20/jon-stebbe-paydk0JcIOQ-unsplash.jpg',
  '/assets/images%20/kam-idris-_HqHX3LBN18-unsplash.jpg',
  '/assets/images%20/kam-idris-kyt0PkBSCNQ-unsplash.jpg',
  '/assets/images%20/kara-eads-L7EwHkq1B2s-unsplash.jpg',
  '/assets/images%20/kenny-eliason-Wp7t4cWN-68-unsplash.jpg',
  '/assets/images%20/lotus-design-n-print-0sDzRgrN_pI-unsplash.jpg',
  '/assets/images%20/lotus-design-n-print-r_y2VBvEOIE-unsplash.jpg'
  ];

  feed: Signal<ConnectFeedResponse> = computed(() => ({
    posts: this.state().posts,
    nextCursor: this.state().nextCursor
  }));
  loading = computed(() => this.state().loading);

  constructor(private analytics: AnalyticsService) {}

  fetchFeed(params: ConnectFilterParams): Signal<ConnectFeedResponse> {
    // Previous optimization incorrectly skipped new tab (includeTypes) changes when cursor stayed null.
    // Simplicity > premature optimization: always fetch when called; rely on HTTP caching if present.
    const current = this.state();
    this.state.update(s => ({ ...s, loading: true, params }));

    // Try real API first; fall back to mock on error
    const qp: any = { ...params, includeTypes: params.includeTypes?.join(',') };
    const httpParams = new HttpParams({ fromObject: Object.entries(qp).reduce((acc: any, [k, v]) => {
      if (v === undefined || v === null) return acc;
      acc[k] = String(v);
      return acc;
    }, {}) });
    this.http.get<ConnectFeedResponse>('/api/connect/feed', { params: httpParams }).subscribe({
      next: (res) => {
        // If API returns 0 items (e.g., extreme filters or dev backend off), gracefully fall back to sample content
        const useMock = !res?.posts?.length;
        const sample = useMock ? this.generateMockPosts(params, 10) : [];
        const merged = params.cursor
          ? [...this.state().posts, ...(useMock ? sample : (res.posts || []))]
          : (useMock ? sample : (res.posts || []));
        this.state.update(s => ({
          ...s,
          loading: false,
          posts: merged,
          nextCursor: useMock ? (sample.length ? 'cursor-' + Date.now() : undefined) : res.nextCursor,
          params,
          mockPages: useMock ? ((s.mockPages ?? 0) + 1) : 0
        }));
        if (useMock) {
          this.toast.info('Showing sample Connect posts while data loads.');
        }
        if (!params.cursor) this.analytics.feedViewed({ count: res.posts?.length || 0 });
      },
      error: () => {
        // Mock fallback
        const batch = this.generateMockPosts(params, 10);
        this.state.update(s => {
          const nextPage = params.cursor ? ((s.mockPages ?? 0) + 1) : 0;
          return {
            ...s,
            loading: false,
            posts: params.cursor ? [...s.posts, ...batch] : batch,
            nextCursor: batch.length && nextPage < 3 ? ('cursor-' + Date.now()) : undefined,
            params,
            mockPages: nextPage
          };
        });
        // Notify only on first-page failures to avoid spam on pagination
        if (!params.cursor) {
          this.toast.error("Couldn't reach Connect. Showing sample content.", 4500);
        }
        if (!params.cursor) this.analytics.feedViewed({ count: batch.length });
      }
    });

    return this.feed;
  }

  // Lightweight check to see if newer posts are available without mutating state
  peekLatest(params: ConnectFilterParams) {
    const qp: any = { ...params, includeTypes: params.includeTypes?.join(',') };
    const httpParams = new HttpParams({ fromObject: Object.entries(qp).reduce((acc: any, [k, v]) => {
      if (v === undefined || v === null) return acc;
      acc[k] = String(v);
      return acc;
    }, {}) });
    return this.http.get<ConnectFeedResponse>('/api/connect/feed', { params: httpParams }).pipe(
      map(res => ({ topId: res?.posts?.[0]?.id as string | undefined, count: res?.posts?.length || 0 })),
      catchError(() => {
        // Use mock generator as a fallback to provide a stable topId shape
        const mock = this.generateMockPosts(params, 1);
        return of({ topId: mock?.[0]?.id as string | undefined, count: mock.length });
      })
    );
  }

  like(id: string): void {
    this.optimisticToggle(id, 'likes', 1, p => this.analytics.likeClicked(id));
  }
  save(id: string): void {
    this.state.update(s => ({
      ...s,
      posts: s.posts.map(p => p.id === id ? { ...p, saved: !p.saved } : p)
    }));
    this.analytics.saveClicked(id);
    // Best-effort backend acknowledgement
    try { fetch(`/api/connect/posts/${id}/save`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ saved: true }) }); } catch {}
  }
  hide(id: string): void {
    this.state.update(s => ({ ...s, posts: s.posts.filter(p => p.id !== id) }));
  }
  report(id: string): void {
    this.analytics.reportClicked(id);
    // For MVP just hide
    this.hide(id);
    try { fetch(`/api/connect/posts/${id}/report`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason: 'user-report' }) }); } catch {}
  }

  private optimisticToggle(id: string, key: 'likes', delta: number, after?: (post: AnyConnectPost) => void) {
    this.state.update(s => ({
      ...s,
      posts: s.posts.map(p => {
        if (p.id !== id) return p;
  const currentLikes = p.likes || 0;
  const toggled = currentLikes > 0 ? currentLikes + 1 : currentLikes + delta; // simple increment when already liked to simulate engagement
  const next = { ...p, likes: toggled };
        after?.(next);
        return next;
      })
    }));
  }

  private generateMockPosts(params: ConnectFilterParams, count: number): AnyConnectPost[] {
  const types: AnyConnectPost['type'][] = ['person','room', 'ride', 'market', 'event', 'thread', 'update'];
    const posts: AnyConnectPost[] = [];
    for (let i = 0; i < count; i++) {
      const type = types[i % types.length];
      const id = 'p' + Date.now() + '-' + i + '-' + Math.random().toString(36).slice(2, 7);
      const base = {
        id,
        type: type as AnyConnectPost['type'],
        authorId: 'user' + ((i % 5) + 1),
        createdAt: new Date(Date.now() - i * 3600_000).toISOString(),
        likes: Math.random() > 0.5 ? Math.floor(Math.random() * 25) : 0,
        comments: Math.random() > 0.6 ? Math.floor(Math.random() * 12) : 0,
        saved: false,
        visibility: Math.random() > 0.75 ? 'verified' : 'public',
        tags: ['Gym', 'Music', 'Coffee'].filter(() => Math.random() > 0.5),
        universityId: params.universityId || 'uni-' + ((i % 3) + 1),
        city: params.city || ['Boston', 'NYC', 'Austin'][i % 3],
        pinned: i === 0 && Math.random() > 0.7
      } as AnyConnectPost;
      // Filter by roomType & price early for room posts when criteria provided
      switch (type) {
        case 'person':
          const person: PersonPost = {
            ...(base as any),
            type: 'person',
            name: 'Student ' + (i + 1),
            avatarUrl: '',
            university: ['Northeastern','MIT','Harvard'][i % 3],
            company: Math.random() > 0.6 ? 'Part-time at Cafe' : undefined,
            verified: { email: true, phone: Math.random() > 0.5, university: Math.random() > 0.5, photo: true },
            mutuals: Math.floor(Math.random()*5),
            presence: Math.random() > 0.5 ? 'online' : 'recent'
          };
          posts.push(person);
          break;
        case 'room':
          const price = 800 + i * 25;
          const roomType = i % 2 === 0 ? 'shared' : 'private';
          if (params.roomType && params.roomType !== roomType) continue;
          if (typeof params.minPrice === 'number' && price < params.minPrice) continue;
          if (typeof params.maxPrice === 'number' && price > params.maxPrice) continue;
          posts.push({
            ...base,
            type: 'room',
            roomId: 'room-' + i,
            title: `${roomType === 'shared' ? 'Shared' : 'Private'} room near campus #${i}`,
            price,
            photos: [
              this.ROOM_IMAGES[i % this.ROOM_IMAGES.length],
              this.ROOM_IMAGES[(i+1) % this.ROOM_IMAGES.length],
              this.ROOM_IMAGES[(i+2) % this.ROOM_IMAGES.length],
              ...(Math.random() > 0.5 ? [this.ROOM_IMAGES[(i+3) % this.ROOM_IMAGES.length]] : [])
            ],
            verifiedHost: Math.random() > 0.5,
            distanceKm: Math.round(Math.random() * 8) + 1,
            hostId: 'host' + i
          });
          break;
        case 'ride':
          posts.push({
            ...base,
            type: 'ride',
            from: base.city || 'Campus',
            to: ['Airport', 'Downtown', 'Mall'][i % 3],
            when: new Date(Date.now() + i * 7200_000).toISOString(),
            seats: 1 + (i % 3),
            isSetlyRide: Math.random() > 0.6,
            hostId: 'driver' + i,
            driverVerified: Math.random() > 0.5,
            presence: Math.random() > 0.5 ? 'online' : 'recent',
            mutualsJoined: Math.random() > 0.6 ? Math.floor(Math.random() * 4) + 1 : undefined
          });
          break;
        case 'event':
          posts.push({
            ...base,
            type: 'event',
            name: 'Campus Meetup #' + i,
            when: new Date(Date.now() + i * 86400_000).toISOString(),
            where: base.city + ' Hub',
            cover: '/assets/boston.jpg',
            rsvps: Math.floor(Math.random() * 50)
          });
          break;
        case 'market':
          posts.push({
            ...base,
            type: 'market',
            title: ['Desk','Bike','Laptop','Books'][i % 4] + ' for sale',
            price: Math.floor(Math.random() * 500) + 50,
            images: ['/assets/boston.jpg','/assets/boston.jpg'],
            sellerId: 'seller' + i,
            verifiedSeller: Math.random() > 0.5,
            location: base.city
          } as any);
          break;
        case 'thread':
          posts.push({
            ...base,
            type: 'thread',
            title: 'How to open a bank account? #' + i,
            excerpt: 'Anyone recently opened an account and can share docs required?',
            replies: Math.floor(Math.random() * 40),
            topic: ['visa', 'banking', 'neighborhoods', 'misc'][i % 4] as any
          });
          break;
        case 'update':
          posts.push({
            ...base,
            type: 'update',
            headline: 'Setly feature rollout #' + i,
            body: 'We just launched a new improvement to help with onboarding.'
          });
          break;
      }
    }

    // Filter verifiedOnly if needed
    if (params.verifiedOnly) {
      return posts.filter(p => p.visibility === 'verified' || (p.type === 'room' && (p as any).verifiedHost));
    }
    return posts;
  }
}
