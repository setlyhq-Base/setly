import { Injectable, signal, computed } from '@angular/core';

export interface PostRideState {
  // Step 1: Trip Details
  fromCity: string;
  toCity: string;
  departureDate: string;
  departureTime: string;
  estimatedArrival: string;
  pricePerSeat: number;
  seatsAvailable: number;
  
  // Step 2: Vehicle & Preferences
  carModel: string;
  carType: 'sedan' | 'suv' | 'van' | 'hatchback' | '';
  luggageSpace: 'small' | 'medium' | 'large' | '';
  smokingAllowed: boolean;
  petsAllowed: boolean;
  musicPreference: 'quiet' | 'moderate' | 'lively' | '';
  notes: string;
  
  // Validation
  errors: {
    fromCity?: string;
    toCity?: string;
    departureDate?: string;
    departureTime?: string;
    pricePerSeat?: string;
    seatsAvailable?: string;
  };
}

@Injectable({ providedIn: 'root' })
export class PostRideStore {
  private state = signal<PostRideState>({
    fromCity: '',
    toCity: '',
    departureDate: '',
    departureTime: '',
    estimatedArrival: '',
    pricePerSeat: 0,
    seatsAvailable: 3,
    carModel: '',
    carType: '',
    luggageSpace: '',
    smokingAllowed: false,
    petsAllowed: false,
    musicPreference: '',
    notes: '',
    errors: {}
  });

  private _currentStep = signal(1);
  currentStep = computed(() => this._currentStep());

  // Getters
  fromCity = computed(() => this.state().fromCity);
  toCity = computed(() => this.state().toCity);
  departureDate = computed(() => this.state().departureDate);
  departureTime = computed(() => this.state().departureTime);
  estimatedArrival = computed(() => this.state().estimatedArrival);
  pricePerSeat = computed(() => this.state().pricePerSeat);
  seatsAvailable = computed(() => this.state().seatsAvailable);
  carModel = computed(() => this.state().carModel);
  carType = computed(() => this.state().carType);
  luggageSpace = computed(() => this.state().luggageSpace);
  smokingAllowed = computed(() => this.state().smokingAllowed);
  petsAllowed = computed(() => this.state().petsAllowed);
  musicPreference = computed(() => this.state().musicPreference);
  notes = computed(() => this.state().notes);
  errors = computed(() => this.state().errors);

  // Update methods
  updateFromCity(city: string) {
    this.state.update(s => ({ ...s, fromCity: city, errors: { ...s.errors, fromCity: undefined } }));
  }

  updateToCity(city: string) {
    this.state.update(s => ({ ...s, toCity: city, errors: { ...s.errors, toCity: undefined } }));
  }

  updateDepartureDate(date: string) {
    this.state.update(s => ({ ...s, departureDate: date, errors: { ...s.errors, departureDate: undefined } }));
  }

  updateDepartureTime(time: string) {
    this.state.update(s => ({ ...s, departureTime: time, errors: { ...s.errors, departureTime: undefined } }));
  }

  updateEstimatedArrival(time: string) {
    this.state.update(s => ({ ...s, estimatedArrival: time }));
  }

  updatePricePerSeat(price: number) {
    this.state.update(s => ({ ...s, pricePerSeat: price, errors: { ...s.errors, pricePerSeat: undefined } }));
  }

  updateSeatsAvailable(seats: number) {
    this.state.update(s => ({ ...s, seatsAvailable: seats, errors: { ...s.errors, seatsAvailable: undefined } }));
  }

  updateCarModel(model: string) {
    this.state.update(s => ({ ...s, carModel: model }));
  }

  updateCarType(type: PostRideState['carType']) {
    this.state.update(s => ({ ...s, carType: type }));
  }

  updateLuggageSpace(space: PostRideState['luggageSpace']) {
    this.state.update(s => ({ ...s, luggageSpace: space }));
  }

  updateSmokingAllowed(allowed: boolean) {
    this.state.update(s => ({ ...s, smokingAllowed: allowed }));
  }

  updatePetsAllowed(allowed: boolean) {
    this.state.update(s => ({ ...s, petsAllowed: allowed }));
  }

  updateMusicPreference(pref: PostRideState['musicPreference']) {
    this.state.update(s => ({ ...s, musicPreference: pref }));
  }

  updateNotes(notes: string) {
    this.state.update(s => ({ ...s, notes: notes }));
  }

  // Navigation
  nextStep() {
    if (this._currentStep() < 2) {
      this._currentStep.update(s => s + 1);
    }
  }

  previousStep() {
    if (this._currentStep() > 1) {
      this._currentStep.update(s => s - 1);
    }
  }

  // Validation for Step 1
  validateStep1(): boolean {
    const errors: PostRideState['errors'] = {};
    let isValid = true;

    if (!this.state().fromCity.trim()) {
      errors.fromCity = 'Please enter departure city';
      isValid = false;
    }

    if (!this.state().toCity.trim()) {
      errors.toCity = 'Please enter destination city';
      isValid = false;
    }

    if (!this.state().departureDate) {
      errors.departureDate = 'Please select departure date';
      isValid = false;
    }

    if (!this.state().departureTime) {
      errors.departureTime = 'Please select departure time';
      isValid = false;
    }

    if (this.state().pricePerSeat <= 0) {
      errors.pricePerSeat = 'Please enter a valid price';
      isValid = false;
    }

    if (this.state().seatsAvailable < 1 || this.state().seatsAvailable > 8) {
      errors.seatsAvailable = 'Seats must be between 1 and 8';
      isValid = false;
    }

    this.state.update(s => ({ ...s, errors }));
    return isValid;
  }

  // Reset
  reset() {
    this.state.set({
      fromCity: '',
      toCity: '',
      departureDate: '',
      departureTime: '',
      estimatedArrival: '',
      pricePerSeat: 0,
      seatsAvailable: 3,
      carModel: '',
      carType: '',
      luggageSpace: '',
      smokingAllowed: false,
      petsAllowed: false,
      musicPreference: '',
      notes: '',
      errors: {}
    });
    this._currentStep.set(1);
  }

  // Get full state for submission
  getState(): PostRideState {
    return this.state();
  }
}
