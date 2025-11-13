import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Testimonial {
  id: string;
  name: string;
  text: string;
  role: string;
  avatar: string;
}

@Component({
  selector: 'app-testimonial-carousel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative" data-testid="testimonials-carousel">
      <div class="overflow-hidden">
        <div class="flex transition-transform duration-500 ease-in-out" [style.transform]="'translateX(-' + currentIndex() * 100 + '%)'">
          <div *ngFor="let testimonial of testimonials(); let i = index" class="min-w-full px-4">
            <div class="bg-white rounded-2xl p-8 shadow-lg max-w-md mx-auto">
              <div class="flex items-start space-x-4 mb-4">
                <img [src]="testimonial.avatar" [alt]="testimonial.name" class="w-12 h-12 rounded-full">
                <div>
                  <h4 class="font-semibold text-gray-900">{{ testimonial.name }}</h4>
                  <p class="text-gray-600 text-sm">{{ testimonial.role }}</p>
                </div>
              </div>
              <p class="text-gray-700 italic mb-6">"{{ testimonial.text }}"</p>
              <div class="flex space-x-1">
                <span *ngFor="let star of [1,2,3,4,5]" class="text-yellow-400">★</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <button 
        (click)="prev()" 
        class="absolute left-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition"
        aria-label="Previous testimonial"
        [attr.disabled]="currentIndex() === 0"
      >
        ‹
      </button>
      <button 
        (click)="next()" 
        class="absolute right-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition"
        aria-label="Next testimonial"
      >
        ›
      </button>
      <!-- Indicators -->
      <div class="flex justify-center space-x-2 mt-6">
        <button 
          *ngFor="let testimonial of testimonials(); let i = index"
          (click)="goTo(i)"
          [class]="'w-2 h-2 rounded-full ' + (i === currentIndex() ? 'bg-blue-600' : 'bg-gray-300')"
          aria-label="Go to testimonial {{ i + 1 }}"
        ></button>
      </div>
    </div>
  `,
  styles: [`
    .transition-transform {
      will-change: transform;
    }
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class TestimonialCarouselComponent {
  testimonials = signal<Testimonial[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      text: 'Setly made finding the perfect room so easy! The filters for lifestyle preferences were exactly what I needed.',
      role: 'UCLA Student',
  avatar: '/assets/avatars/sarah.svg'
    },
    {
      id: '2',
      name: 'Mike Chen',
      text: 'The SetlyRide feature saved me during move-in week. Found a ride to campus in minutes!',
      role: 'UC Berkeley Student',
  avatar: '/assets/avatars/mike.svg'
    },
    {
      id: '3',
      name: 'Priya Patel',
      text: 'Love how Setly connects you with roommates who share your values. Found my perfect match!',
      role: 'NYU Student',
  avatar: '/assets/avatars/priya.svg'
    }
  ]);

  currentIndex = signal(0);
  autoPlayInterval: any;

  constructor() {
    this.startAutoPlay();
  }

  ngOnDestroy() {
    this.stopAutoPlay();
  }

  startAutoPlay() {
    this.autoPlayInterval = setInterval(() => {
      this.next();
    }, 5000);
  }

  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
    }
  }

  next() {
    const nextIndex = this.currentIndex() === this.testimonials().length - 1 ? 0 : this.currentIndex() + 1;
    this.currentIndex.set(nextIndex);
    this.stopAutoPlay(); // Pause on interaction
    setTimeout(() => this.startAutoPlay(), 10000); // Resume after 10s
  }

  prev() {
    const prevIndex = this.currentIndex() === 0 ? this.testimonials().length - 1 : this.currentIndex() - 1;
    this.currentIndex.set(prevIndex);
    this.stopAutoPlay();
    setTimeout(() => this.startAutoPlay(), 10000);
  }

  goTo(index: number) {
    this.currentIndex.set(index);
    this.stopAutoPlay();
    setTimeout(() => this.startAutoPlay(), 10000);
  }

  onMouseEnter() {
    this.stopAutoPlay();
  }

  onMouseLeave() {
    this.startAutoPlay();
  }
}
