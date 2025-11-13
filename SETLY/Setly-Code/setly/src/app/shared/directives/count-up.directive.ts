import { Directive, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';

@Directive({
  selector: '[countUp]',
  standalone: true
})
export class CountUpDirective implements OnInit, OnDestroy {
  @Input('countUp') end = 0;
  @Input() duration = 1200; // ms
  @Input() prefix = '';
  @Input() suffix = '';
  @Input() decimals = 0;

  private observer?: IntersectionObserver;
  private started = false;
  private rafId = 0;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    // Defer animation until visible
    this.observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && !this.started) {
          this.started = true;
          this.animate();
          this.cleanupObserver();
          break;
        }
      }
    }, { threshold: 0.2 });

    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.cleanupObserver();
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }

  private animate() {
    const start = performance.now();
    const from = 0;
    const to = this.end;
    const dec = Math.max(0, this.decimals | 0);

    const step = (t: number) => {
      const p = Math.min(1, (t - start) / this.duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - p, 3);
      const val = from + (to - from) * eased;
      const shown = Number(val.toFixed(dec)).toLocaleString(undefined, { minimumFractionDigits: dec, maximumFractionDigits: dec });
      this.el.nativeElement.textContent = `${this.prefix}${shown}${this.suffix}`;
      if (p < 1) this.rafId = requestAnimationFrame(step);
    };

    this.rafId = requestAnimationFrame(step);
  }

  private cleanupObserver() {
    try { this.observer?.disconnect(); } catch {}
    this.observer = undefined;
  }
}
