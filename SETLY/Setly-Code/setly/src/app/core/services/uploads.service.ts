import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface PresignResp {
  url: string;
  fields: Record<string,string>;
  key: string;
  contentType: string;
  publicUrl?: string;
  expiresAt: number;
}

export interface UploadedMedia {
  url: string;
  key: string;
}

@Injectable({ providedIn: 'root' })
export class UploadsService {
  private http = inject(HttpClient);

  async presignAvatar(file: File): Promise<PresignResp> {
    const ext = file.type.split('/')[1];
    const res = await this.http.post<PresignResp>('/api/uploads/presign', { type: 'avatar', ext }).toPromise();
    if (!res) throw new Error('No presign response');
    return res;
  }

  async presignBanner(file: File): Promise<PresignResp> {
    const ext = file.type.split('/')[1];
    const res = await this.http.post<PresignResp>('/api/uploads/presign', { type: 'banner', ext }).toPromise();
    if (!res) throw new Error('No presign response');
    return res;
  }

  async uploadToS3(presign: PresignResp, file: File): Promise<void> {
    // Use local upload for development environment
    if ((presign as any).local) {
      console.log('📁 Using local upload for development');
      const apiBase = (environment as any)?.apiBaseUrl || (environment as any)?.apiUrl || '/api';
      const baseOrigin = typeof apiBase === 'string' ? apiBase.replace(/\/api\/?$/, '') : '';
      const pathOnly = presign.url.split('?')[0];
      const attemptUrls = [
        `${baseOrigin}${pathOnly}`,
        // Fallback to current window origin if baseOrigin mismatch / unreachable
        `${window.location.origin}${pathOnly}`
      ].filter((u, idx, arr) => arr.indexOf(u) === idx);
      // Dev helper: when running Angular on :4200 and backend on :3000 with relative /api
      // baseOrigin becomes '' and both entries above hit :4200. Inject :3000 candidate.
      if (typeof window !== 'undefined') {
        const isDevLocalhost = /localhost|127\.0\.0\.1/.test(window.location.hostname);
        const fePort = window.location.port;
        if (isDevLocalhost && fePort === '4200') {
          const backendCandidate = `${window.location.protocol}//localhost:3000${pathOnly}`;
          if (!attemptUrls.includes(backendCandidate)) attemptUrls.unshift(backendCandidate);
        }
      }
      let success = false;
      let lastError: any = null;
      for (const u of attemptUrls) {
        try {
          const putResp = await fetch(u, {
            method: 'PUT',
            headers: { 'Content-Type': presign.contentType, 'x-local-upload': 'true' },
            body: file
          });
          if (putResp.ok) { success = true; break; }
          lastError = new Error(`Local upload failed (${putResp.status}) at ${u}`);
        } catch (e) {
          lastError = e;
        }
      }
      if (!success) throw lastError || new Error('Local upload failed');
      return;
    }
    
    // Try S3 upload with CORS error handling
    try {
      const formData = new FormData();
      Object.entries(presign.fields).forEach(([k, v]) => formData.append(k, v));
      formData.append('file', file);
      const resp = await fetch(presign.url, { method: 'POST', body: formData });
      if (!resp.ok) throw new Error('S3 upload failed');
    } catch (error) {
      // Let caller handle fallback (e.g., re-presign with local)
      throw error;
    }
  }

  // Generic presign for room media
  async presignMedia(type: 'room-photo' | 'room-video' | 'room-video-thumb', file: File, forceLocal?: boolean, roomId?: string): Promise<PresignResp> {
    // Prefer MIME type; fallback to filename extension when missing
    let ext = (file.type?.split('/')[1] || '').split(';')[0];
    if (!ext) {
      const name = file.name || '';
      const fromName = (name.split('.').pop() || '').toLowerCase();
      ext = fromName || 'bin';
    }
    if (ext === 'jpg') ext = 'jpeg';
    // Optionally force local upload via environment flag (off by default)
    const body: any = { type, ext };
    const configuredFlag = (environment as any)?.featureFlags?.forceLocalUploads;
    const fallbackToLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
    const shouldForceLocal = typeof forceLocal === 'boolean' ? forceLocal : (typeof configuredFlag === 'boolean' ? configuredFlag : fallbackToLocalhost);
  if (shouldForceLocal) body.local = true;
  if (roomId) body.roomId = roomId;
    console.debug('[UploadsService] presignMedia request', body);
    const res = await this.http.post<PresignResp>('/api/uploads/presign', body).toPromise();
    if (!res) throw new Error('No presign response');
    console.debug('[UploadsService] presignMedia response', { local: (res as any).local, key: res.key });
    return res;
  }

  // Upload file and return the public URL if provided
  async uploadRoomMedia(type: 'room-photo' | 'room-video' | 'room-video-thumb', file: File, roomId?: string): Promise<UploadedMedia> {
    const firstPresign = await this.presignMedia(type, file, undefined, roomId);
    try {
      await this.uploadToS3(firstPresign, file);
      return this.buildUploaded(firstPresign);
    } catch (e: any) {
      // Attempt dev fallback if likely CORS from S3
      const msg = e?.message || '';
      const name = e?.name || '';
      const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';
      const likelyCors = /CORS|blocked|NetworkError|TypeError/i.test(msg) || /TypeError/.test(name);
      if (!isDev || (firstPresign as any).local) throw e;
      console.warn('⚠️ S3 upload failed; retrying with local presign in development');
  const localPresign = await this.presignMedia(type, file, true, roomId);
      await this.uploadToS3(localPresign, file);
      return this.buildUploaded(localPresign);
    }
  }

  private buildUploaded(p: PresignResp): UploadedMedia {
    const apiBase = (environment as any)?.apiBaseUrl || (environment as any)?.apiUrl || '/api';
    const baseOrigin = typeof apiBase === 'string' ? apiBase.replace(/\/api\/?$/, '') : '';
    const url = (p as any).local ? `${baseOrigin}${p.publicUrl}` : (p.publicUrl || `/${p.key}`);
    return { url, key: p.key };
  }
}
