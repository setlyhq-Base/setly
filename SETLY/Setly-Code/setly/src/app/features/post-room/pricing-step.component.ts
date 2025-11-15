import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PostRoomStore } from './post-room.store';

@Component({
  selector: 'app-pricing-step',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="space-y-8 pricing-step">
      <h2 class="text-xl font-semibold text-gray-900 mb-4 leading-tight">Pricing & Details</h2>

      <!-- Monthly Rent -->
      <div class="form-group">
        <label for="monthly-rent" class="form-label">
          Monthly Rent ($) <span class="text-red-500">*</span>
        </label>
        <input
          id="monthly-rent"
          type="number"
          placeholder="1200"
          class="form-input"
          [value]="store.draft().price.monthly || ''"
          (input)="onMonthlyChange($any($event.target).value)"
          min="100"
          max="5000"
          data-testid="pr-price-monthly"
          aria-describedby="monthly-error"
        >
        <div id="monthly-error" class="form-error" *ngIf="monthlyError()">
          {{ monthlyError() }}
        </div>
      </div>

      <!-- Security Deposit -->
      <div class="form-group">
        <label for="deposit" class="form-label">Security Deposit ($)</label>
        <input
          id="deposit"
          type="number"
          placeholder="500"
          class="form-input"
          [value]="store.draft().price.deposit || ''"
          (input)="onDepositChange($any($event.target).value)"
          min="0"
          data-testid="pr-price-deposit"
        >
        <p class="text-sm text-gray-600 mt-2">Optional security deposit amount</p>
      </div>

      <!-- Minimum Stay -->
      <div class="form-group">
        <label for="min-stay" class="form-label">Minimum Stay (months)</label>
        <input
          id="min-stay"
          type="number"
          placeholder="3"
          class="form-input"
          [value]="store.draft().price.minStayMonths || ''"
          (input)="onMinStayChange($any($event.target).value)"
          min="1"
          max="12"
          data-testid="pr-min-stay"
        >
      </div>

      <!-- Utilities Included -->
      <div class="form-group">
        <label class="form-label">Utilities Included</label>
        <div class="flex flex-wrap gap-3 mt-2">
          <label *ngFor="let utility of availableUtilities" class="chip-checkbox">
            <input
              type="checkbox"
              [checked]="isUtilitySelected(utility)"
              (change)="toggleUtility(utility)"
              class="sr-only"
            >
            <span class="chip-checkbox-label">{{ utility }}</span>
          </label>
        </div>
        <div data-testid="pr-utilities" class="sr-only">
          {{ store.draft().price.utilitiesIncluded.join(',') }}
        </div>
      </div>

      <!-- Note to Tenants -->
      <div class="form-group">
        <label for="note" class="form-label">Note to Potential Tenants</label>
        <textarea
          id="note"
          rows="4"
          placeholder="Any additional information about your listing..."
          class="form-input"
          [value]="store.draft().noteToTenants || ''"
          (input)="onNoteChange($any($event.target).value)"
          maxlength="240"
          data-testid="pr-note"
        ></textarea>
        <div class="flex justify-between text-sm text-gray-600 mt-2">
          <span>Optional message for potential tenants</span>
          <span>{{ (store.draft().noteToTenants || '').length }}/240</span>
        </div>
      </div>

      <!-- Summary -->
      <div class="summary-box bg-white rounded-xl p-5 border border-gray-200">
        <h3 class="text-base font-semibold text-gray-900 mb-3 leading-tight">📋 Ready to Publish</h3>
        <p class="text-gray-700 mb-3 text-sm leading-relaxed">
          Your room listing will be published and visible to students searching for housing.
          You can edit or remove the listing at any time from your dashboard.
        </p>
        <div class="bg-white rounded-lg p-4 space-y-2 text-sm">
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Monthly Rent:</span>
            <span class="font-semibold text-gray-900">
              {{ store.draft().price.monthly ? '$' + store.draft().price.monthly : 'Not set' }}
            </span>
          </div>
          <div class="flex justify-between text-sm" *ngIf="store.draft().price.deposit">
            <span class="text-gray-600">Deposit:</span>
            <span class="font-semibold text-gray-900">\${{ store.draft().price.deposit }}</span>
          </div>
          <div class="flex justify-between text-sm" *ngIf="store.draft().price.minStayMonths">
            <span class="text-gray-600">Min Stay:</span>
            <span class="font-semibold text-gray-900">{{ store.draft().price.minStayMonths }} months</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chip-checkbox { @apply relative inline-flex items-center cursor-pointer; }
    .chip-checkbox input:checked + .chip-checkbox-label { @apply bg-blue-500 text-white border-blue-500; }
    .chip-checkbox-label { @apply px-4 py-2 rounded-full border-2 border-gray-300 text-sm font-medium text-gray-700 transition-all duration-200 hover:border-blue-500; }
    /* Compact overrides */
    .post-room-compact .pricing-step h2 { @apply text-lg mb-3; }
    .post-room-compact .pricing-step .form-group { margin-bottom:1rem; }
    .post-room-compact .chip-checkbox-label { @apply px-3 py-1 text-xs; }
    .post-room-compact .pricing-step .summary-box { @apply p-4; }
    .post-room-compact .pricing-step .summary-box h3 { @apply mb-2 text-sm; }
    .post-room-compact .pricing-step .summary-box p { @apply text-xs mb-2; }
    .post-room-compact .pricing-step .summary-box div { @apply text-xs; }
  `]
})
export class PricingStepComponent {
  store = inject(PostRoomStore);
  
  availableUtilities = ['Electricity', 'Water', 'Gas', 'Internet', 'Heating', 'Cable TV'];

  monthlyError() {
    const monthly = this.store.draft().price.monthly;
    if (!monthly) return 'Monthly rent is required';
    if (monthly < 100) return 'Rent must be at least $100';
    if (monthly > 5000) return 'Rent must be less than $5000';
    return '';
  }

  onMonthlyChange(value: string) {
    const monthly = value ? parseInt(value, 10) : 0;
    this.store.updateDraft({
      price: { ...this.store.draft().price, monthly }
    });
  }

  onDepositChange(value: string) {
    const deposit = value ? parseInt(value, 10) : 0;
    this.store.updateDraft({
      price: { ...this.store.draft().price, deposit }
    });
  }

  onMinStayChange(value: string) {
    const minStayMonths = value ? parseInt(value, 10) : 0;
    this.store.updateDraft({
      price: { ...this.store.draft().price, minStayMonths }
    });
  }

  onNoteChange(value: string) {
    const noteToTenants = value.slice(0, 240);
    this.store.updateDraft({ noteToTenants });
  }

  isUtilitySelected(utility: string): boolean {
    return this.store.draft().price.utilitiesIncluded.includes(utility);
  }

  toggleUtility(utility: string) {
    const utilities = [...this.store.draft().price.utilitiesIncluded];
    const index = utilities.indexOf(utility);
    
    if (index > -1) {
      utilities.splice(index, 1);
    } else {
      utilities.push(utility);
    }
    
    this.store.updateDraft({
      price: { ...this.store.draft().price, utilitiesIncluded: utilities }
    });
  }
}
