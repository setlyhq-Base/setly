import { Component, forwardRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CountryCodeSelectComponent } from './country-code-select.component';
import { matchDialCode } from '../data/country-codes';

@Component({
  selector: 'app-intl-phone-input',
  standalone: true,
  imports: [CommonModule, FormsModule, CountryCodeSelectComponent],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => IntlPhoneInputComponent),
    multi: true
  }],
  template: `
    <div class="intl-wrap" [class.disabled]="disabled">
      <div class="field">
        <div class="cc-wrap">
          <app-country-code-select appearance="bare" [(ngModel)]="dial" (ngModelChange)="onDial($event)" [disabled]="disabled"></app-country-code-select>
        </div>
        <input type="tel" class="number" [placeholder]="placeholder || 'Phone number*'" [value]="displayValue" (input)="onLocal($event)" (blur)="onTouched()" [disabled]="disabled"/>
      </div>
    </div>
  `,
  styles: [`
    :host { display:block; }
    .intl-wrap { }
    .field { display:flex; align-items:center; height:44px; border:1px solid #d1d5db; border-radius:.85rem; background:#fff; }
    .field:focus-within { outline:none; border-color:#6366f1; box-shadow:0 0 0 3px rgba(99,102,241,.35); }
    .cc-wrap { display:flex; align-items:center; height:100%; padding:0 .6rem; border-right:1px solid #e5e7eb; border-top-left-radius:.85rem; border-bottom-left-radius:.85rem; }
    app-country-code-select { border-top-left-radius:.85rem; border-bottom-left-radius:.85rem; }
    .number { flex:1; border:none; outline:none; height:100%; padding:0 .9rem; border-top-right-radius:.85rem; border-bottom-right-radius:.85rem; font-size:.85rem; font-weight:500; color:#0b1221; }
  `]
})
export class IntlPhoneInputComponent implements ControlValueAccessor {
  @Input() placeholder?: string;

  disabled = false;
  dial = '+1';
  local = '';

  private propagateChange: (v: string) => void = () => {};
  private propagateTouched: () => void = () => {};

  writeValue(v: any): void {
    const value = (v || '').toString();
    if (value && value.startsWith('+')) {
      const match = matchDialCode(value);
      if (match) {
        this.dial = match.dial;
        this.local = value.slice(match.dial.length);
      } else {
        this.dial = '+1';
        this.local = value.replace(/\D/g, '');
      }
    } else {
      // empty value
      this.local = '';
    }
  }
  registerOnChange(fn: any): void { this.propagateChange = fn; }
  registerOnTouched(fn: any): void { this.propagateTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }

  get displayValue() { return this.local; }

  private combine(): string {
    const digits = (this.local || '').toString().replace(/\D/g, '');
    if (!this.dial || !digits) return '';
    return `${this.dial}${digits}`;
  }

  onDial(v: string) {
    this.dial = v;
    this.propagateChange(this.combine());
  }

  onLocal(e: Event) {
    const t = e.target as HTMLInputElement;
    this.local = (t.value || '').replace(/[^0-9]/g, '');
    t.value = this.local; // keep sanitized
    this.propagateChange(this.combine());
  }

  onTouched() { this.propagateTouched(); }
}
