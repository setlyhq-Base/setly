import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface PresignResp {
  url: string;
  fields: Record<string,string>;
  key: string;
  contentType: string;
  publicUrl?: string;
  expiresAt: number;
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
    // Local dev fallback: PUT raw file if presign.local present
    if ((presign as any).local) {
      const putResp = await fetch(presign.url.split('?')[0], {
        method: 'PUT',
        headers: { 'Content-Type': presign.contentType },
        body: file
      });
      if (!putResp.ok) throw new Error('Local upload failed');
      return;
    }
    const formData = new FormData();
    Object.entries(presign.fields).forEach(([k, v]) => formData.append(k, v));
    formData.append('file', file);
    const resp = await fetch(presign.url, { method: 'POST', body: formData });
    if (!resp.ok) throw new Error('S3 upload failed');
  }

  // Generic presign for room media
  async presignMedia(type: 'room-photo' | 'room-video' | 'room-video-thumb', file: File): Promise<PresignResp> {
    const ext = (file.type.split('/')[1] || 'bin').split(';')[0];
    const res = await this.http.post<PresignResp>('/api/uploads/presign', { type, ext }).toPromise();
    if (!res) throw new Error('No presign response');
    return res;
  }

  // Upload file and return the public URL if provided
  async uploadRoomMedia(type: 'room-photo' | 'room-video' | 'room-video-thumb', file: File): Promise<string> {
    const presign = await this.presignMedia(type, file);
    await this.uploadToS3(presign, file);
    if (!presign.publicUrl) {
      // Attempt to derive URL if not provided
      // Fallback assumes bucket public hosting with key
      return `/${presign.key}`; // minimal fallback path (will 404 if not publicly hosted)
    }
    return presign.publicUrl;
  }
}
