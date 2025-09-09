import { listFilesSchema, fileKeySchema, validateRequest, validateFileUpload } from '../middleware/validation.js';
import s3Service from '../services/s3Service.js';
import { config } from '../config/aws.js';

export default async function fileRoutes(fastify, options) {
  // List files in bucket
  fastify.get('/buckets/:bucket/files', {
    preHandler: validateRequest(listFilesSchema, 'query')
  }, async (request, reply) => {
    try {
      const { bucket } = request.params;
      const { prefix, maxKeys } = request.query;
      
      // Validate bucket name
      const { error: bucketError } = fileKeySchema.validate(bucket);
      if (bucketError) {
        return reply.status(400).send({
          success: false,
          message: 'Invalid bucket name'
        });
      }
      
      const result = await s3Service.listFiles(bucket, prefix, maxKeys);
      
      return reply.send({
        success: true,
        files: result.files,
        pagination: {
          isTruncated: result.isTruncated,
          nextContinuationToken: result.nextContinuationToken,
          totalCount: result.totalCount
        }
      });
    } catch (error) {
      fastify.log.error(error);
      
      if (error.message.includes('not found') || error.message.includes('does not exist')) {
        return reply.status(404).send({
          success: false,
          message: 'Bucket not found'
        });
      }
      
      return reply.status(500).send({
        success: false,
        message: error.message
      });
    }
  });

  // Upload file to bucket
  fastify.post('/buckets/:bucket/files', {
    preHandler: [
      validateFileUpload(config.maxFileSize)
    ]
  }, async (request, reply) => {
    try {
      const { bucket } = request.params;
      const file = request.validatedFile;
      
      // Validate bucket name
      const { error: bucketError } = fileKeySchema.validate(bucket);
      if (bucketError) {
        return reply.status(400).send({
          success: false,
          message: 'Invalid bucket name'
        });
      }
      
      // Get file key from form data or use filename
      const key = request.body.key || file.filename;
      
      // Validate file key
      const { error: keyError } = fileKeySchema.validate(key);
      if (keyError) {
        return reply.status(400).send({
          success: false,
          message: 'Invalid file key'
        });
      }
      
      // Validate file type and size
      s3Service.validateFileType(file.mimetype);
      s3Service.validateFileSize(file.file.bytesRead);
      
      // Read file buffer
      const fileBuffer = await file.toBuffer();
      
      // Upload file
      const result = await s3Service.uploadFile(
        bucket,
        key,
        fileBuffer,
        file.mimetype,
        {
          originalName: file.filename,
          uploadedAt: new Date().toISOString()
        }
      );
      
      return reply.status(201).send({
        success: true,
        message: 'File uploaded successfully',
        file: result
      });
    } catch (error) {
      fastify.log.error(error);
      
      if (error.message.includes('not allowed') || error.message.includes('exceeds maximum')) {
        return reply.status(400).send({
          success: false,
          message: error.message
        });
      }
      
      if (error.message.includes('not found') || error.message.includes('does not exist')) {
        return reply.status(404).send({
          success: false,
          message: 'Bucket not found'
        });
      }
      
      return reply.status(500).send({
        success: false,
        message: error.message
      });
    }
  });

  // Download file from bucket
  fastify.get('/buckets/:bucket/files/:key', async (request, reply) => {
    try {
      const { bucket, key } = request.params;
      
      // Validate bucket name and key
      const { error: bucketError } = fileKeySchema.validate(bucket);
      const { error: keyError } = fileKeySchema.validate(key);
      
      if (bucketError || keyError) {
        return reply.status(400).send({
          success: false,
          message: 'Invalid bucket name or file key'
        });
      }
      
      const fileData = await s3Service.downloadFile(bucket, key);
      
      // Set appropriate headers
      reply.header('Content-Type', fileData.contentType || 'application/octet-stream');
      reply.header('Content-Length', fileData.contentLength);
      reply.header('Last-Modified', fileData.lastModified);
      reply.header('ETag', fileData.etag);
      
      // Set filename for download
      const filename = key.split('/').pop();
      reply.header('Content-Disposition', `attachment; filename="${filename}"`);
      
      return reply.send(fileData.body);
    } catch (error) {
      fastify.log.error(error);
      
      if (error.message.includes('not found') || error.message.includes('does not exist')) {
        return reply.status(404).send({
          success: false,
          message: 'File not found'
        });
      }
      
      return reply.status(500).send({
        success: false,
        message: error.message
      });
    }
  });

  // Delete file from bucket
  fastify.delete('/buckets/:bucket/files/:key', async (request, reply) => {
    try {
      const { bucket, key } = request.params;
      const decodedKey = decodeURIComponent(key); // Decode the key
      
      // Validate bucket name and key
      const { error: bucketError } = fileKeySchema.validate(bucket);
      const { error: keyError } = fileKeySchema.validate(key);
      
      if (bucketError || keyError) {
        return reply.status(400).send({
          success: false,
          message: 'Invalid bucket name or file key'
        });
      }
      
      const result = await s3Service.deleteFile(bucket, decodedKey);
      
      return reply.send({
        success: true,
        message: result.message
      });
    } catch (error) {
      fastify.log.error(error);
      
      if (error.message.includes('not found') || error.message.includes('does not exist')) {
        return reply.status(404).send({
          success: false,
          message: 'File not found'
        });
      }
      
      return reply.status(500).send({
        success: false,
        message: error.message
      });
    }
  });

  // Get file metadata
  fastify.get('/buckets/:bucket/files/:key/metadata', async (request, reply) => {
    try {
      const { bucket, key } = request.params;
      const decodedKey = decodeURIComponent(key); // Decode the key
      
      // Validate bucket name and key
      const { error: bucketError } = fileKeySchema.validate(bucket);
      const { error: keyError } = fileKeySchema.validate(key);
      
      if (bucketError || keyError) {
        return reply.status(400).send({
          success: false,
          message: 'Invalid bucket name or file key'
        });
      }
      
      const metadata = await s3Service.getFileMetadata(bucket, decodedKey);
      
      return reply.send({
        success: true,
        metadata
      });
    } catch (error) {
      fastify.log.error(error);
      
      if (error.message.includes('not found') || error.message.includes('does not exist')) {
        return reply.status(404).send({
          success: false,
          message: 'File not found'
        });
      }
      
      return reply.status(500).send({
        success: false,
        message: error.message
      });
    }
  });

  // Generate presigned download URL
  fastify.get('/buckets/:bucket/download-url', async (request, reply) => {
    try {
      const { bucket } = request.params;
      const { key } = request.query;
      
      if (!key) {
        return reply.status(400).send({
          success: false,
          message: 'File key is required'
        });
      }
      
      // Validate bucket name and key
      const { error: bucketError } = fileKeySchema.validate(bucket);
      const { error: keyError } = fileKeySchema.validate(key);
      
      if (bucketError || keyError) {
        return reply.status(400).send({
          success: false,
          message: 'Invalid bucket name or file key'
        });
      }
      
      const downloadUrl = await s3Service.generateDownloadUrl(bucket, key);
      
      return reply.send({
        success: true,
        downloadUrl,
        expiresIn: config.presignedUrlExpiry
      });
    } catch (error) {
      fastify.log.error(error);
      
      if (error.message.includes('not found') || error.message.includes('does not exist')) {
        return reply.status(404).send({
          success: false,
          message: 'File not found'
        });
      }
      
      return reply.status(500).send({
        success: false,
        message: error.message
      });
    }
  });
}
