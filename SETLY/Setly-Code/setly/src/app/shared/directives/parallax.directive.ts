import { Directive, ElementRef, HostListener, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appParallax]',
  standalone: true
})
export class ParallaxDirective implements OnInit, OnDestroy {
  @Input('appParallax') speed = 0.2; // 0..1

  private frame = 0;
  private cleanupScroll?: () => void;

  constructor(private el: ElementRef<HTMLElement>, private rd: Renderer2) {}

  ngOnInit(): void {
    // Use passive scroll listener and rAF for smoother transforms
    const onScroll = () => {
      if (this.frame) return; // coalesce
      this.frame = requestAnimationFrame(() => {
        this.frame = 0;
        this.apply();
      });
    };
    this.cleanupScroll = this.rd.listen('window', 'scroll', onScroll);
    // Initial
    setTimeout(() => this.apply(), 0);
  }

  ngOnDestroy(): void {
    if (this.cleanupScroll) this.cleanupScroll();
    if (this.frame) cancelAnimationFrame(this.frame);
  }

  private apply() {
    const node = this.el.nativeElement;
    const rect = node.getBoundingClientRect();
    const vh = window.innerHeight || 800;
    // Parallax only when in view
    if (rect.bottom < 0 || rect.top > vh) return;
    const centerOffset = (rect.top + rect.height / 2) - vh / 2; // px relative to viewport center
    const translate = -centerOffset * this.speed * 0.15; // dampened
    node.style.transform = `translate3d(0, ${translate.toFixed(2)}px, 0)`;
  }
}
