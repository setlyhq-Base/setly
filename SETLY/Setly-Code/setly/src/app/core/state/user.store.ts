import { Injectable, computed, signal } from '@angular/core';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserStore {
  private _user = signal<User | null>(null);

  get user() {
    return this._user.asReadonly();
  }

  get isAuthed() {
    return computed(() => this._user() !== null);
  }

  setUser(user: User): void {
    this._user.set(user);
  }

  clearUser(): void {
    this._user.set(null);
  }
}
