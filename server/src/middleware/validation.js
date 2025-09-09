import Joi from 'joi';

// Validation schemas
export const bucketNameSchema = Joi.string()
  .min(3)
  .max(63)
  .pattern(/^[a-z0-9.-]+$/)
  .messages({
    'string.pattern.base': 'Bucket name can only contain lowercase letters, numbers, dots, and hyphens',
    'string.min': 'Bucket name must be at least 3 characters long',
    'string.max': 'Bucket name must be at most 63 characters long'
  });

export const createBucketSchema = Joi.object({
  name: bucketNameSchema.required(),
  region: Joi.string().optional().default('us-east-1')
});

export const fileKeySchema = Joi.string()
  .min(1)
  .max(1024)
  .pattern(/^[^<>:"|?*]+$/)
  .messages({
    'string.pattern.base': 'File key contains invalid characters',
    'string.min': 'File key cannot be empty',
    'string.max': 'File key is too long'
  });

export const listFilesSchema = Joi.object({
  prefix: Joi.string().optional().default(''),
  maxKeys: Joi.number().integer().min(1).max(1000).optional().default(1000)
});

// Validation middleware factory
export const validateRequest = (schema, property = 'body') => {
  return async (request, reply) => {
    try {
      const { error, value } = schema.validate(request[property], { 
        abortEarly: false,
        stripUnknown: true 
      });
      
      if (error) {
        return reply.status(400).send({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        });
      }
      
      request[property] = value;
    } catch (err) {
      return reply.status(500).send({
        success: false,
        message: 'Validation failed'
      });
    }
  };
};

// File upload validation
export const validateFileUpload = (maxSize = 100 * 1024 * 1024) => {
  return async (request, reply) => {
    const file = request.file;
    
    if (!file) {
      return reply.status(400).send({
        success: false,
        message: 'No file provided'
      });
    }
    
    if (file.file.bytesRead > maxSize) {
      return reply.status(400).send({
        success: false,
        message: `File size exceeds maximum allowed size of ${maxSize} bytes`
      });
    }
    
    // Additional file validation can be added here
    request.validatedFile = file;
  };
};
