export const MY_MINIO_CONFIG = {
  // Internal endpoint - used for connecting to MinIO server
  ENDPOINT: process.env.MINIO_HOST || 'localhost',
  PORT: Number(process.env.MINIO_PORT) || 9001,
  // Public endpoint - used for generating presigned URLs accessible from outside
  PUBLIC_ENDPOINT: process.env.MINIO_PUBLIC_HOST || process.env.MINIO_HOST || '202.191.56.11',
  PUBLIC_PORT: Number(process.env.MINIO_PUBLIC_PORT) || Number(process.env.MINIO_PORT) || 9001,
  ACCESS_KEY: process.env.MINIO_ACCESS_KEY || 'root',
  SECRET_KEY: process.env.MINIO_SECRET_KEY || '',
  BUCKET: process.env.MINIO_BUCKET || 'wesign',
  USE_SSL: process.env.MINIO_USE_SSL === 'true',
};
