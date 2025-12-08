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

    // FORCE REPLACE localhost -> PUBLIC IP
    // Fix lỗi: MinIO SDK tự động trả về localhost nếu chạy trên cùng server
    const publicEndpoint = MY_MINIO_CONFIG.ENDPOINT;
    const publicPort = MY_MINIO_CONFIG.PORT;

    // Tách URL ra để thay thế host:port
    const urlObj = new URL(url);
    urlObj.hostname = publicEndpoint;
    urlObj.port = publicPort.toString();

    const finalUrl = urlObj.toString();
    console.log(`Presigned URL (Fixed): ${finalUrl}`);
    return finalUrl;
  }
}
