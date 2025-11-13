import { Injectable, signal, computed } from '@angular/core';

export interface AuthState {
  userId?: string; email?: string; phone?: string;
  displayName?: string; avatarUrl?: string; provider?: string;
  // Flag set on first-time backend sync to drive onboarding UI
  isNew?: boolean;
  isAuthenticated: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private _state = signal<AuthState>({ isAuthenticated: false });
  user = computed(() => this._state());
  setUser(u: Partial<AuthState>) { this._state.set({ ...this._state(), ...u, isAuthenticated: true }); }
  setLoggedOut() { this._state.set({ isAuthenticated: false }); }
}
