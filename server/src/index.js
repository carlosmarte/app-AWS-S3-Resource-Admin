import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';
import dotenv from 'dotenv';

// Import routes
import bucketRoutes from './routes/buckets.js';
import fileRoutes from './routes/files.js';

// Import configuration
import { validateAWSCredentials } from './config/aws.js';

// Load environment variables
dotenv.config();

// Validate AWS credentials on startup
try {
  validateAWSCredentials();
} catch (error) {
  console.error('AWS Configuration Error:', error.message);
  process.exit(1);
}

// Create Fastify instance
const fastify = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    transport: process.env.NODE_ENV === 'development' ? {
      target: 'pino-pretty',
      options: {
        colorize: true
      }
    } : undefined
  }
});

// Register plugins
async function registerPlugins() {
  // CORS
  await fastify.register(cors, {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
  });

  // Security headers
  await fastify.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"]
      }
    }
  });

  // Rate limiting - increased for gallery usage
  await fastify.register(rateLimit, {
    max: 500, // Increased from 100 to 500 for gallery image loading
    timeWindow: '1 minute',
    errorResponseBuilder: function (request, context) {
      return {
        success: false,
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Too many requests. You can make ${context.max} requests per ${context.timeWindow}. Please wait ${Math.ceil(context.ttl / 1000)} seconds.`,
        retryAfter: Math.ceil(context.ttl / 1000)
      };
    }
  });

  // Multipart support for file uploads
  await fastify.register(multipart, {
    limits: {
      fileSize: parseInt(process.env.MAX_FILE_SIZE) || 100 * 1024 * 1024, // 100MB
      files: 10
    }
  });
}

// Register routes
async function registerRoutes() {
  // Health check endpoint
  fastify.get('/health', async (request, reply) => {
    return { 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
  });

  // API routes
  await fastify.register(bucketRoutes, { prefix: '/api' });
  await fastify.register(fileRoutes, { prefix: '/api' });
}

// Error handler
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error);
  
  // Handle specific error types
  if (error.statusCode === 429 || error.message.includes('Rate limit')) {
    return reply.status(429).send({
      success: false,
      code: 'RATE_LIMIT_EXCEEDED',
      message: error.message || 'Too many requests. Please wait before trying again.',
      retryAfter: error.retryAfter || 60
    });
  }
  
  if (error.code === 'FST_ERR_VALIDATION') {
    return reply.status(400).send({
      success: false,
      message: 'Validation error',
      errors: error.validation
    });
  }
  
  if (error.code === 'FST_ERR_NOT_FOUND') {
    return reply.status(404).send({
      success: false,
      message: 'Route not found'
    });
  }
  
  // Default error response
  return reply.status(500).send({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message
  });
});

// Not found handler
fastify.setNotFoundHandler((request, reply) => {
  return reply.status(404).send({
    success: false,
    message: 'Route not found'
  });
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  fastify.log.info(`Received ${signal}, shutting down gracefully`);
  try {
    await fastify.close();
    process.exit(0);
  } catch (error) {
    fastify.log.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const start = async () => {
  try {
    await registerPlugins();
    await registerRoutes();
    
    const port = process.env.PORT || 3001;
    const host = process.env.HOST || '0.0.0.0';
    
    await fastify.listen({ port, host });
    
    fastify.log.info(`🚀 Server running on http://${host}:${port}`);
    fastify.log.info(`📊 Health check: http://${host}:${port}/health`);
    fastify.log.info(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  } catch (error) {
    fastify.log.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  fastify.log.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  fastify.log.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

start();
