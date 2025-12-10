import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });

export type EntityType = 'rooms' | 'rides' | 'marketplace' | 'users';

export interface SignedUrlResponse {
  uploadUrl: string;
  fileKey: string;
  cloudFrontUrl: string;
}

class S3Service {
  private bucketName: string;
  private cloudFrontDomain: string;

  constructor() {
    this.bucketName = process.env.S3_BUCKET_NAME || '';
    this.cloudFrontDomain = process.env.CLOUDFRONT_DOMAIN || '';
  }

  /**
   * Generate folder structure: {entityType}/{entityId}/{filename}
   */
  private generateFileKey(
    entityType: EntityType,
    entityId: string,
    filename: string
  ): string {
    const extension = filename.split('.').pop();
    const uniqueFilename = `${uuidv4()}.${extension}`;
    return `${entityType}/${entityId}/${uniqueFilename}`;
  }

  /**
   * Get CloudFront URL for a file key
   */
  private getCloudFrontUrl(fileKey: string): string {
    return `https://${this.cloudFrontDomain}/${fileKey}`;
  }

  /**
   * Generate a presigned URL for direct browser upload to S3
   */
  async getUploadUrl(
    entityType: EntityType,
    entityId: string,
    filename: string,
    contentType: string
  ): Promise<SignedUrlResponse> {
    const fileKey = this.generateFileKey(entityType, entityId, filename);

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
      ContentType: contentType,
      // ServerSideEncryption: 'AES256',
      Metadata: {
        entityType,
        entityId,
        originalFilename: filename
      }
    });

    // URL expires in 15 minutes
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });

    return {
      uploadUrl,
      fileKey,
      cloudFrontUrl: this.getCloudFrontUrl(fileKey)
    };
  }

  /**
   * Generate multiple upload URLs for batch uploads
   */
  async getBatchUploadUrls(
    entityType: EntityType,
    entityId: string,
    files: { filename: string; contentType: string }[]
  ): Promise<SignedUrlResponse[]> {
    return Promise.all(
      files.map(file =>
        this.getUploadUrl(entityType, entityId, file.filename, file.contentType)
      )
    );
  }

  /**
   * Delete a file from S3
   */
  async deleteFile(fileKey: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey
    });

    await s3Client.send(command);
  }

  /**
   * Delete all files for an entity (e.g., when deleting a room)
   */
  async deleteEntityFiles(entityType: EntityType, entityId: string): Promise<void> {
    // In production, you'd list all objects with this prefix and delete them
    // For now, this is a placeholder - implement ListObjectsV2 + batch delete
    console.log(`Deleting all files for ${entityType}/${entityId}`);
  }

  /**
   * Convert file key to CloudFront URL
   */
  getPublicUrl(fileKey: string): string {
    return this.getCloudFrontUrl(fileKey);
  }
}

export const s3Service = new S3Service();
