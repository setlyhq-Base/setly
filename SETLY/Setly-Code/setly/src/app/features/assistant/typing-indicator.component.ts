import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-typing-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center gap-2 text-gray-500" aria-live="polite">
      <span class="sr-only">Assistant is typing</span>
      <div class="flex gap-1">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </div>
    </div>
  `,
  styles: [`
    .dot{ width:6px; height:6px; border-radius:9999px; background:#a3a3a3; display:inline-block; animation:b 1.2s infinite ease-in-out; }
    .dot:nth-child(2){ animation-delay:.2s }
    .dot:nth-child(3){ animation-delay:.4s }
    @keyframes b{ 0%,80%,100%{ transform: scale(0); opacity:.6 } 40%{ transform: scale(1); opacity:1 } }
  `]
})
export class TypingIndicatorComponent {}
