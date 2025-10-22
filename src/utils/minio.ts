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
  }
}
