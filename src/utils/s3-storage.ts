/* eslint-disable @typescript-eslint/no-var-requires */
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { winstonLogger } from 'src/logger';
import { ENV } from '../config/environment';

export class S3Storage {
  private bucket = '';
  private client = new S3Client({
    region: ENV.AWS.AWS_REGION,
    endpoint: ENV.AWS.AWS_ENDPOINT,
    credentials: {
      accessKeyId: ENV.AWS.AWS_ACCESS_KEY_ID,
      secretAccessKey: ENV.AWS.AWS_SECRET_KEY,
    },
  });

  constructor(_bucket = ENV.AWS.AWS_S3_BUCKET_NAME) {
    this.bucket = _bucket;
  }

  async upload({
    buffer,
    s3path,
    isPublic = true,
    ContentType,
  }: {
    buffer: Buffer;
    s3path: string;
    isPublic?: boolean;
    ContentType?: any;
  }) {
    return await this.client.send(
      new PutObjectCommand({
        ACL: isPublic ? 'public-read' : undefined,
        ContentType,
        Bucket: this.bucket,
        Key: s3path,
        Body: buffer,
      }),
    );
  }

  async read(path: string) {
    const params = { Bucket: this.bucket, Key: path };
    const res = await this.client.send(new GetObjectCommand(params));
    const bodyString = await res.Body.transformToString();
    return bodyString;
  }

  async delete(path: string) {
    try {
      const params = { Bucket: this.bucket, Key: path };
      await this.client.send(new HeadObjectCommand(params));
      try {
        await this.client.send(new DeleteObjectCommand(params));
        return true;
      } catch (err) {
        winstonLogger.error(`ERROR in file Deleting : ${path} ` + JSON.stringify(err));
      }
    } catch (err) {
      winstonLogger.error('File not Found ERROR : ' + path);
    }
    return false;
  }

  copyObject = async (copyPath, destinationPath, ACL: ObjectCannedACL = 'public-read') => {
    const command = new CopyObjectCommand({
      Bucket: this.bucket, // Tên bucket đích
      CopySource: `${this.bucket}/${copyPath}`, // Đường dẫn đến đối tượng nguồn (bao gồm cả bucket và key)
      Key: destinationPath, // Đường dẫn đối tượng đích (key)
      ACL,
    });
    const response = await this.client.send(command);
    return response;
  };

  static getS3FullUrl = (path, bucket = ENV.AWS.AWS_S3_BUCKET_NAME) => `https://${bucket}.hn.ss.bfcplatform.vn/${path}`;
}
