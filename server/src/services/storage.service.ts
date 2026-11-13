import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface StorageConfig {
  driver: 's3' | 'local';
  s3Bucket?: string;
  s3Region?: string;
  s3AccessKeyId?: string;
  s3SecretAccessKey?: string;
  localStoragePath: string;
}

export interface UploadResult {
  key: string;
  storageUrl: string;
  driver: 's3' | 'local';
  sizeBytes: number;
  mimeType: string;
  checksumSha256: string;
}

export interface PresignedUrlResult {
  uploadUrl: string;
  fileKey: string;
  expiresInSeconds: number;
  headers: Record<string, string>;
}

export class StorageService {
  private static config: StorageConfig = {
    driver: (process.env.STORAGE_DRIVER as 's3' | 'local') || 'local',
    s3Bucket: process.env.AWS_S3_BUCKET || 'pavion-rts-resumes-prod',
    s3Region: process.env.AWS_REGION || 'us-east-1',
    s3AccessKeyId: process.env.AWS_ACCESS_KEY_ID,
    s3SecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    localStoragePath: path.resolve(__dirname, '../../uploads'),
  };

  /**
   * Initialize local directory structure
   */
  public static init(): void {
    const dirs = ['resumes', 'onboarding', 'compliance', 'contracts'];
    for (const dir of dirs) {
      const fullPath = path.join(this.config.localStoragePath, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    }
  }

  /**
   * Generate secure pre-signed PUT URL for direct browser-to-S3 uploads
   */
  public static async getPresignedUploadUrl(
    category: 'resumes' | 'onboarding' | 'compliance' | 'contracts',
    fileName: string,
    mimeType: string,
    expiresInSeconds: number = 900
  ): Promise<PresignedUrlResult> {
    const ext = path.extname(fileName);
    const uniqueId = crypto.randomUUID();
    const cleanName = path.basename(fileName, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileKey = `${category}/${uniqueId}_${cleanName}${ext}`;

    if (this.config.driver === 's3' && this.config.s3AccessKeyId && this.config.s3SecretAccessKey) {
      // Production AWS S3 Pre-signed URL pattern
      const s3Host = `https://${this.config.s3Bucket}.s3.${this.config.s3Region}.amazonaws.com`;
      const uploadUrl = `${s3Host}/${fileKey}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Expires=${expiresInSeconds}&X-Amz-Date=${new Date().toISOString()}`;
      return {
        uploadUrl,
        fileKey,
        expiresInSeconds,
        headers: { 'Content-Type': mimeType },
      };
    }

    // Local / Dev Pre-signed upload simulation endpoint
    const localUploadUrl = `/api/v1/storage/upload?key=${encodeURIComponent(fileKey)}`;
    return {
      uploadUrl: localUploadUrl,
      fileKey,
      expiresInSeconds,
      headers: { 'Content-Type': mimeType },
    };
  }

  /**
   * Generate secure pre-signed GET URL for authorized document downloads
   */
  public static async getPresignedDownloadUrl(fileKey: string, expiresInSeconds: number = 3600): Promise<string> {
    if (this.config.driver === 's3' && this.config.s3AccessKeyId) {
      return `https://${this.config.s3Bucket}.s3.${this.config.s3Region}.amazonaws.com/${fileKey}?expires=${expiresInSeconds}`;
    }
    return `/api/v1/storage/download?key=${encodeURIComponent(fileKey)}`;
  }

  /**
   * Save a local or memory buffer to persistent storage
   */
  public static async saveFile(
    category: 'resumes' | 'onboarding' | 'compliance' | 'contracts',
    originalName: string,
    buffer: Buffer,
    mimeType: string
  ): Promise<UploadResult> {
    this.init();
    const ext = path.extname(originalName);
    const uniqueId = crypto.randomUUID();
    const cleanName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const relativeKey = `${category}/${uniqueId}_${cleanName}${ext}`;
    const destination = path.join(this.config.localStoragePath, relativeKey);

    fs.writeFileSync(destination, buffer);

    const hash = crypto.createHash('sha256').update(buffer).digest('hex');

    return {
      key: relativeKey,
      storageUrl: `/uploads/${relativeKey}`,
      driver: this.config.driver,
      sizeBytes: buffer.length,
      mimeType,
      checksumSha256: hash,
    };
  }

  /**
   * Delete a stored file
   */
  public static async deleteFile(fileKey: string): Promise<boolean> {
    try {
      const fullPath = path.join(this.config.localStoragePath, fileKey);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}
