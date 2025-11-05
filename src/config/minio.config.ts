import { registerAs } from '@nestjs/config';

export default registerAs('minio', () => ({
  endpoint: process.env.MINIO_ENDPOINT || 's3.easysofts.net',
  port: process.env.MINIO_PORT ? parseInt(process.env.MINIO_PORT, 10) : 9000,
  useSSL: process.env.MINIO_USE_SSL === 'true', // keep it simple
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
  bucketName: process.env.MINIO_BUCKET_NAME || 'nestjs-bucket',
  region: process.env.MINIO_REGION || 'us-east-1',
}));
