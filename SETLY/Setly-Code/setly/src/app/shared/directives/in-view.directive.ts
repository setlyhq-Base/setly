import { Directive, ElementRef, Input, OnDestroy, AfterViewInit } from '@angular/core';

/**
 * InViewDirective
 * Adds the class `in-view` to the host element once it enters the viewport.
 * Use with initial state utility classes like `will-fade-up` or `float-in` for micro animations.
 * Example: <div inView class="will-fade-up">...</div>
 */
@Directive({
  selector: '[inView]',
  standalone: true
})
export class InViewDirective implements AfterViewInit, OnDestroy {
  @Input('inViewOnce') inViewOnce: boolean = true; // if false, toggles on/off as element leaves/enters
  @Input() rootMargin: string = '0px 0px -10% 0px';
  @Input() threshold: number | number[] = 0.15;

  private observer?: IntersectionObserver;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    // Defer to next microtask to ensure element in DOM
    queueMicrotask(() => this.createObserver());
  }

  private createObserver() {
    if (this.observer) return;
    this.observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          this.el.nativeElement.classList.add('in-view');
          if (this.inViewOnce) {
            this.observer?.disconnect();
          }
        } else if (!this.inViewOnce) {
          this.el.nativeElement.classList.remove('in-view');
        }
      }
    }, { root: null, rootMargin: this.rootMargin, threshold: this.threshold });

    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
