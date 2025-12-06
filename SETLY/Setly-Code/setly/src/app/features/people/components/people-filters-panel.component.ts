import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type PeopleSort = 'recent' | 'active' | 'nearby' | 'recommended' | 'university' | 'interests';

export interface PeopleFilters {
  q: string;
  roles: { student: boolean; professional: boolean; alumni: boolean };
  orgs: string[]; // university/company tokens (simple multi-input)
  location: { city?: string; state?: string; country?: string };
  verified: { email: boolean; phone: boolean; edu: boolean };
  interests: string[];
  onlineOnly: boolean;
  sort: PeopleSort;
}

@Component({
  selector: 'app-people-filters-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 text-sm">
      <!-- A. Search Users -->
      <div>
        <div class="font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <svg class="w-4 h-4 text-brand-azure" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          Search Users
        </div>
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input type="search" 
                 [(ngModel)]="state.q" 
                 (input)="emit()" 
                 class="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-azure focus:border-transparent transition" 
                 placeholder="Search by name, university, company…" />
        </div>
      </div>

      <div class="h-px bg-gray-200"></div>

      <!-- B. Role -->
      <div>
        <div class="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <svg class="w-4 h-4 text-brand-azure" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
          Role
        </div>
        <label class="flex items-center gap-3 mb-2.5 cursor-pointer group">
          <input type="checkbox" 
                 [(ngModel)]="state.roles.student" 
                 (change)="emit()" 
                 class="w-4 h-4 text-brand-azure border-gray-300 rounded focus:ring-2 focus:ring-brand-azure cursor-pointer" />
          <span class="group-hover:text-brand-azure transition">Student</span>
        </label>
        <label class="flex items-center gap-3 mb-2.5 cursor-pointer group">
          <input type="checkbox" 
                 [(ngModel)]="state.roles.professional" 
                 (change)="emit()" 
                 class="w-4 h-4 text-brand-azure border-gray-300 rounded focus:ring-2 focus:ring-brand-azure cursor-pointer" />
          <span class="group-hover:text-brand-azure transition">Working Professional</span>
        </label>
        <label class="flex items-center gap-3 cursor-pointer group">
          <input type="checkbox" 
                 [(ngModel)]="state.roles.alumni" 
                 (change)="emit()" 
                 class="w-4 h-4 text-brand-azure border-gray-300 rounded focus:ring-2 focus:ring-brand-azure cursor-pointer" />
          <span class="group-hover:text-brand-azure transition">Alumni</span>
        </label>
      </div>

      <div class="h-px bg-gray-200"></div>

      <!-- C. University / Company -->
      <div>
        <div class="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <svg class="w-4 h-4 text-brand-azure" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
          </svg>
          University / Company
        </div>
        <div class="flex items-center gap-2 mb-2">
          <input #orgInp 
                 type="text" 
                 class="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-azure focus:border-transparent transition" 
                 placeholder="Type and press Enter" 
                 (keydown.enter)="addOrg(orgInp.value); orgInp.value=''; $event.preventDefault();" />
          <button class="px-3 py-2 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 transition" 
                  (click)="addOrg(orgInp.value); orgInp.value=''">
            Add
          </button>
        </div>
        <div class="flex flex-wrap gap-2">
          <button *ngFor="let o of state.orgs; let i = index" 
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-azure/10 text-brand-azure text-xs font-medium hover:bg-brand-azure/20 transition" 
                  (click)="removeOrg(i)" 
                  title="Remove">
            {{o}} 
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="h-px bg-gray-200"></div>

      <!-- D. Location -->
      <div>
        <div class="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <svg class="w-4 h-4 text-brand-azure" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          Location
        </div>
        <div class="space-y-2">
          <input type="text" 
                 [(ngModel)]="state.location.city" 
                 (input)="emit()" 
                 class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-azure focus:border-transparent transition" 
                 placeholder="City" />
          <input type="text" 
                 [(ngModel)]="state.location.state" 
                 (input)="emit()" 
                 class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-azure focus:border-transparent transition" 
                 placeholder="State" />
          <input type="text" 
                 [(ngModel)]="state.location.country" 
                 (input)="emit()" 
                 class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-azure focus:border-transparent transition" 
                 placeholder="Country" />
        </div>
      </div>

      <div class="h-px bg-gray-200"></div>

      <!-- E. Verification Filters -->
      <div>
        <div class="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <svg class="w-4 h-4 text-brand-azure" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
          </svg>
          Verifications
        </div>
        <label class="flex items-center gap-3 mb-2.5 cursor-pointer group">
          <input type="checkbox" 
                 [(ngModel)]="state.verified.email" 
                 (change)="emit()" 
                 class="w-4 h-4 text-brand-azure border-gray-300 rounded focus:ring-2 focus:ring-brand-azure cursor-pointer"/>
          <span class="group-hover:text-brand-azure transition">✉️ Verified Email</span>
        </label>
        <label class="flex items-center gap-3 mb-2.5 cursor-pointer group">
          <input type="checkbox" 
                 [(ngModel)]="state.verified.phone" 
                 (change)="emit()" 
                 class="w-4 h-4 text-brand-azure border-gray-300 rounded focus:ring-2 focus:ring-brand-azure cursor-pointer"/>
          <span class="group-hover:text-brand-azure transition">📱 Verified Phone</span>
        </label>
        <label class="flex items-center gap-3 cursor-pointer group">
          <input type="checkbox" 
                 [(ngModel)]="state.verified.edu" 
                 (change)="emit()" 
                 class="w-4 h-4 text-brand-azure border-gray-300 rounded focus:ring-2 focus:ring-brand-azure cursor-pointer"/>
          <span class="group-hover:text-brand-azure transition">🎓 University Email (.edu)</span>
        </label>
      </div>

      <div class="h-px bg-gray-200"></div>

      <!-- F. Interests -->
      <div>
        <div class="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <svg class="w-4 h-4 text-brand-azure" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"/>
          </svg>
          Interests
        </div>
        <div class="flex items-center gap-2 mb-2">
          <input #tagInp 
                 type="text" 
                 class="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-azure focus:border-transparent transition" 
                 placeholder="Add a tag and press Enter" 
                 (keydown.enter)="addTag(tagInp.value); tagInp.value=''; $event.preventDefault();" />
          <button class="px-3 py-2 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 transition" 
                  (click)="addTag(tagInp.value); tagInp.value=''">
            Add
          </button>
        </div>
        <div class="flex flex-wrap gap-2">
          <button *ngFor="let t of state.interests; let i = index" 
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-gold/10 text-brand-midnight text-xs font-medium hover:bg-brand-gold/20 transition" 
                  (click)="removeTag(i)" 
                  title="Remove">
            {{t}} 
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="h-px bg-gray-200"></div>

      <!-- G. Online Status -->
      <div>
        <label class="flex items-center justify-between cursor-pointer group">
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-brand-azure" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z"/>
            </svg>
            <span class="font-semibold text-gray-900 group-hover:text-brand-azure transition">Show Online Only</span>
          </div>
          <input type="checkbox" 
                 [(ngModel)]="state.onlineOnly" 
                 (change)="emit()" 
                 class="w-10 h-6 rounded-full appearance-none cursor-pointer bg-gray-200 checked:bg-brand-azure relative transition-all
                        before:content-[''] before:absolute before:w-5 before:h-5 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 before:transition-all
                        checked:before:left-4" />
        </label>
      </div>

      <div class="h-px bg-gray-200"></div>

      <!-- H. Sort Options -->
      <div>
        <div class="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <svg class="w-4 h-4 text-brand-azure" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"/>
          </svg>
          Sort
        </div>
        <select [(ngModel)]="state.sort" 
                (change)="emit()" 
                class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-azure focus:border-transparent transition cursor-pointer">
          <option value="recent">Recently Joined</option>
          <option value="active">Most Active</option>
          <option value="nearby">Nearby</option>
          <option value="recommended">Recommended</option>
          <option value="university">Same University</option>
          <option value="interests">Shared Interests</option>
        </select>
      </div>

      <!-- I. Reset -->
      <div class="pt-2">
        <button (click)="reset()" 
                class="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition">
          🔄 Reset All Filters
        </button>
      </div>
    </div>
  `
})
export class PeopleFiltersPanelComponent {
  @Output() changed = new EventEmitter<PeopleFilters>();

  state: PeopleFilters = {
    q: '',
    roles: { student: false, professional: false, alumni: false },
    orgs: [],
    location: {},
    verified: { email: false, phone: false, edu: false },
    interests: [],
    onlineOnly: false,
    sort: 'recent'
  };

  emit(){ this.changed.emit({ ...this.state, orgs: [...this.state.orgs], interests: [...this.state.interests] }); }

  addOrg(v: string){ const val = (v||'').trim(); if (!val) return; if (!this.state.orgs.includes(val)) this.state.orgs.push(val); this.emit(); }
  removeOrg(i: number){ this.state.orgs.splice(i, 1); this.emit(); }

  addTag(v: string){ const val = (v||'').trim(); if (!val) return; if (!this.state.interests.includes(val)) this.state.interests.push(val); this.emit(); }
  removeTag(i: number){ this.state.interests.splice(i, 1); this.emit(); }

  reset(){
    this.state = { 
      q: '', 
      roles: { student: false, professional: false, alumni: false }, 
      orgs: [], 
      location: {}, 
      verified: { email: false, phone: false, edu: false }, 
      interests: [], 
      onlineOnly: false,
      sort: 'recent' 
    };
    this.emit();
  }
}
