import { Injectable, signal } from '@angular/core';
import { RideFeedPost } from '../models/ride.model';

@Injectable({
  providedIn: 'root'
})
export class RideFeedStore {
  private readonly STORAGE_KEY = 'setly-ride-feed';
  private _posts = signal<RideFeedPost[]>([]);

  constructor() {
    this.loadFromStorage();
  }

  get posts() {
    return this._posts.asReadonly();
  }

  addPost(post: RideFeedPost): void {
    this._posts.update(posts => [...posts, post]);
    this.saveToStorage();
  }

  getPostsByUniversity(universityId: string): RideFeedPost[] {
    return this._posts().filter(post => post.universityId === universityId);
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const posts = JSON.parse(stored);
        this._posts.set(Array.isArray(posts) ? posts : []);
      }
    } catch (error) {
      console.warn('Failed to load ride feed from localStorage:', error);
      this._posts.set([]);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this._posts()));
    } catch (error) {
      console.warn('Failed to save ride feed to localStorage:', error);
    }
  }
}
