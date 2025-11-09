import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RideRequest } from '../models/ride.model';

@Injectable({
  providedIn: 'root'
})
export class RidesService {
  constructor(private http: HttpClient) {}

  createRideRequest(request: RideRequest): Observable<RideRequest> {
    // Mock: In real app, send to backend
    console.log('Creating ride request:', request);
    return of(request);
  }

  getUberDeepLink(destination: string, pickup?: string): string {
    const baseUrl = 'https://m.uber.com/ul/';
    const params = new URLSearchParams({
      action: 'setPickup',
      pickup: pickup || 'my_location',
      dropoff: destination
    });
    return `${baseUrl}?${params.toString()}`;
  }

  getUberWebLink(destination: string, pickup?: string): string {
    const baseUrl = 'https://www.uber.com';
    const params = new URLSearchParams();
    if (pickup) params.set('pickup', pickup);
    params.set('dropoff', destination);
    return `${baseUrl}?${params.toString()}`;
  }
}
