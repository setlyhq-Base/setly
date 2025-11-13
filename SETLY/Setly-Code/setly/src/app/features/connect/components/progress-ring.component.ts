import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress-ring',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg [attr.width]="size" [attr.height]="size" [attr.viewBox]="'0 0 ' + size + ' ' + size" class="block">
      <circle
        [attr.cx]="size/2" [attr.cy]="size/2" [attr.r]="radius"
        stroke="#E5E7EB" stroke-width="6" fill="none" />
      <circle
        [attr.cx]="size/2" [attr.cy]="size/2" [attr.r]="radius"
        stroke="var(--brand)" stroke-width="6" fill="none"
        [attr.stroke-dasharray]="circumference"
        [attr.stroke-dashoffset]="circumference - (value/100)*circumference"
        stroke-linecap="round"
        style="transition: stroke-dashoffset 600ms ease" />
      <text [attr.x]="size/2" [attr.y]="size/2 + 4" text-anchor="middle" class="fill-gray-800" style="font-size: 12px; font-weight: 600;">{{ value | number:'1.0-0' }}%</text>
    </svg>
  `
})
export class ProgressRingComponent {
  @Input() value = 0;
  @Input() size = 64;
  get radius() { return (this.size - 8) / 2; }
  get circumference() { return 2 * Math.PI * this.radius; }
}
