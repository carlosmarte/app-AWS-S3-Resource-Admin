import {
  ListBucketsCommand,
  CreateBucketCommand,
  DeleteBucketCommand,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  GetBucketLocationCommand
} from '@aws-sdk/client-s3';
import {
  ListAccessPointsCommand,
  DeleteAccessPointCommand
} from '@aws-sdk/client-s3-control';
import { config, generatePresignedUrl } from '../config/aws.js';

class S3Service {
  constructor() {
    this.s3Client = config.s3Client;
    this.s3ControlClient = config.s3ControlClient;
  }

  // Bucket Operations
  async listBuckets() {
    try {
      const command = new ListBucketsCommand({});
      const response = await this.s3Client.send(command);
      
      // Get additional bucket information
      const bucketsWithDetails = await Promise.all(
        response.Buckets.map(async (bucket) => {
          try {
            // Get bucket location
            const locationCommand = new GetBucketLocationCommand({ Bucket: bucket.Name });
            const locationResponse = await this.s3Client.send(locationCommand);
            
            // Get bucket object count and size (approximate)
            const objectsCommand = new ListObjectsV2Command({ 
              Bucket: bucket.Name,
              MaxKeys: 1 // Just to check if bucket has objects
            });
            const objectsResponse = await this.s3Client.send(objectsCommand);
            
            return {
              name: bucket.Name,
              creationDate: bucket.CreationDate,
              region: locationResponse.LocationConstraint || 'us-east-1',
              objectCount: objectsResponse.KeyCount || 0,
              hasObjects: objectsResponse.Contents && objectsResponse.Contents.length > 0
            };
          } catch (error) {
            // If we can't get details, return basic info
            return {
              name: bucket.Name,
              creationDate: bucket.CreationDate,
              region: 'unknown',
              objectCount: 0,
              hasObjects: false
            };
          }
        })
      );
      
      return bucketsWithDetails;
    } catch (error) {
      throw new Error(`Failed to list buckets: ${error.message}`);
    }
  }

  async createBucket(bucketName, region = config.region) {
    try {
      // Validate bucket name
      this.validateBucketName(bucketName);
      
      const command = new CreateBucketCommand({
        Bucket: bucketName,
        ...(region !== 'us-east-1' && { CreateBucketConfiguration: { LocationConstraint: region } })
      });
      
      await this.s3Client.send(command);
      return { name: bucketName, region };
    } catch (error) {
      if (error.name === 'BucketAlreadyExists') {
        throw new Error('Bucket name already exists');
      } else if (error.name === 'BucketAlreadyOwnedByYou') {
        throw new Error('Bucket already owned by you');
      }
      throw new Error(`Failed to create bucket: ${error.message}`);
    }
  }

  // Access Point Operations
  async listAccessPoints(bucketName, accountId) {
    try {
      const command = new ListAccessPointsCommand({
        AccountId: accountId,
        Bucket: bucketName
      });
      
      const response = await this.s3ControlClient.send(command);
      return response.AccessPointList || [];
    } catch (error) {
      console.warn(`Failed to list access points for bucket ${bucketName}:`, error.message);
      return [];
    }
  }

  async deleteAccessPoint(accessPointName, accountId) {
    try {
      const command = new DeleteAccessPointCommand({
        AccountId: accountId,
        Name: accessPointName
      });
      
      await this.s3ControlClient.send(command);
      return { success: true, message: `Access point ${accessPointName} deleted successfully` };
    } catch (error) {
      throw new Error(`Failed to delete access point ${accessPointName}: ${error.message}`);
    }
  }

  async deleteBucket(bucketName) {
    try {
      // First, check if bucket is empty
      const objectsCommand = new ListObjectsV2Command({ Bucket: bucketName });
      const objectsResponse = await this.s3Client.send(objectsCommand);
      
      if (objectsResponse.Contents && objectsResponse.Contents.length > 0) {
        throw new Error('Cannot delete bucket that contains objects');
      }
      
      // Try to delete bucket normally first
      try {
        const command = new DeleteBucketCommand({ Bucket: bucketName });
        await this.s3Client.send(command);
        return { success: true, message: 'Bucket deleted successfully' };
      } catch (error) {
        // If deletion fails due to access points, check what access points exist
        if (error.message && error.message.includes('access points attached')) {
          try {
            const accountId = process.env.AWS_ACCOUNT_ID;
            
            if (!accountId) {
              throw new Error('Bucket has access points attached and cannot be deleted. Please set AWS_ACCOUNT_ID environment variable to enable access point management.');
            }
            
            // List access points to inform the user
            const accessPoints = await this.listAccessPoints(bucketName, accountId);
            
            if (accessPoints.length > 0) {
              // Create a custom error that includes access point information
              const accessPointNames = accessPoints.map(ap => ap.Name).join(', ');
              const error = new Error(`Bucket has ${accessPoints.length} access point(s) attached: ${accessPointNames}. These must be deleted before the bucket can be removed.`);
              error.code = 'BUCKET_HAS_ACCESS_POINTS';
              error.accessPoints = accessPoints;
              throw error;
            }
          } catch (accessPointError) {
            if (accessPointError.code === 'BUCKET_HAS_ACCESS_POINTS') {
              throw accessPointError;
            }
            throw new Error(`Failed to check access points: ${accessPointError.message}`);
          }
        }
        
        throw error;
      }
    } catch (error) {
      throw new Error(`Failed to delete bucket: ${error.message}`);
    }
  }

