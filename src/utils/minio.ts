 // 
// src/minio/minio.service.ts
import { Injectable } from '@nestjs/common';
import { Client } from 'minio';
import { MY_MINIO_CONFIG } from '../config/my-minio-config';

@Injectable()
export class MinioService {
  private readonly client = new Client({
    endPoint: MY_MINIO_CONFIG.ENDPOINT,
    port: MY_MINIO_CONFIG.PORT,
    useSSL: MY_MINIO_CONFIG.USE_SSL,
    accessKey: MY_MINIO_CONFIG.ACCESS_KEY,
    secretKey: MY_MINIO_CONFIG.SECRET_KEY,
  });

  async upload(objectName: string, file: Buffer) {
    const bucket = MY_MINIO_CONFIG.BUCKET;
    await this.client.putObject(bucket, objectName, file);
    console.log(`Uploaded: ${objectName} → ${bucket}`);
    return { message: 'Uploaded to MY MinIO (local)!' };
  }

  async getUrl(objectName: string, expiry = 7 * 24 * 60 * 60) {
    const bucket = MY_MINIO_CONFIG.BUCKET;
    const url = await this.client.presignedGetObject(bucket, objectName, expiry);
    console.log(`Presigned URL: ${url}`);
    return url;
=======
import { Client } from 'minio';
import { ENV } from '../config/environment';

export class MinioService {
  private readonly minioClient: Client;

  constructor() {
    this.minioClient = new Client({
      endPoint: ENV.MINIO.MINIO_HOST, // Địa chỉ IP của MinIO server
      port: ENV.MINIO.MINIO_PORT, // Cổng MinIO
      useSSL: false, // Nếu không sử dụng SSL, để true nếu sử dụng HTTPS
      accessKey: ENV.API_KEY, // Access key của MinIO
      secretKey: ENV.API_SECRET, // Secret key của MinIO
    });
  }

  async upload(objectName: string, file: Buffer, bucketName = ENV.AWS.AWS_S3_BUCKET_NAME) {
    await this.minioClient.putObject(bucketName, objectName, file);
    return { message: 'File uploaded successfully' };
  }

  async getPresignedUrl(
    objectName: string,
    expiry: number = 60 * 60,
    bucketName: string = ENV.AWS.AWS_S3_BUCKET_NAME,
  ): Promise<string> {
    try {
      const url = await this.minioClient.presignedUrl('GET', bucketName, objectName, expiry);
      return url; // Trả về URL
    } catch (error) {
      console.error('Error generating presigned URL:', error);
      throw new Error('Unable to generate presigned URL');
    }
 // 
  }
}
