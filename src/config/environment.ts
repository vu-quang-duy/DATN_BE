import { config as dotenvConfig } from 'dotenv';

dotenvConfig({ path: '.env' });

export const ENV = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  TIME_ZONE: process.env.TIME_ZONE,
  API_KEY: process.env.API_KEY,
  API_SECRET: process.env.API_SECRET,
  DATABASE: {
    DB_TYPE: process.env.DB_TYPE,
    DB_HOST: process.env.DB_HOST,
    DB_PORT: Number(process.env.DB_PORT),
    DB_USERNAME: process.env.DB_USERNAME,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_NAME: process.env.DB_NAME,
  },
  REDIS: {
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: Number(process.env.REDIS_PORT),
    REDIS_TTL_USER_AUTH: Number(process.env.REDIS_TTL_USER_AUTH),
  },
  JWT: {
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRE_IN: Number(process.env.JWT_EXPIRE_IN),
  },
  AWS: {
    AWS_REGION: process.env.AWS_REGION,
    AWS_ENDPOINT: process.env.AWS_ENDPOINT,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_KEY: process.env.AWS_SECRET_KEY,
    AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME,
  },
  JOB: {
    CRON_CLEAN_STORAGE_EXPRESSION: process.env.CRON_CLEAN_STORAGE_EXPRESSION,
    CRON_BACKUP_DATABASE_EXPRESSION: process.env.CRON_BACKUP_DATABASE_EXPRESSION,
    CLEAN_STORAGE_THRESHOLD_SECOND: Number(process.env.CLEAN_STORAGE_THRESHOLD_SECOND),
  },
  MINIO: {
    MINIO_HOST: process.env.MINIO_HOST,
    MINIO_PORT: Number(process.env.MINIO_PORT),
  },
};

console.log('🚀  ~ ENV:', ENV);