  async deleteBucketWithAccessPoints(bucketName, accountId) {
    try {
      // List and delete access points first
      const accessPoints = await this.listAccessPoints(bucketName, accountId);
      
      if (accessPoints.length > 0) {
        // Delete each access point
        for (const accessPoint of accessPoints) {
          await this.deleteAccessPoint(accessPoint.Name, accountId);
        }
      }
      
      // Now delete the bucket
      const command = new DeleteBucketCommand({ Bucket: bucketName });
      await this.s3Client.send(command);
      
      return { 
        success: true, 
        message: accessPoints.length > 0 
          ? `Bucket deleted successfully after removing ${accessPoints.length} access point(s)`
          : 'Bucket deleted successfully'
      };
    } catch (error) {
      throw new Error(`Failed to delete bucket with access points: ${error.message}`);
    }
  }

  // File Operations
  async listFiles(bucketName, prefix = '', maxKeys = 1000) {
    try {
      const command = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: prefix,
        MaxKeys: maxKeys
      });
      
      const response = await this.s3Client.send(command);
      
      const files = (response.Contents || []).map(object => ({
        key: object.Key,
        size: object.Size,
        lastModified: object.LastModified,
        etag: object.ETag,
        storageClass: object.StorageClass || 'STANDARD'
      }));
      
      return {
        files,
        isTruncated: response.IsTruncated,
        nextContinuationToken: response.NextContinuationToken,
        totalCount: response.KeyCount
      };
    } catch (error) {
      throw new Error(`Failed to list files: ${error.message}`);
    }
  }

  async uploadFile(bucketName, key, fileBuffer, contentType, metadata = {}) {
    try {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
        Metadata: metadata
      });
      
      const response = await this.s3Client.send(command);
      return {
        key,
        etag: response.ETag,
        size: fileBuffer.length
      };
    } catch (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  async downloadFile(bucketName, key) {
    try {
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key
      });
      
      const response = await this.s3Client.send(command);
      return {
        body: response.Body,
        contentType: response.ContentType,
        contentLength: response.ContentLength,
        lastModified: response.LastModified,
        metadata: response.Metadata
      };
    } catch (error) {
      throw new Error(`Failed to download file: ${error.message}`);
    }
  }

  async deleteFile(bucketName, key) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key
      });
      
      await this.s3Client.send(command);
      return { success: true, message: 'File deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  async getFileMetadata(bucketName, key) {
    try {
      const command = new HeadObjectCommand({
        Bucket: bucketName,
        Key: key
      });
      
      const response = await this.s3Client.send(command);
      return {
        key,
        size: response.ContentLength,
        lastModified: response.LastModified,
        contentType: response.ContentType,
        etag: response.ETag,
        metadata: response.Metadata
      };
    } catch (error) {
      throw new Error(`Failed to get file metadata: ${error.message}`);
    }
  }

  async generateDownloadUrl(bucketName, key) {
    try {
      return await generatePresignedUrl(bucketName, key, 'getObject');
    } catch (error) {
      throw new Error(`Failed to generate download URL: ${error.message}`);
    }
  }

  async generateUploadUrl(bucketName, key) {
    try {
      return await generatePresignedUrl(bucketName, key, 'putObject');
    } catch (error) {
      throw new Error(`Failed to generate upload URL: ${error.message}`);
    }
  }

  // Validation helpers
  validateBucketName(bucketName) {
    if (!bucketName) {
      throw new Error('Bucket name is required');
    }
    
    if (bucketName.length < 3 || bucketName.length > 63) {
      throw new Error('Bucket name must be between 3 and 63 characters');
    }
    
    if (!/^[a-z0-9.-]+$/.test(bucketName)) {
      throw new Error('Bucket name can only contain lowercase letters, numbers, dots, and hyphens');
    }
    
    if (bucketName.startsWith('.') || bucketName.endsWith('.')) {
      throw new Error('Bucket name cannot start or end with a dot');
    }
    
    if (bucketName.includes('..')) {
      throw new Error('Bucket name cannot contain consecutive dots');
    }
    
    if (bucketName.includes('.-') || bucketName.includes('-.')) {
      throw new Error('Bucket name cannot contain dots adjacent to hyphens');
    }
  }

  validateFileType(contentType) {
    if (!config.allowedFileTypes.includes('*/*')) {
      const isAllowed = config.allowedFileTypes.some(allowedType => {
        if (allowedType.endsWith('/*')) {
          return contentType.startsWith(allowedType.slice(0, -2));
        }
        return contentType === allowedType;
      });
      
      if (!isAllowed) {
        throw new Error(`File type ${contentType} is not allowed`);
      }
    }
  }

  validateFileSize(size) {
    if (size > config.maxFileSize) {
      throw new Error(`File size exceeds maximum allowed size of ${config.maxFileSize} bytes`);
    }
  }
}

export default new S3Service();
