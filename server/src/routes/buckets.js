import { createBucketSchema, validateRequest } from '../middleware/validation.js';
import s3Service from '../services/s3Service.js';

export default async function bucketRoutes(fastify, options) {
  // List all buckets
  fastify.get('/buckets', async (request, reply) => {
    try {
      const buckets = await s3Service.listBuckets();
      return reply.send({
        success: true,
        buckets
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: error.message
      });
    }
  });

  // Create new bucket
  fastify.post('/buckets', {
    preHandler: validateRequest(createBucketSchema)
  }, async (request, reply) => {
    try {
      const { name, region } = request.body;
      const bucket = await s3Service.createBucket(name, region);
      
      return reply.status(201).send({
        success: true,
        message: 'Bucket created successfully',
        bucket
      });
    } catch (error) {
      fastify.log.error(error);
      
      if (error.message.includes('already exists') || error.message.includes('already owned')) {
        return reply.status(409).send({
          success: false,
          message: error.message
        });
      }
      
      return reply.status(500).send({
        success: false,
        message: error.message
      });
    }
  });

  // Delete bucket
  fastify.delete('/buckets/:name', async (request, reply) => {
    try {
      const { name } = request.params;
      
      // Validate bucket name
      const { error } = createBucketSchema.extract('name').validate(name);
      if (error) {
        return reply.status(400).send({
          success: false,
          message: 'Invalid bucket name'
        });
      }
      
      const result = await s3Service.deleteBucket(name);
      return reply.send({
        success: true,
        message: result.message
      });
    } catch (error) {
      fastify.log.error(error);
      
      if (error.message.includes('contains objects')) {
        return reply.status(409).send({
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
      
      // Handle access point errors differently
      if (error.code === 'BUCKET_HAS_ACCESS_POINTS') {
        return reply.status(409).send({
          success: false,
          message: error.message,
          code: 'BUCKET_HAS_ACCESS_POINTS',
          accessPoints: error.accessPoints
        });
      }
      
      return reply.status(500).send({
        success: false,
        message: error.message
      });
    }
  });

  // Delete bucket with access points (requires confirmation)
  fastify.delete('/buckets/:name/force', async (request, reply) => {
    try {
      const { name } = request.params;
      const accountId = process.env.AWS_ACCOUNT_ID;
      
      if (!accountId) {
        return reply.status(400).send({
          success: false,
          message: 'AWS_ACCOUNT_ID environment variable is required for access point management'
        });
      }
      
      // Validate bucket name
      const { error } = createBucketSchema.extract('name').validate(name);
      if (error) {
        return reply.status(400).send({
          success: false,
          message: 'Invalid bucket name'
        });
      }
      
      const result = await s3Service.deleteBucketWithAccessPoints(name, accountId);
      return reply.send({
        success: true,
        message: result.message
      });
    } catch (error) {
      fastify.log.error(error);
      
      if (error.message.includes('contains objects')) {
        return reply.status(409).send({
          success: false,
          message: error.message
        });
      }
      
      return reply.status(500).send({
        success: false,
        message: error.message
      });
    }
  });

  // Get bucket details
  fastify.get('/buckets/:name', async (request, reply) => {
    try {
      const { name } = request.params;
      
      // Validate bucket name
      const { error } = createBucketSchema.extract('name').validate(name);
      if (error) {
        return reply.status(400).send({
          success: false,
          message: 'Invalid bucket name'
        });
      }
      
      // Get bucket files to calculate stats
      const filesResult = await s3Service.listFiles(name, '', 1);
      const totalSize = await calculateBucketSize(name);
      
      return reply.send({
        success: true,
        bucket: {
          name,
          objectCount: filesResult.totalCount,
          totalSize,
          hasObjects: filesResult.totalCount > 0
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
}

// Helper function to calculate bucket size
async function calculateBucketSize(bucketName) {
  try {
    let totalSize = 0;
    let continuationToken;
    
    do {
      const result = await s3Service.listFiles(bucketName, '', 1000);
      totalSize += result.files.reduce((sum, file) => sum + file.size, 0);
      continuationToken = result.nextContinuationToken;
    } while (continuationToken);
    
    return totalSize;
  } catch (error) {
    return 0; // Return 0 if we can't calculate size
  }
}
