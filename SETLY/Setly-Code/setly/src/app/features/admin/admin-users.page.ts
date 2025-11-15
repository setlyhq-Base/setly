import { Component, inject, Signal, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';

interface AdminUserRow {
  uid: string;
  email: string | null;
  displayName: string | null;
  phoneNumber: string | null;
  providerIds: string[];
  disabled: boolean;
  creationTime?: string;
  lastSignInTime?: string;
}
interface AdminUsersResponse { total: number; users: AdminUserRow[] }

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <section class="max-w-6xl mx-auto p-4">
    <h1 class="text-xl font-semibold mb-4">Admin · Users</h1>
    <form class="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4" (submit)="$event.preventDefault(); reload()">
      <input type="text" class="input" placeholder="email domain (e.g. gmail.com)" [(ngModel)]="domain" name="domain"/>
      <input type="text" class="input" placeholder="provider (e.g. google.com)" [(ngModel)]="provider" name="provider"/>
      <input type="datetime-local" class="input" [(ngModel)]="lastMin" name="lastMin"/>
      <input type="datetime-local" class="input" [(ngModel)]="lastMax" name="lastMax"/>
      <div class="flex items-center gap-2">
        <input type="number" class="input w-24" [(ngModel)]="limit" name="limit"/>
        <button class="px-3 py-2 border rounded-md" (click)="reload()">Filter</button>
      </div>
    </form>
    <div class="text-sm text-gray-600 mb-2" *ngIf="total() !== null">Total: {{ total() }}</div>
    <div class="overflow-auto">
      <table class="min-w-full text-sm">
        <thead><tr class="text-left border-b"><th class="p-2">UID</th><th class="p-2">Email</th><th class="p-2">Name</th><th class="p-2">Providers</th><th class="p-2">Last Sign-in</th><th class="p-2">Created</th></tr></thead>
        <tbody>
          <tr *ngFor="let u of users()" class="border-b hover:bg-gray-50">
            <td class="p-2 font-mono text-xs">{{u.uid}}</td>
            <td class="p-2">{{u.email}}</td>
            <td class="p-2">{{u.displayName}}</td>
            <td class="p-2">{{u.providerIds.join(', ')}}</td>
            <td class="p-2">{{u.lastSignInTime || '—'}}</td>
            <td class="p-2">{{u.creationTime || '—'}}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
  `
})
export class AdminUsersPage {
  private http = inject(HttpClient);

  domain: string = '';
  provider: string = '';
  lastMin: string = '';
  lastMax: string = '';
  limit: number = 200;

  private _users = signal<AdminUserRow[]>([]);
  private _total = signal<number | null>(null);

  users: Signal<AdminUserRow[]> = computed(() => this._users());
  total: Signal<number | null> = computed(() => this._total());

  reload() {
    const params: any = { };
    if (this.domain) params.domain = this.domain.trim();
    if (this.provider) params.provider = this.provider.trim();
    if (this.lastMin) params.lastSignInMin = new Date(this.lastMin).toISOString();
    if (this.lastMax) params.lastSignInMax = new Date(this.lastMax).toISOString();
    if (this.limit) params.limit = String(this.limit);
    const httpParams = new HttpParams({ fromObject: params });
    this.http.get<AdminUsersResponse>('/api/admin/users', { params: httpParams }).subscribe({
      next: (res) => { this._users.set(res.users || []); this._total.set(res.total ?? res.users?.length ?? 0); },
      error: (err) => { console.error('admin-users failed', err); this._users.set([]); this._total.set(0); }
    });
  }

  // Auto-load once when the page opens
  constructor() {
    setTimeout(() => this.reload(), 0);
  }
}
