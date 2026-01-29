import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs/promises';
import * as path from 'path';
import { randomUUID } from 'crypto';

export interface UploadResult {
  url: string;
  key: string;
  provider: 'local' | 's3' | 'cloudinary';
}

/**
 * StorageService – abstraction for file uploads.
 * 
 * Environment-driven:
 *  - STORAGE_PROVIDER=local|s3|cloudinary (default: local)
 *  - STORAGE_LOCAL_BASE_PATH (default: ./uploads)
 *  - STORAGE_BASE_URL (for local; e.g. http://localhost:4000/uploads)
 *  - AWS_S3_BUCKET, AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
 *  - CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 * 
 * For production, set STORAGE_PROVIDER=s3 or cloudinary and configure credentials.
 * For development, local mode is fine.
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly provider: 'local' | 's3' | 'cloudinary';
  private readonly localBasePath: string;
  private readonly storageBaseUrl: string;
  private readonly s3Bucket?: string;
  private readonly s3BaseUrl?: string;
  private readonly s3Region?: string;
  private s3Client?: S3Client;

  constructor(private readonly configService: ConfigService) {
    this.provider = (this.configService.get<string>('STORAGE_PROVIDER') || 'local') as any;
    this.localBasePath = this.configService.get<string>('STORAGE_LOCAL_BASE_PATH') || './uploads';
    this.storageBaseUrl = this.configService.get<string>('STORAGE_BASE_URL') || 'http://localhost:4000/uploads';

    if (this.provider === 's3') {
      this.s3Bucket = this.configService.get<string>('AWS_S3_BUCKET');
      this.s3Region = this.configService.get<string>('AWS_REGION') || 'us-east-1';

      if (!this.s3Bucket) {
        this.logger.error('StorageService: S3 mode enabled but AWS_S3_BUCKET is not configured.');
      } else {
        this.s3Client = new S3Client({
          region: this.s3Region,
        });

        const explicitBaseUrl = this.configService.get<string>('STORAGE_S3_BASE_URL');
        this.s3BaseUrl =
          explicitBaseUrl ||
          `https://${this.s3Bucket}.s3.${this.s3Region}.amazonaws.com`;

        this.logger.log(
          `StorageService: S3 mode. Bucket=${this.s3Bucket}, Region=${this.s3Region}`,
        );
      }
    } else if (this.provider === 'cloudinary') {
      this.logger.log('StorageService: Cloudinary mode. Ensure Cloudinary credentials are set.');
    } else {
      this.logger.log(`StorageService: Local mode. Base path: ${this.localBasePath}`);
    }
  }

  /**
   * Upload a file buffer and return its public URL.
   */
  async uploadFile(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    folder = 'uploads',
  ): Promise<UploadResult> {
    switch (this.provider) {
      case 's3':
        return this.uploadToS3(buffer, originalName, mimeType, folder);
      case 'cloudinary':
        return this.uploadToCloudinary(buffer, originalName, mimeType, folder);
      default:
        return this.uploadToLocal(buffer, originalName, folder);
    }
  }

  private async uploadToLocal(
    buffer: Buffer,
    originalName: string,
    folder: string,
  ): Promise<UploadResult> {
    const ext = path.extname(originalName);
    const filename = `${randomUUID()}${ext}`;
    const dirPath = path.join(this.localBasePath, folder);
    await fs.mkdir(dirPath, { recursive: true });
    const filePath = path.join(dirPath, filename);
    await fs.writeFile(filePath, buffer);

    const url = `${this.storageBaseUrl}/${folder}/${filename}`;
    return {
      url,
      key: `${folder}/${filename}`,
      provider: 'local',
    };
  }

  private async uploadToS3(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    folder: string,
  ): Promise<UploadResult> {
    if (!this.s3Client || !this.s3Bucket || !this.s3BaseUrl) {
      throw new Error('S3 client not configured. Check AWS_S3_BUCKET and AWS credentials.');
    }

    const ext = path.extname(originalName);
    const key = `${folder}/${randomUUID()}${ext}`;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.s3Bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
        ACL: 'public-read',
      }),
    );

    const url = `${this.s3BaseUrl}/${key}`;
    return {
      url,
      key,
      provider: 's3',
    };
  }

  private async uploadToCloudinary(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    folder: string,
  ): Promise<UploadResult> {
    // Placeholder for Cloudinary SDK
    // TODO: Install cloudinary package, implement upload_stream
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');

    if (!cloudName || !apiKey) {
      throw new Error('CLOUDINARY_CLOUD_NAME or CLOUDINARY_API_KEY not configured.');
    }

    const publicId = `${folder}/${randomUUID()}`;

    this.logger.warn(
      `Cloudinary upload placeholder: Would upload to cloud ${cloudName} with public_id ${publicId}. Install cloudinary and implement upload_stream.`,
    );

    // Stubbed result; replace with real Cloudinary call
    const url = `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`;
    return {
      url,
      key: publicId,
      provider: 'cloudinary',
    };
  }

  /**
   * Delete a file by its key.
   */
  async deleteFile(key: string): Promise<void> {
    switch (this.provider) {
      case 's3':
        if (!this.s3Client || !this.s3Bucket) {
          this.logger.error('S3 delete requested but S3 client is not configured.');
          return;
        }
        try {
          await this.s3Client.send(
            new DeleteObjectCommand({
              Bucket: this.s3Bucket,
              Key: key,
            }),
          );
          this.logger.log(`S3 object deleted: ${key}`);
        } catch (err) {
          this.logger.warn(`Failed to delete S3 object ${key}: ${err}`);
        }
        break;
      case 'cloudinary':
        this.logger.warn(`Cloudinary delete placeholder: Would delete ${key}. Implement cloudinary.uploader.destroy.`);
        break;
      default:
        const filePath = path.join(this.localBasePath, key);
        try {
          await fs.unlink(filePath);
          this.logger.log(`Local file deleted: ${filePath}`);
        } catch (err) {
          this.logger.warn(`Failed to delete local file ${filePath}: ${err}`);
        }
        break;
    }
  }
}
