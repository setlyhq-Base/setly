import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

export interface DirectoryUser {
  id: string;
  name: string;
  avatarUrl?: string;
  universityId?: string;
  location?: string;
  lastSeen?: string;
  badges: { email?: boolean; phone?: boolean; university?: boolean; photo?: boolean };
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

  users: Signal<DirectoryUser[]> = computed(() => this.state().users);
  loading = computed(() => this.state().loading);
  nextCursor = computed(() => this.state().nextCursor);
  error = computed(() => this.state().error || null);

  list(params?: { limit?: number; cursor?: string; includeIncomplete?: boolean }) {
    const qp: any = {};
    if (params?.limit) qp.limit = String(params.limit);
    if (params?.cursor) qp.cursor = params.cursor;
    if (params?.includeIncomplete) qp.includeIncomplete = '1';
    const httpParams = new HttpParams({ fromObject: qp });

    this.state.update(s => ({ ...s, loading: true, error: null }));
    this.http.get<DirectoryResponse>('/api/users', { params: httpParams }).subscribe({
      next: (res) => {
        const merged = params?.cursor ? [...this.state().users, ...(res.users || [])] : (res.users || []);
        this.state.update(s => ({ ...s, users: merged, nextCursor: res.nextCursor, loading: false, error: null }));
      },
      error: (err) => {
        const message = err?.error?.error || err?.message || 'Failed to load people directory';
        this.state.update(s => ({ ...s, loading: false, error: message }));
      }
    });
  }

  loadMore() {
    const cursor = this.nextCursor();
    if (!cursor) return;
    this.list({ cursor });
  }

  reset() { this.state.set({ users: [], loading: false, nextCursor: undefined, error: null }); }
}
