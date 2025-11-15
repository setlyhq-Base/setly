import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface OnlineResponse { online: string[]; ttlMs: number }

@Injectable({ providedIn: 'root' })
export class PresenceService {
  private http = inject(HttpClient);
  private onlineIds = signal<Set<string>>(new Set());
  private _ttlMs = signal<number>(60000);

  online: Signal<Set<string>> = computed(() => this.onlineIds());
  ttlMs = computed(() => this._ttlMs());

  fetchOnline() {
    this.http.get<OnlineResponse>('/api/presence/online').subscribe({
      next: (res) => {
        this._ttlMs.set(res.ttlMs || 60000);
        this.onlineIds.set(new Set(res.online || []));
      },
      error: () => {
        // keep stale presence; noop
      }
    });
  }
}
