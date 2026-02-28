import {
  Injectable,
  Logger,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import axios from 'axios';
import * as fs from 'fs/promises';
import * as path from 'path';
import { createHash, randomUUID } from 'crypto';

export interface UploadResult {
  url: string;
  key: string;
  provider: 'local' | 's3' | 'cloudinary';
  contentType?: string;
  size?: number;
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
    this.provider = (this.configService.get<string>('STORAGE_PROVIDER') ||
      'local') as any;
    this.localBasePath =
      this.configService.get<string>('STORAGE_LOCAL_BASE_PATH') || './uploads';
    this.storageBaseUrl =
      this.configService.get<string>('STORAGE_BASE_URL') ||
      'http://localhost:4000/uploads';

    if (this.provider === 's3') {
      this.s3Bucket = this.configService.get<string>('AWS_S3_BUCKET');
      this.s3Region =
        this.configService.get<string>('AWS_REGION') || 'us-east-1';
      const explicitBaseUrl = this.configService.get<string>(
        'STORAGE_S3_BASE_URL',
      );
      this.s3BaseUrl =
        explicitBaseUrl ||
        (this.s3Bucket
          ? `https://${this.s3Bucket}.s3.${this.s3Region}.amazonaws.com`
          : undefined);

      this.logger.log(
        `StorageService: S3 mode. Bucket=${this.s3Bucket || 'not-set'}, Region=${this.s3Region}`,
      );
    } else if (this.provider === 'cloudinary') {
      this.logger.log(
        'StorageService: Cloudinary mode. Ensure Cloudinary credentials are set.',
      );
    } else {
      this.logger.log(
        `StorageService: Local mode. Base path: ${this.localBasePath}`,
      );
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

  private getTimeoutMs(): number {
    const raw = this.configService.get<string>('STORAGE_TIMEOUT_MS');
    const parsed = raw ? Number(raw) : NaN;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 15000;
  }

  private failNotConfigured(provider: string): never {
    throw new ServiceUnavailableException(
      `Storage provider not configured (${provider})`,
    );
  }

  private mapProviderError(err: unknown, operation: string): never {
    if (axios.isAxiosError(err)) {
      if (
        err.code === 'ECONNABORTED' ||
        (typeof err.message === 'string' &&
          err.message.toLowerCase().includes('timeout'))
      ) {
        throw new ServiceUnavailableException(
          `Storage provider timeout during ${operation}`,
        );
      }
      if (err.response) {
        throw new InternalServerErrorException(
          `Storage provider error during ${operation}`,
        );
      }
      throw new ServiceUnavailableException(
        `Storage provider unavailable during ${operation}`,
      );
    }

    if (err && typeof err === 'object') {
      const anyErr = err as any;
      if (anyErr.name === 'AbortError') {
        throw new ServiceUnavailableException(
          `Storage provider timeout during ${operation}`,
        );
      }
    }

    throw new InternalServerErrorException(`Storage ${operation} failed`);
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
      contentType: undefined,
      size: buffer.length,
    };
  }

  private getOrCreateS3Client(): S3Client {
    if (!this.s3Bucket || !this.s3Region) {
      this.failNotConfigured('s3');
    }
    if (!this.s3Client) {
      this.s3Client = new S3Client({ region: this.s3Region });
    }
    return this.s3Client;
  }

  private async uploadToS3(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    folder: string,
  ): Promise<UploadResult> {
    const client = this.getOrCreateS3Client();
    if (!this.s3Bucket || !this.s3BaseUrl) {
      this.failNotConfigured('s3');
    }

    const ext = path.extname(originalName);
    const key = `${folder}/${randomUUID()}${ext}`;

    const timeoutMs = this.getTimeoutMs();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      await client.send(
        new PutObjectCommand({
          Bucket: this.s3Bucket,
          Key: key,
          Body: buffer,
          ContentType: mimeType,
          ACL: 'public-read',
        }),
        { abortSignal: controller.signal },
      );
    } catch (err) {
      this.mapProviderError(err, 'upload');
    } finally {
      clearTimeout(timeout);
    }

    const url = `${this.s3BaseUrl}/${key}`;
    return {
      url,
      key,
      provider: 's3',
      contentType: mimeType,
      size: buffer.length,
    };
  }

  private getCloudinaryConfig(): {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
  } {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');
    if (!cloudName || !apiKey || !apiSecret) {
      this.failNotConfigured('cloudinary');
    }
    return { cloudName, apiKey, apiSecret };
  }

  private cloudinarySignature(
    params: Record<string, string | number>,
    apiSecret: string,
  ): string {
    const entries = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => [k, String(v)] as const)
      .sort(([a], [b]) => a.localeCompare(b));
    const toSign = entries.map(([k, v]) => `${k}=${v}`).join('&');
    return createHash('sha1').update(`${toSign}${apiSecret}`).digest('hex');
  }

  private buildMultipartBody(
    boundary: string,
    fields: Record<string, string>,
    file:
      | {
          fieldName: string;
          filename?: string;
          contentType?: string;
          data: Buffer | string;
        }
      | undefined,
  ): Buffer {
    const chunks: Buffer[] = [];
    const crlf = '\r\n';
    const push = (value: string | Buffer) => {
      chunks.push(typeof value === 'string' ? Buffer.from(value) : value);
    };

    for (const [name, value] of Object.entries(fields)) {
      push(`--${boundary}${crlf}`);
      push(`Content-Disposition: form-data; name="${name}"${crlf}${crlf}`);
      push(`${value}${crlf}`);
    }

    if (file) {
      push(`--${boundary}${crlf}`);
      const filenamePart = file.filename
        ? `; filename="${file.filename}"`
        : '';
      push(
        `Content-Disposition: form-data; name="${file.fieldName}"${filenamePart}${crlf}`,
      );
      if (file.contentType) {
        push(`Content-Type: ${file.contentType}${crlf}`);
      }
      push(crlf);
      if (typeof file.data === 'string') {
        push(file.data);
      } else {
        push(file.data);
      }
      push(crlf);
    }

    push(`--${boundary}--${crlf}`);
    return Buffer.concat(chunks);
  }

  private async uploadToCloudinary(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    folder: string,
  ): Promise<UploadResult> {
    const { cloudName, apiKey, apiSecret } = this.getCloudinaryConfig();

    const timestamp = Math.floor(Date.now() / 1000);
    const publicId = randomUUID();
    const signature = this.cloudinarySignature(
      { folder, public_id: publicId, timestamp },
      apiSecret,
    );

    const boundary = `----StorageServiceBoundary${randomUUID()}`;
    const timeoutMs = this.getTimeoutMs();

    const maybeUrl = buffer as unknown as string;
    const isUrl = typeof maybeUrl === 'string' && /^https?:\/\//i.test(maybeUrl);

    const body = this.buildMultipartBody(
      boundary,
      {
        api_key: apiKey,
        timestamp: String(timestamp),
        signature,
        folder,
        public_id: publicId,
      },
      {
        fieldName: 'file',
        filename: isUrl ? undefined : originalName,
        contentType: isUrl ? undefined : mimeType,
        data: isUrl ? maybeUrl : buffer,
      },
    );

    try {
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
        body,
        {
          headers: {
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
          },
          timeout: timeoutMs,
          maxBodyLength: 25 * 1024 * 1024,
          maxContentLength: 25 * 1024 * 1024,
          validateStatus: (status) => status >= 200 && status < 300,
        },
      );

      const data = res.data as any;
      const url = (data?.secure_url || data?.url) as string | undefined;
      const key = (data?.public_id || `${folder}/${publicId}`) as string;
      if (!url) {
        throw new InternalServerErrorException('Storage upload failed');
      }
      return {
        url,
        key,
        provider: 'cloudinary',
        contentType: mimeType,
        size: typeof data?.bytes === 'number' ? data.bytes : buffer.length,
      };
    } catch (err) {
      this.mapProviderError(err, 'upload');
    }
  }

  /**
   * Delete a file by its key.
   */
  async deleteFile(key: string): Promise<void> {
    switch (this.provider) {
      case 's3':
        if (!this.s3Bucket) {
          this.failNotConfigured('s3');
        }
        try {
          const client = this.getOrCreateS3Client();
          const timeoutMs = this.getTimeoutMs();
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), timeoutMs);
          try {
            await client.send(
              new DeleteObjectCommand({
                Bucket: this.s3Bucket,
                Key: key,
              }),
              { abortSignal: controller.signal },
            );
          } finally {
            clearTimeout(timeout);
          }
        } catch (err) {
          this.logger.warn(`Failed to delete S3 object ${key}`);
        }
        break;
      case 'cloudinary':
        try {
          const { cloudName, apiKey, apiSecret } = this.getCloudinaryConfig();
          const timestamp = Math.floor(Date.now() / 1000);
          const signature = this.cloudinarySignature(
            { public_id: key, timestamp },
            apiSecret,
          );
          const body = new URLSearchParams({
            public_id: key,
            api_key: apiKey,
            timestamp: String(timestamp),
            signature,
          }).toString();
          await axios.post(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
            body,
            {
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              timeout: this.getTimeoutMs(),
              validateStatus: (status) => status >= 200 && status < 300,
            },
          );
        } catch (err) {
          this.logger.warn(`Failed to delete Cloudinary asset ${key}`);
        }
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
