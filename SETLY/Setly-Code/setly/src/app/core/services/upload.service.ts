import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UploadResponse {
  url: string;
  fields: Record<string, string>;
  key: string;
  expiresAt: number;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /**
   * Validates and optionally compresses an image file
   */
  private async validateAndOptimizeImage(file: File): Promise<File> {
    // Validate MIME type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG and WebP images are allowed.');
    }

    // Check size
    if (file.size > 8 * 1024 * 1024) { // 8MB
      if (file.type === 'image/jpeg' || file.type === 'image/png') {
        // Convert to WebP and compress if file is too large
        return this.compressToWebP(file);
      }
      throw new Error('File size too large. Maximum size is 8MB.');
    }

    return file;
  }

  /**
   * Compresses an image to WebP format
   */
  private async compressToWebP(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        // Scale down images larger than 3000px
        let width = img.width;
        let height = img.height;
        if (width > 3000 || height > 3000) {
          const ratio = Math.min(3000 / width, 3000 / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        // Convert to WebP with 0.8 quality
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Failed to compress image'));
            return;
          }
          resolve(new File([blob], file.name.replace(/\.[^/.]+$/, '.webp'), {
            type: 'image/webp'
          }));
        }, 'image/webp', 0.8);
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Gets dimensions of an image file
   */
  private async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Requests a presigned POST URL for S3 upload
   */
  private async requestSignature(file: File, listingId: string): Promise<UploadResponse> {
    const userId = 'current-user-id'; // TODO: Get from auth service
    const keyPrefix = `users/${userId}/listings/${listingId}`;

    const response = await firstValueFrom(
      this.http.post<UploadResponse>(`${this.apiUrl}/uploads/sign`, {
        contentType: file.type,
        size: file.size,
        keyPrefix
      })
    );

    return response;
  }

  /**
   * Uploads a file to S3 using presigned POST data
   */
  private async uploadToS3(
    file: File,
    { url, fields }: UploadResponse,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();

      // Add the fields from presigned POST
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value);
      });

      // Add the file last
      formData.append('file', file);

      // Track upload progress
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          onProgress({
            loaded: event.loaded,
            total: event.total,
            percentage: (event.loaded / event.total) * 100
          });
        }
      };

      xhr.onload = () => {
        if (xhr.status === 204) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      };

      xhr.onerror = () => reject(new Error('Upload failed'));
      xhr.open('POST', url);
      xhr.send(formData);
    });
  }

  /**
   * Uploads an image for a listing
   */
  async uploadListingImage(
    file: File,
    listingId: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<{ key: string; contentType: string; width: number; height: number; bytes: number }> {
    try {
      // Validate and optimize image
      const optimizedFile = await this.validateAndOptimizeImage(file);
      
      // Get image dimensions
      const dimensions = await this.getImageDimensions(optimizedFile);

      // Get presigned POST URL
      const uploadData = await this.requestSignature(optimizedFile, listingId);

      // Upload to S3
      await this.uploadToS3(optimizedFile, uploadData, onProgress);

      // Return metadata for storage
      return {
        key: uploadData.key,
        contentType: optimizedFile.type,
        width: dimensions.width,
        height: dimensions.height,
        bytes: optimizedFile.size
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Upload failed');
    }
  }
}