import { Component, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
import { DemoDataResetService } from '../../core/services/demo-data-reset.service';

@Component({
  selector: 'app-dev-tools-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <main class="min-h-screen p-6 max-w-xl mx-auto">
      <header class="mb-6">
        <h1 class="text-2xl font-semibold">Dev Tools</h1>
        <p class="text-sm text-gray-600 mt-1">
          Dev/E2E only. Active when <code>featureFlags.useDummyData=true</code>.
        </p>
      </header>

      <section class="rounded-xl border border-gray-200 bg-white p-4">
        <h2 class="text-base font-semibold">Demo data</h2>
        <p class="text-sm text-gray-600 mt-1">
          Clears dummy rooms, rides, marketplace items, and users, then reseeds full datasets.
        </p>

        <div class="mt-4 flex items-center gap-3">
          <button
            class="px-4 py-2 rounded-lg bg-black text-white text-sm font-medium disabled:opacity-50"
            (click)="onReset()"
            [disabled]="busy() || !allowed()"
          >
            Reset demo data
          </button>

          <a class="text-sm text-gray-700 underline" routerLink="/home">Back to app</a>
        </div>

        <div class="mt-3 text-sm" *ngIf="message() as m">
          <div class="text-gray-700">{{ m }}</div>
          <div class="text-gray-500" *ngIf="consoleHint()">
            Console: <code>window.setlyResetDummyData()</code>
          </div>
        </div>

        <div class="mt-3 text-sm text-red-700" *ngIf="!allowed()">
          Not available (production build or <code>useDummyData</code> disabled).
        </div>
      </section>
    </main>
  `,
})
export class DevToolsPage {
  private reset = inject(DemoDataResetService);

  busy = signal(false);
  message = signal<string | null>(null);

  allowed = computed(() => !environment.production && !!(environment as any)?.featureFlags?.useDummyData);
  consoleHint = computed(() => this.allowed());

  async onReset() {
    if (!this.allowed()) return;

    this.busy.set(true);
    this.message.set('Resetting demo data…');

    try {
      const res = await this.reset.resetDemoData({ reload: true });
      if (!res.ok) {
        this.message.set('Reset skipped (not in dummy-data dev mode).');
      } else {
        const c = res.counts;
        this.message.set(`Reset complete. Reseeded ${c?.users} users, ${c?.rooms} rooms, ${c?.rides} rides, ${c?.marketplace} marketplace items. Reloading…`);
      }
    } catch (e: any) {
      this.message.set(`Reset failed: ${e?.message || String(e)}`);
      this.busy.set(false);
    }
  }
}
