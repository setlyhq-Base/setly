import { Directive, ElementRef, EventEmitter, HostListener, Output, inject } from '@angular/core';

@Directive({
  selector: '[appPullToRefresh]',
  standalone: true
})
export class PullToRefreshDirective {
  @Output() refresh = new EventEmitter<void>();

  private el = inject(ElementRef);
  private startY = 0;
  private pulling = false;
  private threshold = 80; // Pull distance threshold

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    // Only start if at top of scroll
    if (this.el.nativeElement.scrollTop === 0) {
      this.startY = event.touches[0].clientY;
      this.pulling = true;
    }
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent) {
    if (!this.pulling) return;

    const currentY = event.touches[0].clientY;
    const diff = currentY - this.startY;

    // Only allow pull down
    if (diff > 0 && this.el.nativeElement.scrollTop === 0) {
      // Prevent default scroll while pulling
      if (diff > 10) {
        event.preventDefault();
      }
    } else {
      this.pulling = false;
    }
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent) {
    if (!this.pulling) return;

    const endY = event.changedTouches[0].clientY;
    const diff = endY - this.startY;

    // Trigger refresh if pulled beyond threshold
    if (diff > this.threshold) {
      this.refresh.emit();
    }

    this.pulling = false;
    this.startY = 0;
  }
}
