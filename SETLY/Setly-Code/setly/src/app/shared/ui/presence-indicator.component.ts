import { Component, OnDestroy, signal } from '@angular/core';

interface PresenceStatusDetail { status: string; intervalMs?: number; failures?: number; meta?: any; }

@Component({
  selector: 'presence-indicator',
  standalone: true,
  template: `
    <div class="presence-indicator" [class.ok]="state() === 'ok'" [class.degraded]="state() === 'degraded'" [class.stopped]="state() === 'stopped'" [class.disabled]="state() === 'disabled'" [class.hidden]="hidden()">
      <span class="dot"></span>
      <span class="label">{{ label() }}</span>
    </div>
  `,
  styles: [`
    .presence-indicator { position: fixed; bottom: 6px; right: 8px; font: 11px/1.2 system-ui, sans-serif; display: flex; align-items: center; gap: 4px; padding: 4px 6px; border-radius: 6px; background: rgba(0,0,0,0.55); color: #fff; backdrop-filter: blur(4px); z-index: 4000; transition: opacity .3s ease; }
    .presence-indicator.hidden { opacity: 0; pointer-events: none; }
    .presence-indicator .dot { width: 8px; height: 8px; border-radius: 50%; background: #4ade80; box-shadow: 0 0 0 2px rgba(255,255,255,0.2); }
    .presence-indicator.degraded .dot { background: #fbbf24; }
    .presence-indicator.stopped .dot, .presence-indicator.disabled .dot { background: #f87171; }
    .presence-indicator .label { white-space: nowrap; }
    /* Hide on mobile to avoid overlap with bottom nav */
    @media (max-width: 767px) {
      .presence-indicator { display: none; }
    }
  `]
})
export class PresenceIndicatorComponent implements OnDestroy {
  state = signal('ok');
  label = signal('online');
  hidden = signal(true);
  private lastMeta: any = null;
  private handler = (ev: Event) => {
    const detail = (ev as CustomEvent<PresenceStatusDetail>).detail;
    if (!detail) return;
  this.state.update(() => detail.status);
  this.hidden.update(() => detail.status === 'ok');
  if (detail.status === 'ok') this.label.update(() => 'online');
  else if (detail.status === 'degraded') this.label.update(() => 'presence degraded');
  else if (detail.status === 'stopped') this.label.update(() => 'presence stopped');
  else if (detail.status === 'disabled') this.label.update(() => 'presence disabled');
    this.lastMeta = detail.meta;
  };
  constructor(){
    window.addEventListener('presence-status', this.handler as any);
  }
  ngOnDestroy(){
    window.removeEventListener('presence-status', this.handler as any);
  }
}