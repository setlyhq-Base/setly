import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

export interface DirectoryUser {
  id: string;
  name: string;
  avatarUrl?: string;
  universityId?: string;
  organization?: string;
  company?: string;
  role?: string;
  city?: string;
  state?: string;
  country?: string;
  location?: string;
  lastSeen?: string;
  lastLoginAt?: string;
  profileComplete?: boolean;
  badges: { email?: boolean; phone?: boolean; university?: boolean; photo?: boolean };
  interests?: string[];
  isConnected?: boolean;
}

interface DirectoryResponse {
  users: DirectoryUser[];
  nextCursor?: string;
}

interface InternalState {
  users: DirectoryUser[];
  loading: boolean;
  nextCursor?: string;
  error?: string | null;
}

@Injectable({ providedIn: 'root' })
export class PeopleDirectoryService {
  private http = inject(HttpClient);
  private state = signal<InternalState>({ users: [], loading: false, error: null });
  private lastOptions: { includeIncomplete?: boolean; limit?: number } = {};
  private retryHandle: any = null;

  users: Signal<DirectoryUser[]> = computed(() => this.state().users);
  loading = computed(() => this.state().loading);
  nextCursor = computed(() => this.state().nextCursor);
  error = computed(() => this.state().error || null);

  list(params?: { limit?: number; cursor?: string; includeIncomplete?: boolean }) {
    const includeIncomplete = params?.includeIncomplete ?? this.lastOptions.includeIncomplete ?? false;
    const limit = params?.limit ?? this.lastOptions.limit;

    if (!params?.cursor) {
      this.lastOptions = { includeIncomplete, limit };
    }

    const qp: any = {};
    if (limit) qp.limit = String(limit);
    if (params?.cursor) qp.cursor = params.cursor;
    if (includeIncomplete) qp.includeIncomplete = '1';
    const httpParams = new HttpParams({ fromObject: qp });

    this.state.update(s => ({ ...s, loading: true, error: null }));
    this.http.get<DirectoryResponse>('/api/users', { params: httpParams }).subscribe({
      next: (res) => {
        if (this.retryHandle) {
          clearTimeout(this.retryHandle);
          this.retryHandle = null;
        }
        const normalize = (users: DirectoryUser[] = []): DirectoryUser[] =>
          users.map(user => {
            const badges = user.badges || {};
            const rawOrg = typeof user.organization === 'string' ? user.organization.trim() : '';
            const rawCompany = typeof user.company === 'string' ? user.company.trim() : '';
            const rawUniversity = typeof user.universityId === 'string' ? user.universityId.trim() : '';
            const organization = rawOrg || rawCompany || rawUniversity || undefined;
            const location = (user.location && user.location.trim().length) ? user.location : [user.city, user.state, user.country]
              .map(part => typeof part === 'string' ? part.trim() : '')
              .filter(Boolean)
              .join(', ');
            const lastSeen = user.lastSeen || user.lastLoginAt || undefined;
            return {
              ...user,
              organization,
              company: rawCompany || undefined,
              universityId: rawUniversity || undefined,
              location,
              lastSeen,
              badges
            };
          });
        const incoming = normalize(res.users || []);
        const merged = params?.cursor ? [...this.state().users, ...incoming] : incoming;
        this.state.update(s => ({ ...s, users: merged, nextCursor: res.nextCursor, loading: false, error: null }));
      },
      error: (err) => {
        const message = err?.error?.error || err?.message || 'Failed to load people directory';
        this.state.update(s => ({ ...s, loading: false, error: message }));
        const status = err?.status;
        if ((status === 401 || status === 403) && !this.retryHandle) {
          this.retryHandle = setTimeout(() => {
            this.retryHandle = null;
            this.list(params);
          }, 1000);
        }
      }
    });
  }

  loadMore() {
    const cursor = this.nextCursor();
    if (!cursor) return;
    this.list({ cursor });
  }

  reset() {
    if (this.retryHandle) {
      clearTimeout(this.retryHandle);
      this.retryHandle = null;
    }
    this.lastOptions = {};
    this.state.set({ users: [], loading: false, nextCursor: undefined, error: null });
  }
}
