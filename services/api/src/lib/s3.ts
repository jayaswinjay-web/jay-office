import { S3Client } from '@aws-sdk/client-s3'

export const s3 = new S3Client({
  endpoint: process.env.MINIO_ENDPOINT
    ? `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}`
    : 'http://localhost:9000',
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY ?? 'jay_minio',
    secretAccessKey: process.env.MINIO_SECRET_KEY ?? 'jay_minio_password',
  },
  forcePathStyle: true,
})

export const BUCKET = process.env.MINIO_BUCKET ?? 'jay-drive'
