import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CodeTimerService {
  private timer = signal<number>(0);
  private intervalId: number | null = null;

  get remainingTime() {
    return this.timer.asReadonly();
  }

  startTimer(seconds: number = 60): void {
    this.stopTimer();
    this.timer.set(seconds);
    this.intervalId = window.setInterval(() => {
      const current = this.timer();
      if (current > 0) {
        this.timer.set(current - 1);
      } else {
        this.stopTimer();
      }
    }, 1000);
  }

  stopTimer(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.timer.set(0);
  }

  isActive(): boolean {
    return this.timer() > 0;
  }
}
