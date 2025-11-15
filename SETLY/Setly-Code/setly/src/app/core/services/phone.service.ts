import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PhoneService {
  constructor(private http: HttpClient) {}

  sendOtp(phone: string): Observable<any> {
    return this.http.post('/api/phone/send-otp', { phone });
  }

  verifyOtp(phone: string, code: string): Observable<any> {
    return this.http.post('/api/phone/verify-otp', { phone, code });
  }

  resetVerification(): Observable<any> {
    return this.http.post('/api/phone/reset-verification', {});
  }
}
