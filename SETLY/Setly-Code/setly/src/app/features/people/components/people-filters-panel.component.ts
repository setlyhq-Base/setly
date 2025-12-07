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
      <!-- A. Search Users - Premium Style -->
      <div>
        <div class="font-bold text-gray-900 mb-2.5 flex items-center gap-2.5 text-[15px]">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4E7BFD] to-[#7B9EFD] flex items-center justify-center shadow-md">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <span>Search Users</span>
        </div>
        <p class="text-[13px] text-[#A3A9C0] mb-3 ml-10.5">Find people by name or institution</p>
        <div class="relative">
          <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#B9C0D5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input type="search" 
                 [(ngModel)]="state.q" 
                 (input)="emit()" 
                 class="w-full h-[44px] pl-11 pr-4 border border-[#EEF0F7] rounded-2xl text-sm focus:ring-2 focus:ring-[#4E7BFD]/30 focus:border-[#4E7BFD] transition-all shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] bg-white placeholder:text-[#B9C0D5]" 
                 placeholder="Search by name, university, company…" />
        </div>
      </div>

      <!-- Premium Divider -->
      <div class="relative h-px">
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
      </div>

      <!-- B. Role - Apple-style Checkboxes -->
      <div>
        <div class="font-bold text-gray-900 mb-2.5 flex items-center gap-2.5 text-[15px]">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4E7BFD] to-[#7B9EFD] flex items-center justify-center shadow-md">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
          </div>
          <span>Role</span>
        </div>
        <p class="text-[13px] text-[#A3A9C0] mb-4 ml-10.5">Filter by user type</p>
        <div class="space-y-3 ml-1">
          <label class="flex items-center gap-3.5 cursor-pointer group">
            <input type="checkbox" 
                   [(ngModel)]="state.roles.student" 
                   (change)="emit()" 
                   class="w-[18px] h-[18px] text-[#4E7BFD] border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-[#4E7BFD]/30 cursor-pointer transition-all hover:border-[#4E7BFD] checked:bg-[#4E7BFD] checked:border-[#4E7BFD]" />
            <span class="text-[14px] text-gray-700 group-hover:text-[#4E7BFD] transition-colors font-medium">Student</span>
          </label>
          <label class="flex items-center gap-3.5 cursor-pointer group">
            <input type="checkbox" 
                   [(ngModel)]="state.roles.professional" 
                   (change)="emit()" 
                   class="w-[18px] h-[18px] text-[#4E7BFD] border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-[#4E7BFD]/30 cursor-pointer transition-all hover:border-[#4E7BFD] checked:bg-[#4E7BFD] checked:border-[#4E7BFD]" />
            <span class="text-[14px] text-gray-700 group-hover:text-[#4E7BFD] transition-colors font-medium">Working Professional</span>
          </label>
          <label class="flex items-center gap-3.5 cursor-pointer group">
            <input type="checkbox" 
                   [(ngModel)]="state.roles.alumni" 
                   (change)="emit()" 
                   class="w-[18px] h-[18px] text-[#4E7BFD] border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-[#4E7BFD]/30 cursor-pointer transition-all hover:border-[#4E7BFD] checked:bg-[#4E7BFD] checked:border-[#4E7BFD]" />
            <span class="text-[14px] text-gray-700 group-hover:text-[#4E7BFD] transition-colors font-medium">Alumni</span>
          </label>
        </div>
      </div>

      <!-- Premium Divider -->
      <div class="relative h-px">
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
      </div>

      <!-- C. University / Company - Premium Inputs -->
      <div>
        <div class="font-bold text-gray-900 mb-2.5 flex items-center gap-2.5 text-[15px]">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4E7BFD] to-[#7B9EFD] flex items-center justify-center shadow-md">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
          </div>
          <span>University / Company</span>
        </div>
        <p class="text-[13px] text-[#A3A9C0] mb-4 ml-10.5">Filter by institution</p>
        <div class="flex items-center gap-2 mb-3">
          <input #orgInp 
                 type="text" 
                 class="flex-1 h-[44px] border border-[#EEF0F7] rounded-2xl px-4 text-sm focus:ring-2 focus:ring-[#4E7BFD]/30 focus:border-[#4E7BFD] transition-all shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] bg-white placeholder:text-[#B9C0D5]" 
                 placeholder="Type and press Enter" 
                 (keydown.enter)="addOrg(orgInp.value); orgInp.value=''; $event.preventDefault();" />
          <button class="h-[44px] px-5 text-sm font-semibold bg-gradient-to-r from-[#4E7BFD] to-[#3D6AEC] text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 shadow-md" 
                  (click)="addOrg(orgInp.value); orgInp.value=''">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
            </svg>
            Add
          </button>
        </div>
        <div class="flex flex-wrap gap-2">
          <button *ngFor="let o of state.orgs; let i = index" 
                  class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#4E7BFD]/10 to-[#7B9EFD]/10 text-[#4E7BFD] text-[13px] font-semibold hover:from-[#4E7BFD]/20 hover:to-[#7B9EFD]/20 transition-all hover:scale-105 shadow-sm" 
                  (click)="removeOrg(i)" 
                  title="Remove">
            {{o}} 
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Premium Divider -->
      <div class="relative h-px">
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
      </div>

      <!-- D. Location - Premium Inputs -->
      <div>
        <div class="font-bold text-gray-900 mb-2.5 flex items-center gap-2.5 text-[15px]">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4E7BFD] to-[#7B9EFD] flex items-center justify-center shadow-md">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
          <span>Location</span>
        </div>
        <p class="text-[13px] text-[#A3A9C0] mb-4 ml-10.5">Find people near you</p>
        <div class="space-y-3">
          <input type="text" 
                 [(ngModel)]="state.location.city" 
                 (input)="emit()" 
                 class="w-full h-[44px] border border-[#EEF0F7] rounded-2xl px-4 text-sm focus:ring-2 focus:ring-[#4E7BFD]/30 focus:border-[#4E7BFD] transition-all shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] bg-white placeholder:text-[#B9C0D5]" 
                 placeholder="City" />
          <input type="text" 
                 [(ngModel)]="state.location.state" 
                 (input)="emit()" 
                 class="w-full h-[44px] border border-[#EEF0F7] rounded-2xl px-4 text-sm focus:ring-2 focus:ring-[#4E7BFD]/30 focus:border-[#4E7BFD] transition-all shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] bg-white placeholder:text-[#B9C0D5]" 
                 placeholder="State" />
          <input type="text" 
                 [(ngModel)]="state.location.country" 
                 (input)="emit()" 
                 class="w-full h-[44px] border border-[#EEF0F7] rounded-2xl px-4 text-sm focus:ring-2 focus:ring-[#4E7BFD]/30 focus:border-[#4E7BFD] transition-all shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] bg-white placeholder:text-[#B9C0D5]" 
                 placeholder="Country" />
        </div>
      </div>

      <!-- Premium Divider -->
      <div class="relative h-px">
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
      </div>

      <!-- E. Verification Filters - Apple Checkboxes -->
      <div>
        <div class="font-bold text-gray-900 mb-2.5 flex items-center gap-2.5 text-[15px]">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4E7BFD] to-[#7B9EFD] flex items-center justify-center shadow-md">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
          </div>
          <span>Verifications</span>
        </div>
        <p class="text-[13px] text-[#A3A9C0] mb-4 ml-10.5">Filter by verified accounts</p>
        <div class="space-y-3 ml-1">
          <label class="flex items-center gap-3.5 cursor-pointer group">
            <input type="checkbox" 
                   [(ngModel)]="state.verified.email" 
                   (change)="emit()" 
                   class="w-[18px] h-[18px] text-[#4E7BFD] border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-[#4E7BFD]/30 cursor-pointer transition-all hover:border-[#4E7BFD] checked:bg-[#4E7BFD] checked:border-[#4E7BFD]"/>
            <span class="text-[14px] text-gray-700 group-hover:text-[#4E7BFD] transition-colors font-medium">✉️ Verified Email</span>
          </label>
          <label class="flex items-center gap-3.5 cursor-pointer group">
            <input type="checkbox" 
                   [(ngModel)]="state.verified.phone" 
                   (change)="emit()" 
                   class="w-[18px] h-[18px] text-[#4E7BFD] border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-[#4E7BFD]/30 cursor-pointer transition-all hover:border-[#4E7BFD] checked:bg-[#4E7BFD] checked:border-[#4E7BFD]"/>
            <span class="text-[14px] text-gray-700 group-hover:text-[#4E7BFD] transition-colors font-medium">📱 Verified Phone</span>
          </label>
          <label class="flex items-center gap-3.5 cursor-pointer group">
            <input type="checkbox" 
                   [(ngModel)]="state.verified.edu" 
                   (change)="emit()" 
                   class="w-[18px] h-[18px] text-[#4E7BFD] border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-[#4E7BFD]/30 cursor-pointer transition-all hover:border-[#4E7BFD] checked:bg-[#4E7BFD] checked:border-[#4E7BFD]"/>
            <span class="text-[14px] text-gray-700 group-hover:text-[#4E7BFD] transition-colors font-medium">🎓 University Email (.edu)</span>
          </label>
        </div>
      </div>

      <!-- Premium Divider -->
      <div class="relative h-px">
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
      </div>

      <!-- F. Interests - Premium Style -->
      <div>
        <div class="font-bold text-gray-900 mb-2.5 flex items-center gap-2.5 text-[15px]">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4E7BFD] to-[#7B9EFD] flex items-center justify-center shadow-md">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"/>
            </svg>
          </div>
          <span>Interests</span>
        </div>
        <p class="text-[13px] text-[#A3A9C0] mb-4 ml-10.5">Find people with shared hobbies</p>
        <div class="flex items-center gap-2 mb-3">
          <input #tagInp 
                 type="text" 
                 class="flex-1 h-[44px] border border-[#EEF0F7] rounded-2xl px-4 text-sm focus:ring-2 focus:ring-[#4E7BFD]/30 focus:border-[#4E7BFD] transition-all shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] bg-white placeholder:text-[#B9C0D5]" 
                 placeholder="Add a tag and press Enter" 
                 (keydown.enter)="addTag(tagInp.value); tagInp.value=''; $event.preventDefault();" />
          <button class="h-[44px] px-5 text-sm font-semibold bg-gradient-to-r from-[#4E7BFD] to-[#3D6AEC] text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 shadow-md" 
                  (click)="addTag(tagInp.value); tagInp.value=''">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
            </svg>
            Add
          </button>
        </div>
        <div class="flex flex-wrap gap-2">
          <button *ngFor="let t of state.interests; let i = index" 
                  class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-700 text-[13px] font-semibold hover:from-purple-500/20 hover:to-pink-500/20 transition-all hover:scale-105 shadow-sm" 
                  (click)="removeTag(i)" 
                  title="Remove">
            {{t}} 
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Premium Divider -->
      <div class="relative h-px">
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
      </div>

      <!-- G. Online Status - Premium Toggle -->
      <div>
        <div class="font-bold text-gray-900 mb-2.5 flex items-center gap-2.5 text-[15px]">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4E7BFD] to-[#7B9EFD] flex items-center justify-center shadow-md">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z"/>
            </svg>
          </div>
          <span>Online Status</span>
        </div>
        <p class="text-[13px] text-[#A3A9C0] mb-4 ml-10.5">Show only active users</p>
        <label class="flex items-center justify-between cursor-pointer group bg-gradient-to-r from-gray-50 to-white p-4 rounded-2xl border border-gray-100 hover:border-[#4E7BFD]/30 transition-all hover:shadow-md">
          <span class="font-medium text-gray-900 text-[14px]">Show Online Only</span>
          <input type="checkbox" 
                 [(ngModel)]="state.onlineOnly" 
                 (change)="emit()" 
                 class="w-12 h-7 rounded-full appearance-none cursor-pointer bg-gray-200 checked:bg-gradient-to-r checked:from-[#4E7BFD] checked:to-[#3D6AEC] relative transition-all shadow-inner
                        before:content-[''] before:absolute before:w-6 before:h-6 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 before:transition-all before:shadow-md
                        checked:before:left-5" />
        </label>
      </div>

      <!-- Premium Divider -->
      <div class="relative h-px">
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
      </div>

      <!-- H. Sort Options - Premium Dropdown -->
      <div>
        <div class="font-bold text-gray-900 mb-2.5 flex items-center gap-2.5 text-[15px]">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4E7BFD] to-[#7B9EFD] flex items-center justify-center shadow-md">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"/>
            </svg>
          </div>
          <span>Sort By</span>
        </div>
        <p class="text-[13px] text-[#A3A9C0] mb-4 ml-10.5">Order results by preference</p>
        <select [(ngModel)]="state.sort" 
                (change)="emit()" 
                class="w-full h-[44px] border border-[#EEF0F7] rounded-2xl px-4 text-sm focus:ring-2 focus:ring-[#4E7BFD]/30 focus:border-[#4E7BFD] transition-all cursor-pointer bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] appearance-none font-medium text-gray-700"
                style="background-image: url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%234E7BFD%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e'); background-repeat: no-repeat; background-position: right 1rem center; background-size: 1.2em; padding-right: 2.5rem;">
          <option value="recent">Recently Joined</option>
          <option value="active">Most Active</option>
          <option value="nearby">Nearby</option>
          <option value="recommended">Recommended</option>
          <option value="university">Same University</option>
          <option value="interests">Shared Interests</option>
        </select>
      </div>

      <!-- I. Reset All - Hidden (moved to parent container footer) -->
      <div class="hidden">
        <button (click)="reset()" 
                class="w-full h-[44px] px-4 border-2 border-[#D2D9FF] rounded-xl text-sm font-semibold text-[#4E7BFD] hover:bg-gradient-to-r hover:from-[#4E7BFD] hover:to-[#3D6AEC] hover:text-white hover:border-[#4E7BFD] transition-all hover:shadow-lg hover:shadow-blue-500/20">
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
