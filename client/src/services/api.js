// API service for communicating with the backend

const API_BASE_URL = '/api';

// Helper function to safely encode file keys
const encodeFileKey = (key) => {
  // Simply encode the key properly - S3 API returns clean, unencoded keys
  return encodeURIComponent(key);
};

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const apiRequest = async (url, options = {}) => {
  const config = {
    headers: {
      ...options.headers,
    },
    ...options,
  };

  // Only set Content-Type for JSON requests with body (not for FormData)
  if (options.body && !(options.body instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, config);
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: 'Network error' };
      }
      
      // Enhanced error messages for common status codes
      let errorMessage = errorData.message || `HTTP ${response.status}`;
      
      if (response.status === 429) {
        errorMessage = 'Too many requests. Please wait a moment before trying again.';
      } else if (response.status === 404) {
        errorMessage = 'Resource not found. It may have been deleted or moved.';
      } else if (response.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      throw new ApiError(
        errorMessage,
        response.status,
        errorData
      );
    }
    
    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network or other errors
    throw new ApiError(
      error.message || 'Network error',
      0,
      { message: 'Unable to connect to server' }
    );
  }
};

// Bucket API methods
export const bucketApi = {
  // List all buckets
  list: async () => {
    return apiRequest('/buckets');
  },

  // Create new bucket
  create: async (name, region = 'us-east-1') => {
    return apiRequest('/buckets', {
      method: 'POST',
      body: JSON.stringify({ name, region }),
    });
  },

  // Delete bucket
  delete: async (name) => {
    return apiRequest(`/buckets/${encodeURIComponent(name)}`, {
      method: 'DELETE',
    });
  },

  // Delete bucket with access points (force deletion)
  deleteWithAccessPoints: async (name) => {
    return apiRequest(`/buckets/${encodeURIComponent(name)}/force`, {
      method: 'DELETE',
    });
  },

  // Get bucket details
  get: async (name) => {
    return apiRequest(`/buckets/${encodeURIComponent(name)}`);
  },
};

// File API methods
export const fileApi = {
  // List files in bucket
  list: async (bucket, prefix = '', maxKeys = 1000) => {
    const params = new URLSearchParams();
    if (prefix) params.append('prefix', prefix);
    if (maxKeys !== 1000) params.append('maxKeys', maxKeys.toString());
    
    const queryString = params.toString();
    const url = `/buckets/${encodeURIComponent(bucket)}/files${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest(url);
  },

  // Upload file to bucket
  upload: async (bucket, file, key = null) => {
    const formData = new FormData();
    formData.append('file', file);
    if (key) formData.append('key', key);

    return apiRequest(`/buckets/${encodeURIComponent(bucket)}/files`, {
      method: 'POST',
      body: formData,
    });
  },

  // Download file from bucket
  download: async (bucket, key) => {
    return apiRequest(`/buckets/${encodeURIComponent(bucket)}/files/${encodeFileKey(key)}`);
  },

  // Delete file from bucket
  delete: async (bucket, key) => {
    return apiRequest(`/buckets/${encodeURIComponent(bucket)}/files/${encodeFileKey(key)}`, {
      method: 'DELETE',
    });
  },

  // Get file metadata
  getMetadata: async (bucket, key) => {
    return apiRequest(`/buckets/${encodeURIComponent(bucket)}/files/${encodeFileKey(key)}/metadata`);
  },

  // Generate presigned download URL
  getDownloadUrl: async (bucket, key) => {
    const params = new URLSearchParams({ key });
    const url = `/buckets/${encodeURIComponent(bucket)}/download-url?${params}`;
    console.log('Making download URL request:', url);
    return apiRequest(url);
  },
};

// Health check
export const healthApi = {
  check: async () => {
    return apiRequest('/health');
  },
};

// Export the main API object
export const api = {
  buckets: bucketApi,
  files: fileApi,
  health: healthApi,
};

export default api;
