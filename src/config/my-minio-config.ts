// export const MY_MINIO_CONFIG = {
//   ENDPOINT: process.env.NODE_ENV === 'local' ? 'localhost' : '202.191.56.11',
//   PORT: 9002,
//   ACCESS_KEY: process.env.MINIO_ACCESS_KEY_1 || 'admin',
//   SECRET_KEY: process.env.MINIO_SECRET_KEY_1 || 'NewStrongPassword123',
//   BUCKET: process.env.MINIO_BUCKET_1 || 'my-private-bucket',
//   USE_SSL: process.env.MINIO_USE_SSL === 'true',
// };

// export const MY_MINIO_CONFIG = {
//   ENDPOINT: '202.191.56.11',
//   PORT: 9002,
//   ACCESS_KEY: process.env.MINIO_ACCESS_KEY_1,
//   SECRET_KEY: process.env.MINIO_SECRET_KEY_1,
//   BUCKET: process.env.MINIO_BUCKET_1,
//   USE_SSL: process.env.MINIO_USE_SSL === 'true',
// };
// console.log(process.env.MINIO_BUCKET_1);

// export const MY_MINIO_CONFIG = {
//   ENDPOINT: 'localhost',
//   PORT: 9000,
//   ACCESS_KEY: 'admin',
//   SECRET_KEY: 'Password12345@',
//   BUCKET: 'wesign',
//   USE_SSL: process.env.MINIO_USE_SSL === 'true',
// };

export const MY_MINIO_CONFIG = {
  // ENDPOINT: 'localhost',
  ENDPOINT: '202.191.56.11',
  PORT: 9001,
  ACCESS_KEY: 'root',
  SECRET_KEY: 'Tuyen18072001',
  BUCKET: 'wesign',
  USE_SSL: process.env.MINIO_USE_SSL === 'true',
};