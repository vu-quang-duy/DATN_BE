// export const MY_MINIO_CONFIG = {
//   ENDPOINT: process.env.NODE_ENV === 'local' ? 'localhost' : '202.191.56.11',
//   PORT: 9002,
//   ACCESS_KEY: 'admin',
//   SECRET_KEY: 'NewStrongPassword123',
//   BUCKET:  'my-private-bucket',
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

const isLocal = process.env.NODE_ENV === 'development';

export const MY_MINIO_CONFIG = {
  ENDPOINT: isLocal ? 'localhost' : '202.191.56.11',
  PORT: isLocal ? 9000 : 9001,
  
  ACCESS_KEY: isLocal ? 'admin' : 'root',
  SECRET_KEY: isLocal ? 'Password12345@' : 'Tuyen18072001',
  BUCKET: 'wesign',
  USE_SSL: isLocal ? process.env.MINIO_USE_SSL === 'false' : process.env.MINIO_USE_SSL === 'true',
};