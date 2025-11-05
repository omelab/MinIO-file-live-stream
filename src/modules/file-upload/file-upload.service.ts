import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FileUploadService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    const minioConfig = this.configService.get('minio');

    this.s3Client = new S3Client({
      endpoint: `https://${minioConfig.endpoint}`,
      region: minioConfig.region,
      credentials: {
        accessKeyId: minioConfig.accessKey,
        secretAccessKey: minioConfig.secretKey,
      },
      forcePathStyle: true, // Path-style works best with Nginx reverse proxy
    });

    this.bucketName = minioConfig.bucketName;
  }

  async uploadFile(
    file: Express.Multer.File,
  ): Promise<{ key: string; url: string }> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    // Generate unique file key
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.originalname.split('.').pop();
    const key = `${timestamp}-${randomString}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ContentDisposition: `inline; filename="${file.originalname}"`,
    });

    try {
      await this.s3Client.send(command);
      const url = this.getFileUrl(key);
      return { key, url };
    } catch (error) {
      console.error('Upload error:', error);
      throw new BadRequestException(`File upload failed: ${error.message}`);
    }
  }

  async generatePresignedUploadUrl(
    filename: string,
    contentType: string = 'application/octet-stream',
  ): Promise<{ presignedUrl: string; key: string; url: string }> {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = filename.split('.').pop();
    const key = `presigned-uploads/${timestamp}-${randomString}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
    });

    try {
      const presignedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: 3600,
      });
      const url = this.getFileUrl(key);

      return {
        presignedUrl,
        key,
        url,
      };
    } catch (error) {
      console.error('Presigned URL error:', error);
      throw new BadRequestException(
        `Failed to generate presigned URL: ${error.message}`,
      );
    }
  }

  async generatePresignedDownloadUrl(
    key: string,
  ): Promise<{ presignedUrl: string }> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    try {
      const presignedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: 3600,
      });
      return { presignedUrl };
    } catch (error) {
      throw new BadRequestException(
        `Failed to generate download URL: ${error.message}`,
      );
    }
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    try {
      await this.s3Client.send(command);
    } catch (error) {
      throw new BadRequestException(`File deletion failed: ${error.message}`);
    }
  }

  getFileUrl(key: string): string {
    const minioConfig = this.configService.get('minio');
    return `https://${minioConfig.endpoint}/${this.bucketName}/${key}`;
  }
}
