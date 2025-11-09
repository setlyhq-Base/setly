import { Component, inject, signal, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UniversityService, University } from '../../core/services/university.service';
import { PostRoomStore } from './post-room.store';
import { US_STATES } from '../../shared/constants/us-states';

@Component({
  selector: 'app-room-details-step',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './room-details-step.component.html',
  styleUrls: ['./room-details-step.component.css']
})
export class RoomDetailsStepComponent {
  private universityService = inject(UniversityService);
  store = inject(PostRoomStore);

  title = '';
  description = '';
  city = '';
  state = '';
  universityQuery = '';
  roomType: 'private' | 'shared' | '' = '';
  bath: 'private' | 'shared' | '' = '';
  furnished = false;
  rules = { vegetarian: false, smoking: false, petsOk: false };
  distanceKm = 0;
  availableFrom = '';

  showUniSuggestions = false;
  selectedUniversity = signal<University | null>(null);
  universitySuggestions = signal<University[]>([]);
  minDate = new Date().toISOString().split('T')[0];

  titleError = signal('');
  descriptionError = signal('');
  cityError = signal('');
  stateError = signal('');
  universityError = signal('');
  roomTypeError = signal('');
  bathError = signal('');
  availableFromError = signal('');

  usStates = US_STATES;

  constructor() {
    effect(() => {
      const draft = this.store.draft();
      this.title = draft.title;
      this.description = draft.description;
      this.city = draft.city;
      this.state = draft.state;
      this.roomType = draft.roomType;
      this.bath = draft.bath;
      this.furnished = draft.furnished;
      this.rules = { ...draft.rules };
      this.distanceKm = draft.distanceKm;
      this.availableFrom = draft.availableFrom;

      if (draft.nearUniversityId) {
        const uni = this.universityService.getById(draft.nearUniversityId);
        if (uni) {
          this.selectedUniversity.set(uni);
          this.universityQuery = uni.name;
        }
      }
    }, { allowSignalWrites: true });
  }

  onTitleChange(value: string): void {
    this.validateTitle();
    this.store.updateDraft({ title: value });
  }

  onDescriptionChange(value: string): void {
    this.validateDescription();
    this.store.updateDraft({ description: value });
  }

  onCityChange(value: string): void {
    this.validateCity();
    this.store.updateDraft({ city: value });
  }

  onStateChange(value: string): void {
    this.validateState();
    this.store.updateDraft({ state: value });
  }

  onUniversitySearch(query: string): void {
    if (query.length >= 2) {
      const results = this.universityService.search(query);
      this.universitySuggestions.set(results);
      this.showUniSuggestions = true;
    } else {
      this.universitySuggestions.set([]);
    }
  }

  onUniversityBlur(): void {
    setTimeout(() => this.showUniSuggestions = false, 200);
  }

  selectUniversity(uni: University): void {
    this.selectedUniversity.set(uni);
    this.universityQuery = uni.name;
    this.showUniSuggestions = false;
    this.validateUniversity();
    this.store.updateDraft({ nearUniversityId: uni.id });
  }

  onRoomTypeChange(value: 'private' | 'shared'): void {
    this.validateRoomType();
    this.store.updateDraft({ roomType: value });
  }

  onBathChange(value: 'private' | 'shared'): void {
    this.validateBath();
    this.store.updateDraft({ bath: value });
  }

  onFurnishedChange(value: boolean): void {
    this.store.updateDraft({ furnished: value });
  }

  onRulesChange(): void {
    this.store.updateDraft({ rules: { ...this.rules } });
  }

  onDistanceChange(value: number): void {
    this.store.updateDraft({ distanceKm: value });
  }

  onAvailableFromChange(value: string): void {
    this.validateAvailableFrom();
    this.store.updateDraft({ availableFrom: value });
  }

  private validateTitle(): void {
    if (!this.title) {
      this.titleError.set('Title is required');
    } else if (this.title.length < 10) {
      this.titleError.set('Title must be at least 10 characters');
    } else {
      this.titleError.set('');
    }
  }

  private validateDescription(): void {
    if (!this.description) {
      this.descriptionError.set('Description is required');
    } else if (this.description.length < 300) {
      this.descriptionError.set('Description must be at least 300 characters');
    } else if (this.description.length > 1200) {
      this.descriptionError.set('Description must not exceed 1200 characters');
    } else {
      this.descriptionError.set('');
    }
  }

  private validateCity(): void {
    this.cityError.set(this.city ? '' : 'City is required');
  }

  private validateState(): void {
    this.stateError.set(this.state ? '' : 'State is required');
  }

  private validateUniversity(): void {
    this.universityError.set(this.selectedUniversity() ? '' : 'University is required');
  }

  private validateRoomType(): void {
    this.roomTypeError.set(this.roomType ? '' : 'Room type is required');
  }

  private validateBath(): void {
    this.bathError.set(this.bath ? '' : 'Bathroom type is required');
  }

  private validateAvailableFrom(): void {
    if (!this.availableFrom) {
      this.availableFromError.set('Available date is required');
    } else if (new Date(this.availableFrom) < new Date(this.minDate)) {
      this.availableFromError.set('Date must be today or later');
    } else {
      this.availableFromError.set('');
    }
  }
}
