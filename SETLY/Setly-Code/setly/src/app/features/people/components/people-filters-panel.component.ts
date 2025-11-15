import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type PeopleSort = 'recent' | 'alpha' | 'university' | 'location';

export interface PeopleFilters {
  q: string;
  roles: { student: boolean; professional: boolean };
  orgs: string[]; // university/company tokens (simple multi-input)
  location: { city?: string; state?: string; country?: string };
  verified: { email: boolean; phone: boolean; edu: boolean };
  interests: string[];
  sort: PeopleSort;
}

@Component({
  selector: 'app-people-filters-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-5 text-[13px]">
      <!-- A. Search Users -->
      <div>
        <div class="font-semibold text-gray-700 mb-1 flex items-center gap-2">
          <span class="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
          Search Users
        </div>
        <input type="search" [(ngModel)]="state.q" (input)="emit()" class="w-full border rounded-lg px-3 py-2" placeholder="Search by name, university, company…" />
      </div>

      <!-- B. Role -->
      <div>
        <div class="font-semibold text-gray-700 mb-1 flex items-center gap-2">
          <span class="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
          Role
        </div>
        <label class="flex items-center gap-2 mb-1">
          <input type="checkbox" [(ngModel)]="state.roles.student" (change)="emit()" /> Student
        </label>
        <label class="flex items-center gap-2">
          <input type="checkbox" [(ngModel)]="state.roles.professional" (change)="emit()" /> Working Professional
        </label>
      </div>

      <!-- C. University / Company (simple tokens) -->
      <div>
        <div class="font-semibold text-gray-700 mb-1 flex items-center gap-2">
          <span class="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
          University / Company
        </div>
        <div class="flex items-center gap-2 mb-2">
          <input #orgInp type="text" class="flex-1 border rounded-lg px-3 py-2" placeholder="Type and press Enter" (keydown.enter)="addOrg(orgInp.value); orgInp.value=''; $event.preventDefault();" />
          <button class="px-2 py-1 text-xs border rounded" (click)="addOrg(orgInp.value); orgInp.value=''">Add</button>
        </div>
        <div class="flex flex-wrap gap-2">
          <button *ngFor="let o of state.orgs; let i = index" class="px-2 py-1 rounded-full bg-gray-50 border text-xs" (click)="removeOrg(i)" title="Remove">{{o}} ×</button>
        </div>
      </div>

      <!-- D. Location -->
      <div>
        <div class="font-semibold text-gray-700 mb-1 flex items-center gap-2">
          <span class="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
          Location
        </div>
        <div class="grid grid-cols-3 gap-2">
          <input type="text" [(ngModel)]="state.location.city" (input)="emit()" class="border rounded-lg px-2 py-1.5" placeholder="City" />
          <input type="text" [(ngModel)]="state.location.state" (input)="emit()" class="border rounded-lg px-2 py-1.5" placeholder="State" />
          <input type="text" [(ngModel)]="state.location.country" (input)="emit()" class="border rounded-lg px-2 py-1.5" placeholder="Country" />
        </div>
      </div>

      <!-- E. Verification Filters -->
      <div>
        <div class="font-semibold text-gray-700 mb-1 flex items-center gap-2">
          <span class="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
          Verifications
        </div>
        <label class="flex items-center gap-2 mb-1"><input type="checkbox" [(ngModel)]="state.verified.email" (change)="emit()"/> Verified Email</label>
        <label class="flex items-center gap-2 mb-1"><input type="checkbox" [(ngModel)]="state.verified.phone" (change)="emit()"/> Verified Phone</label>
        <label class="flex items-center gap-2"><input type="checkbox" [(ngModel)]="state.verified.edu" (change)="emit()"/> University Verified</label>
      </div>

      <!-- F. Interests (optional) -->
      <div>
        <div class="font-semibold text-gray-700 mb-1 flex items-center gap-2">
          <span class="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
          Interests
        </div>
        <div class="flex items-center gap-2 mb-2">
          <input #tagInp type="text" class="flex-1 border rounded-lg px-3 py-2" placeholder="Add a tag and press Enter" (keydown.enter)="addTag(tagInp.value); tagInp.value=''; $event.preventDefault();" />
          <button class="px-2 py-1 text-xs border rounded" (click)="addTag(tagInp.value); tagInp.value=''">Add</button>
        </div>
        <div class="flex flex-wrap gap-2">
          <button *ngFor="let t of state.interests; let i = index" class="px-2 py-1 rounded-full bg-gray-50 border text-xs" (click)="removeTag(i)" title="Remove">{{t}} ×</button>
        </div>
      </div>

      <!-- G. Sort Options -->
      <div>
        <div class="font-semibold text-gray-700 mb-1 flex items-center gap-2">
          <span class="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
          Sort
        </div>
        <select [(ngModel)]="state.sort" (change)="emit()" class="w-full border rounded-lg px-2 py-2">
          <option value="recent">Recently Joined</option>
          <option value="alpha">Alphabetical (A–Z)</option>
          <option value="university">By University</option>
          <option value="location">By Location</option>
        </select>
      </div>

      <!-- H. Reset -->
      <div class="pt-2">
        <button (click)="reset()" class="w-full px-3 py-2 border rounded-lg text-sm">Reset Filters</button>
      </div>
    </div>
  `
})
export class PeopleFiltersPanelComponent {
  @Output() changed = new EventEmitter<PeopleFilters>();

  state: PeopleFilters = {
    q: '',
    roles: { student: false, professional: false },
    orgs: [],
    location: {},
    verified: { email: false, phone: false, edu: false },
    interests: [],
    sort: 'recent'
  };

  emit(){ this.changed.emit({ ...this.state, orgs: [...this.state.orgs], interests: [...this.state.interests] }); }

  addOrg(v: string){ const val = (v||'').trim(); if (!val) return; if (!this.state.orgs.includes(val)) this.state.orgs.push(val); this.emit(); }
  removeOrg(i: number){ this.state.orgs.splice(i, 1); this.emit(); }

  addTag(v: string){ const val = (v||'').trim(); if (!val) return; if (!this.state.interests.includes(val)) this.state.interests.push(val); this.emit(); }
  removeTag(i: number){ this.state.interests.splice(i, 1); this.emit(); }

  reset(){
    this.state = { q: '', roles: { student:false, professional:false }, orgs: [], location: {}, verified: { email:false, phone:false, edu:false }, interests: [], sort: 'recent' };
    this.emit();
  }
}
