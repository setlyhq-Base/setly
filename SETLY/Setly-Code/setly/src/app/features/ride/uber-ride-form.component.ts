import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-uber-ride-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <form data-testid="tab-uberride" (ngSubmit)="onSubmit()" class="space-y-6">
      <!-- Use Current Location -->
      <div>
        <label class="flex items-center">
          <input
            data-testid="uber-use-current"
            type="checkbox"
            [(ngModel)]="useCurrentLocation"
            name="useCurrent"
            class="text-indigo-600 focus:ring-indigo-500"
          />
          <span class="ml-2 text-sm text-gray-700">Use current location</span>
        </label>
      </div>

      <!-- Pickup Location -->
      <div *ngIf="!useCurrentLocation">
        <label for="pickup" class="block text-sm font-medium text-gray-700 mb-1">
          Pickup location
        </label>
        <input
          data-testid="uber-pickup"
          id="pickup"
          type="text"
          [(ngModel)]="pickup"
          name="pickup"
          placeholder="Enter pickup address"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <!-- Drop Location -->
      <div>
        <label for="drop" class="block text-sm font-medium text-gray-700 mb-1">
          Drop location *
        </label>
        <input
          data-testid="uber-drop"
          id="drop"
          type="text"
          [(ngModel)]="drop"
          name="drop"
          required
          placeholder="Enter destination"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <!-- Car Type -->
      <div>
        <label for="product" class="block text-sm font-medium text-gray-700 mb-1">
          Car type
        </label>
        <select
          data-testid="uber-product"
          id="product"
          [(ngModel)]="productType"
          name="product"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="uberx">UberX</option>
          <option value="uberxl">UberXL</option>
          <option value="uberblack">Uber Black</option>
        </select>
      </div>

      <!-- Submit Button -->
      <button
        data-testid="uber-open"
        type="submit"
        class="w-full bg-black text-white py-3 px-4 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
        [disabled]="!isFormValid()"
      >
        Open in Uber
      </button>

      <!-- Legal Note -->
      <p class="text-xs text-gray-500 text-center">
        This opens Uber to complete your ride. Setly is not affiliated with Uber and does not manage bookings or payments.
      </p>
    </form>
  `
})
export class UberRideFormComponent {
  useCurrentLocation = true;
  pickup = '';
  drop = '';
  productType = 'uberx';

  isFormValid(): boolean {
    return !!this.drop && (this.useCurrentLocation || !!this.pickup);
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      alert('Please enter both pickup and drop locations.');
      return;
    }

    const pickupParam = this.useCurrentLocation ? 'my_location' : encodeURIComponent(this.pickup);
    const dropParam = encodeURIComponent(this.drop);
    const productParam = this.productType !== 'uberx' ? `&product_type=${this.productType}` : '';

    // Try mobile deep link first
    const mobileUrl = `uber://?action=setPickup&pickup=${pickupParam}&dropoff[formatted_address]=${dropParam}${productParam}`;

    // Fallback web URL
    const webUrl = `https://m.uber.com/ul/?action=setPickup&pickup=${pickupParam}&dropoff[formatted_address]=${dropParam}${productParam}`;

    // Analytics
    console.log('uberride_opened', { pickup_mode: this.useCurrentLocation ? 'current' : 'manual' });
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: 'uberride_opened',
        pickup_mode: this.useCurrentLocation ? 'current' : 'manual'
      });
    }

    // Open the URL - browser will handle deep link or fallback
    window.location.href = mobileUrl;

    // Fallback to web URL after a short delay if deep link doesn't work
    setTimeout(() => {
      window.open(webUrl, '_blank');
    }, 1000);
  }
}
