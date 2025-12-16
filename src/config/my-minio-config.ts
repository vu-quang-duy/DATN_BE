export const MY_MINIO_CONFIG = {
  // ENDPOINT: 'localhost',
  ENDPOINT: '202.191.56.11',
  PORT: 9001,
  ACCESS_KEY: 'root',
  SECRET_KEY: 'Tuyen18072001',
  BUCKET: 'wesign',
  USE_SSL: process.env.MINIO_USE_SSL === 'true',
};
