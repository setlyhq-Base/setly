import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PresignedUpload {
  url: string;
  fields?: Record<string, string>;
  key: string;
}

export interface FileToUpload {
  fileName: string;
  contentType: string;
}

@Injectable({
  providedIn: 'root'
})
export class S3UploadService {
  private readonly API_BASE = environment.apiUrl || '/api';

  constructor(private http: HttpClient) {}

  /**
   * Get presigned URLs for multiple files
   */
  async presign(files: FileToUpload[]): Promise<PresignedUpload[]> {
    try {
      // In production, call backend: POST /api/uploads/presign
      const response = await this.http.post<{ uploads: PresignedUpload[] }>(
        `${this.API_BASE}/uploads/presign`,
        { files }
      ).toPromise();
      
      return response?.uploads || [];
    } catch (error) {
      console.error('Presign failed, using mock:', error);
      // Mock fallback for development
      return files.map((file, idx) => ({
        url: `https://mock-s3-bucket.s3.amazonaws.com/${file.fileName}`,
        key: `uploads/${Date.now()}-${idx}-${file.fileName}`,
        fields: {
          'Content-Type': file.contentType,
          'x-amz-algorithm': 'AWS4-HMAC-SHA256'
        }
      }));
    }
  }

  /**
   * Upload a file to S3 using presigned URL
   */
  async upload(
    presigned: PresignedUpload,
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<{ key: string }> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            onProgress(percent);
          }
        });
      }

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({ key: presigned.key });
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.open('POST', presigned.url);

      // Build FormData with fields (if provided) + file
      const formData = new FormData();
      if (presigned.fields) {
        Object.entries(presigned.fields).forEach(([key, value]) => {
          formData.append(key, value);
        });
      }
      formData.append('file', file);

      xhr.send(formData);
    });
  }

  /**
   * Convenience method for single file upload
   */
  getPresignedUrl(fileName: string, fileType: string): Observable<{ url: string; key: string }> {
    return from(
      this.presign([{ fileName, contentType: fileType }])
        .then(uploads => uploads[0] || { url: '', key: '' })
    );
  }

  /**
   * Legacy method for backward compatibility
   */
  uploadFile(presignedUrl: string, file: File): Observable<any> {
    return from(
      this.upload({ url: presignedUrl, key: file.name }, file)
    );
  }
}
