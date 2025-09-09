import { S3Client } from '@aws-sdk/client-s3';
import { S3ControlClient } from '@aws-sdk/client-s3-control';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

// AWS S3 Configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY,
    secretAccessKey: process.env.AWS_S3_SECRET_KEY,
  },
});

// AWS S3 Control Configuration (for access points)
const s3ControlClient = new S3ControlClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY,
    secretAccessKey: process.env.AWS_S3_SECRET_KEY,
  },
});

// Configuration constants
export const config = {
  s3Client,
  s3ControlClient,
  region: process.env.AWS_REGION || 'us-east-1',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 100 * 1024 * 1024, // 100MB default
  allowedFileTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || [
    'image/*',
    'application/pdf',
    'text/*',
    'video/*',
    'audio/*',
    'application/zip'
  ],
  presignedUrlExpiry: 3600, // 1 hour
};

// Utility function to generate presigned URLs
export const generatePresignedUrl = async (bucket, key, operation = 'getObject') => {
  try {
    const command = operation === 'getObject' 
      ? new GetObjectCommand({ Bucket: bucket, Key: key })
      : new PutObjectCommand({ Bucket: bucket, Key: key });
    
    return await getSignedUrl(s3Client, command, { 
      expiresIn: config.presignedUrlExpiry 
    });
  } catch (error) {
    throw new Error(`Failed to generate presigned URL: ${error.message}`);
  }
};

// Validate AWS credentials
export const validateAWSCredentials = () => {
  if (!process.env.AWS_S3_ACCESS_KEY || !process.env.AWS_S3_SECRET_KEY) {
    throw new Error('AWS credentials not configured. Please set AWS_S3_ACCESS_KEY and AWS_S3_SECRET_KEY environment variables.');
  }
  return true;
};

export default config;
