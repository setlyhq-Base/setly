import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-phone-confirmation-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" *ngIf="show">
      <div class="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
        <div class="text-center">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="text-2xl">📞</span>
          </div>
          <h3 class="text-lg font-semibold mb-2">Confirm Your Phone Number</h3>
          <p class="text-gray-600 mb-4">Is this your correct phone number?</p>
          <div class="bg-gray-50 rounded-lg p-4 mb-6">
            <p class="text-xl font-mono font-semibold">{{ phoneNumber }}</p>
          </div>
          <div class="flex gap-3">
            <button
              type="button"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              (click)="onEdit()">
              Edit
            </button>
            <button
              type="button"
              class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              (click)="onConfirm()">
              Yes
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PhoneConfirmationModalComponent {
  @Input() show = false;
  @Input() phoneNumber = '';
  @Output() confirm = new EventEmitter<void>();
  @Output() edit = new EventEmitter<void>();

  onConfirm() {
    this.confirm.emit();
  }

  onEdit() {
    this.edit.emit();
  }
}
