import { Injectable, signal, computed, effect } from '@angular/core';
import { AnalyticsService } from '../../core/services/analytics.service';

export interface RoomPhoto {
  key: string;
  url?: string;
  file?: File;
  preview: string;
  isCover: boolean;
  alt?: string;
  progress?: number;
  error?: string;
}

export interface PostRoomDraft {
  // Step 1: Details
  title: string;
  description: string;
  address?: string;
  lat?: number;
  lon?: number;
  city: string;
  state: string;
  nearUniversityId: string;
  roomType: 'private' | 'shared' | 'entire' | '';
  bath: 'private' | 'shared' | '';
  furnished: boolean;
  rules: {
    vegetarian: boolean;
    smoking: boolean;
    petsOk: boolean;
  };
  // store miles for UI, convert to km on publish
  distanceMiles: number;
  availableFrom: string;
  availableTo?: string;

  // Step 2: Photos
  photos: RoomPhoto[];

  // Step 3: Pricing
  price: {
    monthly: number;
    deposit: number;
    minStayMonths: number;
    utilitiesIncluded: string[];
  };
  noteToTenants: string;
  roomId?: string; // generated client-side for asset grouping
}

const DRAFT_KEY = 'postRoomDraft:v1';
const AUTOSAVE_DELAY_MS = 600;

@Injectable({
  providedIn: 'root'
})
export class PostRoomStore {
  private _draft = signal<PostRoomDraft>(this.getEmptyDraft());
  private _currentStep = signal(1);
  private _lastSaved = signal<Date | null>(null);
  private autosaveTimeout: any = null;

  // Public readonly signals
  draft = this._draft.asReadonly();
  currentStep = this._currentStep.asReadonly();
  lastSaved = this._lastSaved.asReadonly();

  // Validation computed signals
  step1Valid = computed(() => {
    const d = this._draft();
    return !!(
      d.title.length >= 10 &&
      d.description.length >= 30 &&
      d.description.length <= 1200 &&
      d.address && d.address.trim().length > 0 &&
      d.city &&
      d.state &&
      d.nearUniversityId &&
      d.roomType &&
      d.bath &&
      d.availableFrom &&
      new Date(d.availableFrom) >= new Date(new Date().setHours(0, 0, 0, 0))
    );
  });

  step2Valid = computed(() => {
    const photos = this._draft().photos.filter(p => !!p.url && !p.error);
    const hasCover = photos.some(p => p.isCover);
    return photos.length >= 3 && hasCover;
  });

  step3Valid = computed(() => {
    const p = this._draft().price;
    return p.monthly >= 100 && p.monthly <= 5000 && p.minStayMonths >= 1 && p.minStayMonths <= 12;
  });

  allStepsValid = computed(() => this.step1Valid() && this.step2Valid() && this.step3Valid());

  constructor(private analytics: AnalyticsService) {
    this.loadDraft();
    
    // Auto-save effect
    effect(() => {
      const draft = this._draft();
      this.scheduleSave();
    });
  }

  private getEmptyDraft(): PostRoomDraft {
    const today = new Date().toISOString().split('T')[0];
    return {
      title: '',
      description: '',
      address: '',
      lat: undefined,
      lon: undefined,
      city: '',
      state: '',
      nearUniversityId: '',
      roomType: '',
      bath: '',
      furnished: false,
      rules: {
        vegetarian: false,
        smoking: false,
        petsOk: false
      },
      distanceMiles: 0,
      availableFrom: today,
      availableTo: '',
      photos: [],
      price: {
        monthly: 0,
        deposit: 0,
        minStayMonths: 1,
        utilitiesIncluded: []
      },
      noteToTenants: ''
      ,roomId: undefined
    };
  }

  updateDraft(patch: Partial<PostRoomDraft>): void {
    this._draft.update(current => ({ ...current, ...patch }));
  }

  updateDraftDeep<K extends keyof PostRoomDraft>(
    key: K,
    value: PostRoomDraft[K]
  ): void {
    this._draft.update(current => ({
      ...current,
      [key]: value
    }));
  }

  setStep(step: number): void {
    if (step >= 1 && step <= 3) {
      this._currentStep.set(step);
      this.analytics.trackEvent('postRoom_stepChanged', { step });
    }
  }

  nextStep(): void {
    if (this._currentStep() < 3) {
      this.setStep(this._currentStep() + 1);
    }
  }

  previousStep(): void {
    if (this._currentStep() > 1) {
      this.setStep(this._currentStep() - 1);
    }
  }

  private scheduleSave(): void {
    if (this.autosaveTimeout) {
      clearTimeout(this.autosaveTimeout);
    }
    this.autosaveTimeout = setTimeout(() => {
      this.saveDraft();
    }, AUTOSAVE_DELAY_MS);
  }

  saveDraft(): void {
    try {
      const draft = this._draft();
      // Serialize photos (exclude File objects)
      const serializable = {
        ...draft,
        // Avoid storing large base64 previews in localStorage (quota issues). Keep cover preview only (truncated) for quick reload UX.
        photos: draft.photos.map(p => ({
          key: p.key,
          url: p.url,
          preview: p.isCover && typeof p.preview === 'string' ? p.preview.slice(0, 200) : undefined,
          isCover: p.isCover,
          alt: p.alt
        }))
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(serializable));
      this._lastSaved.set(new Date());
      this.analytics.trackEvent('postRoom_draftSaved', {});
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  }

  loadDraft(): void {
    try {
      const stored = localStorage.getItem(DRAFT_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this._draft.set({ ...this.getEmptyDraft(), ...parsed });
      }
    } catch (error) {
      console.error('Failed to load draft:', error);
    }
  }

  clearDraft(): void {
    localStorage.removeItem(DRAFT_KEY);
    this._draft.set(this.getEmptyDraft());
    this._currentStep.set(1);
    this._lastSaved.set(null);
  }

  // Photo management helpers
  addPhoto(photo: RoomPhoto): void {
    this._draft.update(d => ({
      ...d,
      roomId: d.roomId || this.generateRoomId(),
      photos: [...d.photos, photo]
    }));
  }

  updatePhoto(index: number, updates: Partial<RoomPhoto>): void {
    this._draft.update(d => ({
      ...d,
      photos: d.photos.map((p, i) => i === index ? { ...p, ...updates } : p)
    }));
  }

  removePhoto(index: number): void {
    this._draft.update(d => ({
      ...d,
      photos: d.photos.filter((_, i) => i !== index)
    }));
  }

  setCoverPhoto(index: number): void {
    this._draft.update(d => ({
      ...d,
      photos: d.photos.map((p, i) => ({ ...p, isCover: i === index }))
    }));
  }

  reorderPhotos(fromIndex: number, toIndex: number): void {
    this._draft.update(d => {
      const photos = [...d.photos];
      const [moved] = photos.splice(fromIndex, 1);
      photos.splice(toIndex, 0, moved);
      return { ...d, photos };
    });
  }

  private generateRoomId(): string {
    // Simple deterministic-ish id; backend may still assign its own primary key, but we'll use this folder id for assets
    return 'r_' + Math.random().toString(36).slice(2, 10);
  }
}
