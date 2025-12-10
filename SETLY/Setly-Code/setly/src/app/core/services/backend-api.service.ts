import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SignedUrlResponse {
  uploadUrl: string;
  fileKey: string;
  cloudFrontUrl: string;
}

export interface BatchSignedUrlRequest {
  entityType: 'rooms' | 'rides' | 'marketplace' | 'users';
  entityId: string;
  files: {
    filename: string;
    contentType: string;
  }[];
}

/**
 * Backend API Service
 * Handles all API calls to the AWS Lambda backend
 */
@Injectable({
  providedIn: 'root'
})
export class BackendApiService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl || '/api';

  /**
   * Get a presigned URL for uploading a single file to S3
   */
  getUploadUrl(
    entityType: 'rooms' | 'rides' | 'marketplace' | 'users',
    entityId: string,
    filename: string,
    contentType: string
  ): Observable<SignedUrlResponse> {
    return this.http.post<SignedUrlResponse>(`${this.apiUrl}/upload/signed-url`, {
      entityType,
      entityId,
      filename,
      contentType
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get multiple presigned URLs for batch upload
   */
  getBatchUploadUrls(request: BatchSignedUrlRequest): Observable<{ uploadUrls: SignedUrlResponse[] }> {
    return this.http.post<{ uploadUrls: SignedUrlResponse[] }>(
      `${this.apiUrl}/upload/batch-signed-urls`,
      request
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Upload file directly to S3 using presigned URL
   */
  uploadToS3(uploadUrl: string, file: File, contentType: string): Observable<void> {
    const headers = new HttpHeaders({
      'Content-Type': contentType
    });

    return this.http.put<void>(uploadUrl, file, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Delete file from S3
   */
  deleteFile(fileKey: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/upload/${encodeURIComponent(fileKey)}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Comprehensive upload flow: get URL, upload file, return CloudFront URL
   */
  async uploadImage(
    entityType: 'rooms' | 'rides' | 'marketplace' | 'users',
    entityId: string,
    file: File
  ): Promise<string> {
    try {
      // Step 1: Get presigned URL
      const urlResponse = await this.getUploadUrl(
        entityType,
        entityId,
        file.name,
        file.type
      ).toPromise();

      if (!urlResponse) {
        throw new Error('Failed to get upload URL');
      }

      // Step 2: Upload to S3
      await this.uploadToS3(urlResponse.uploadUrl, file, file.type).toPromise();

      // Step 3: Return CloudFront URL
      return urlResponse.cloudFrontUrl;
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  }

  /**
   * Batch upload multiple images
   */
  async uploadMultipleImages(
    entityType: 'rooms' | 'rides' | 'marketplace' | 'users',
    entityId: string,
    files: File[]
  ): Promise<string[]> {
    try {
      // Step 1: Get batch presigned URLs
      const request: BatchSignedUrlRequest = {
        entityType,
        entityId,
        files: files.map(f => ({
          filename: f.name,
          contentType: f.type
        }))
      };

      const response = await this.getBatchUploadUrls(request).toPromise();

      if (!response || !response.uploadUrls) {
        throw new Error('Failed to get upload URLs');
      }

      // Step 2: Upload all files in parallel
      const uploadPromises = files.map((file, index) => {
        const urlData = response.uploadUrls[index];
        return this.uploadToS3(urlData.uploadUrl, file, file.type).toPromise();
      });

      await Promise.all(uploadPromises);

      // Step 3: Return all CloudFront URLs
      return response.uploadUrls.map(u => u.cloudFrontUrl);
    } catch (error) {
      console.error('Batch upload failed:', error);
      throw error;
    }
  }

  private handleError(error: any): Observable<never> {
    console.error('API Error:', error);
    
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else if (error.status) {
      // Server-side error
      errorMessage = error.error?.message || error.message || `Error: ${error.status}`;
    }

    return throwError(() => new Error(errorMessage));
  }
}
