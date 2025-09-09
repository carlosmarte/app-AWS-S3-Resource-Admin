# AWS S3 Resource Admin Application - Requirements

## Overview
A full-stack web application for managing AWS S3 buckets and files with a Node.js Fastify backend and React.js frontend.

## Architecture
- **Backend**: Node.js with Fastify framework
- **Frontend**: React.js with Vite bundler
- **Cloud Service**: AWS S3
- **Package Manager**: NPM with workspaces

## Environment Variables
```bash
AWS_S3_ACCESS_KEY=your_aws_access_key
AWS_S3_SECRET_KEY=your_aws_secret_key
AWS_REGION=us-east-1  # optional, defaults to us-east-1
```

## Project Structure
```
app/
├── package.json                 # Workspace root configuration
├── .env.example                 # Environment variables template
├── README.md                    # Project documentation
├── server/                      # Backend application
│   ├── package.json
│   ├── src/
│   │   ├── index.js            # Server entry point
│   │   ├── routes/
│   │   │   ├── buckets.js      # Bucket CRUD routes
│   │   │   └── files.js        # File CRUD routes
│   │   ├── services/
│   │   │   └── s3Service.js    # AWS S3 service layer
│   │   └── config/
│   │       └── aws.js          # AWS configuration
└── client/                      # Frontend application
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx            # React entry point
        ├── App.jsx             # Main application component
        ├── components/
        │   ├── BucketManager.jsx   # Bucket management UI
        │   ├── FileManager.jsx    # File management UI
        │   └── FileUpload.jsx     # File upload component
        └── services/
            └── api.js          # API client service
```

## API Specification

### Bucket Operations
| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET    | `/api/buckets` | List all buckets | - | `{buckets: [{name, creationDate}]}` |
| POST   | `/api/buckets` | Create new bucket | `{name: string}` | `{success: boolean, bucket: {name}}` |
| DELETE | `/api/buckets/:name` | Delete bucket | - | `{success: boolean, message: string}` |

### File Operations
| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET    | `/api/buckets/:bucket/files` | List files in bucket | - | `{files: [{key, size, lastModified}]}` |
| POST   | `/api/buckets/:bucket/files` | Upload file | `multipart/form-data` | `{success: boolean, file: {key, size}}` |
| GET    | `/api/buckets/:bucket/files/:key` | Download file | - | File stream with headers |
| DELETE | `/api/buckets/:bucket/files/:key` | Delete file | - | `{success: boolean, message: string}` |

## Implementation Steps

### Step 1: Project Initialization
1. Create workspace root `package.json` with npm workspaces
2. Initialize server and client directories
3. Set up basic project structure
4. Create `.env.example` file

### Step 2: Backend Setup (Fastify Server)
1. Create server `package.json` with dependencies:
   - `fastify` - Web framework
   - `@aws-sdk/client-s3` - AWS S3 SDK
   - `@fastify/multipart` - File upload handling
   - `@fastify/cors` - CORS middleware
   - `dotenv` - Environment variables

2. Create `src/config/aws.js`:
   - Configure AWS S3 client with credentials
   - Set up region and other AWS settings

3. Create `src/services/s3Service.js`:
   - Implement bucket operations (list, create, delete)
   - Implement file operations (list, upload, download, delete)
   - Error handling for AWS operations

4. Create `src/routes/buckets.js`:
   - GET `/buckets` - List all buckets
   - POST `/buckets` - Create new bucket
   - DELETE `/buckets/:name` - Delete bucket

5. Create `src/routes/files.js`:
   - GET `/buckets/:bucket/files` - List files
   - POST `/buckets/:bucket/files` - Upload file
   - GET `/buckets/:bucket/files/:key` - Download file
   - DELETE `/buckets/:bucket/files/:key` - Delete file

6. Create `src/index.js`:
   - Initialize Fastify server
   - Register plugins (CORS, multipart)
   - Register routes
   - Start server on port 3001

### Step 3: Frontend Setup (React + Vite)
1. Create client `package.json` with dependencies:
   - `react` - UI library
   - `react-dom` - React DOM renderer
   - `@vitejs/plugin-react` - Vite React plugin
   - `vite` - Build tool

2. Create `vite.config.js`:
   - Configure React plugin
   - Set up proxy for API calls to backend

3. Create `index.html`:
   - Basic HTML template with React root div

4. Create `src/main.jsx`:
   - React application entry point
   - Render App component

### Step 4: React Components Implementation
1. Create `src/services/api.js`:
   - HTTP client for API calls
   - Methods for all bucket and file operations
   - Error handling

2. Create `src/components/BucketManager.jsx`:
   - List existing buckets
   - Create new bucket form
   - Delete bucket functionality
   - Navigation to file management

3. Create `src/components/FileManager.jsx`:
   - List files in selected bucket
   - File download functionality
   - File deletion with confirmation
   - Integration with FileUpload component

4. Create `src/components/FileUpload.jsx`:
   - Drag and drop file upload
   - Upload progress indicator
   - Multiple file selection support
   - File validation (size, type)

5. Create `src/App.jsx`:
   - Main application layout
   - Route management between bucket and file views
   - Global error handling
   - Loading states

### Step 5: UI/UX Features
1. **Bucket Management Interface**:
   - Grid/list view of buckets
   - Bucket creation modal
   - Delete confirmation dialog
   - Search/filter buckets

2. **File Management Interface**:
   - File browser with folder-like navigation
   - File preview for images
   - Bulk file operations
   - File metadata display (size, date)

3. **File Upload Features**:
   - Drag & drop upload area
   - Progress bars for uploads
   - Upload queue management
   - Error handling for failed uploads

4. **Responsive Design**:
   - Mobile-friendly interface
   - Tablet optimization
   - Desktop full-feature experience

### Step 6: Error Handling & Validation
1. **Backend Validation**:
   - AWS credentials validation
   - Bucket name validation (AWS rules)
   - File size and type restrictions
   - Proper HTTP status codes

2. **Frontend Error Handling**:
   - Network error handling
   - AWS service error display
   - Form validation feedback
   - Retry mechanisms

### Step 7: Configuration & Deployment
1. Create comprehensive README.md
2. Add npm scripts for development and production
3. Environment configuration documentation
4. Docker configuration (optional)
5. Deployment instructions

## Technical Requirements

### Backend Dependencies
```json
{
  "fastify": "^4.24.3",
  "@aws-sdk/client-s3": "^3.428.0",
  "@fastify/multipart": "^8.0.0",
  "@fastify/cors": "^8.4.0",
  "dotenv": "^16.3.1"
}
```

### Frontend Dependencies
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "vite": "^4.4.5",
  "@vitejs/plugin-react": "^4.0.3"
}
```

### Environment Setup
1. AWS Account with S3 access
2. IAM User with S3 permissions:
   - `s3:ListBucket`
   - `s3:GetObject`
   - `s3:PutObject`
   - `s3:DeleteObject`
   - `s3:CreateBucket`
   - `s3:DeleteBucket`

## Security Considerations
- Environment variables for AWS credentials
- Input validation for bucket names and file uploads
- File type restrictions
- File size limits
- CORS configuration
- No hardcoded credentials in code

## Performance Optimizations
- Pagination for large file lists
- Lazy loading for file previews
- Connection pooling for AWS SDK
- Caching for bucket lists
- Streaming for large file downloads

## Testing Strategy
- Unit tests for S3 service methods
- Integration tests for API endpoints
- Component tests for React components
- End-to-end tests for critical user flows

# Sample app example
```jsx
import React, { useState, useRef, useCallback } from 'react';
import { 
  Cloud, FolderOpen, Upload, Download, Trash2, Plus, 
  X, Search, Grid, List, File, Image, FileText, 
  Music, Video, Archive, AlertCircle, CheckCircle,
  ChevronLeft, RefreshCw, MoreVertical, Filter,
  Clock, HardDrive, Calendar, Eye
} from 'lucide-react';

const S3AdminDashboard = () => {
  // State management for views and data
  const [currentView, setCurrentView] = useState('buckets'); // 'buckets' or 'files'
  const [selectedBucket, setSelectedBucket] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Mock data for demonstration
  const [buckets] = useState([
    { name: 'production-assets', creationDate: '2024-01-15', region: 'us-east-1', size: '2.4 GB', files: 234 },
    { name: 'backup-storage', creationDate: '2024-02-20', region: 'us-west-2', size: '15.7 GB', files: 1250 },
    { name: 'user-uploads', creationDate: '2024-03-10', region: 'eu-west-1', size: '892 MB', files: 89 },
    { name: 'static-website', creationDate: '2024-03-25', region: 'us-east-1', size: '124 MB', files: 45 },
    { name: 'logs-archive', creationDate: '2024-04-01', region: 'ap-southeast-1', size: '5.2 GB', files: 3421 },
  ]);

  const [files] = useState([
    { key: 'images/logo.png', size: '124 KB', lastModified: '2024-11-20', type: 'image' },
    { key: 'documents/report.pdf', size: '2.4 MB', lastModified: '2024-11-19', type: 'document' },
    { key: 'videos/demo.mp4', size: '45.2 MB', lastModified: '2024-11-18', type: 'video' },
    { key: 'archives/backup.zip', size: '892 MB', lastModified: '2024-11-17', type: 'archive' },
    { key: 'images/banner.jpg', size: '256 KB', lastModified: '2024-11-16', type: 'image' },
    { key: 'audio/podcast.mp3', size: '12.4 MB', lastModified: '2024-11-15', type: 'audio' },
  ]);

  // File type icon mapping
  const getFileIcon = (type) => {
    const icons = {
      image: <Image className="w-5 h-5" />,
      document: <FileText className="w-5 h-5" />,
      video: <Video className="w-5 h-5" />,
      audio: <Music className="w-5 h-5" />,
      archive: <Archive className="w-5 h-5" />,
      default: <File className="w-5 h-5" />
    };
    return icons[type] || icons.default;
  };

  // Handle file drag and drop
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFileUpload(droppedFiles);
  }, []);

  // Simulate file upload with progress
  const handleFileUpload = (files) => {
    files.forEach((file) => {
      const uploadId = `${file.name}-${Date.now()}`;
      
      // Initialize upload progress
      setUploadProgress(prev => ({
        ...prev,
        [uploadId]: { name: file.name, progress: 0, status: 'uploading' }
      }));

      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setUploadProgress(prev => ({
            ...prev,
            [uploadId]: { ...prev[uploadId], progress: 100, status: 'completed' }
          }));
          
          // Remove from progress after 3 seconds
          setTimeout(() => {
            setUploadProgress(prev => {
              const newProgress = { ...prev };
              delete newProgress[uploadId];
              return newProgress;
            });
          }, 3000);
        } else {
          setUploadProgress(prev => ({
            ...prev,
            [uploadId]: { ...prev[uploadId], progress }
          }));
        }
      }, 500);
    });
  };

  // Header Component
  const Header = () => (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Cloud className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">S3 Admin</h1>
            </div>
            {/* Breadcrumb */}
            {currentView === 'files' && selectedBucket && (
              <div className="flex items-center space-x-2 text-sm">
                <ChevronLeft className="w-4 h-4 text-gray-400" />
                <button 
                  onClick={() => setCurrentView('buckets')}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Buckets
                </button>
                <span className="text-gray-400">/</span>
                <span className="text-gray-700 font-medium">{selectedBucket}</span>
              </div>
            )}
          </div>

          {/* Header Actions */}
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${currentView}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
              >
                <Grid className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
              >
                <List className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Refresh Button */}
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>

            {/* Create/Upload Button */}
            <button
              onClick={() => currentView === 'buckets' ? setShowCreateModal(true) : fileInputRef.current?.click()}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              {currentView === 'buckets' ? (
                <>
                  <Plus className="w-5 h-5" />
                  <span>Create Bucket</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  <span>Upload Files</span>
                </>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={(e) => handleFileUpload(Array.from(e.target.files))}
              className="hidden"
            />
          </div>
        </div>
      </div>
    </header>
  );

  // Bucket Grid View Component
  const BucketGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {buckets.map((bucket) => (
        <div
          key={bucket.name}
          className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all cursor-pointer group"
          onClick={() => {
            setSelectedBucket(bucket.name);
            setCurrentView('files');
          }}
        >
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <FolderOpen className="w-6 h-6 text-blue-600" />
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteTarget(bucket);
                  setShowDeleteModal(true);
                }}
                className="opacity-0 group-hover:opacity-100 p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <MoreVertical className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            
            <h3 className="font-semibold text-gray-900 mb-2">{bucket.name}</h3>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-1">
                  <File className="w-3 h-3" />
                  <span>{bucket.files} files</span>
                </span>
                <span className="flex items-center space-x-1">
                  <HardDrive className="w-3 h-3" />
                  <span>{bucket.size}</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{bucket.region}</span>
                <span className="text-xs text-gray-500">{bucket.creationDate}</span>
              </div>
            </div>
          </div>
          
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 rounded-b-xl">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span className="flex items-center space-x-1">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span>Active</span>
              </span>
              <span className="text-blue-600 group-hover:underline">View Files →</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // File List View Component
  const FileList = () => (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <input type="checkbox" className="rounded border-gray-300" />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Size
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Modified
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {files.map((file) => (
            <tr key={file.key} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <input 
                  type="checkbox"
                  checked={selectedFiles.includes(file.key)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedFiles([...selectedFiles, file.key]);
                    } else {
                      setSelectedFiles(selectedFiles.filter(f => f !== file.key));
                    }
                  }}
                  className="rounded border-gray-300"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    file.type === 'image' ? 'bg-purple-50 text-purple-600' :
                    file.type === 'document' ? 'bg-blue-50 text-blue-600' :
                    file.type === 'video' ? 'bg-red-50 text-red-600' :
                    file.type === 'audio' ? 'bg-green-50 text-green-600' :
                    file.type === 'archive' ? 'bg-yellow-50 text-yellow-600' :
                    'bg-gray-50 text-gray-600'
                  }`}>
                    {getFileIcon(file.type)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{file.key}</div>
                    <div className="text-xs text-gray-500">Type: {file.type}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {file.size}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {file.lastModified}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-green-50 rounded-lg text-green-600 transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => {
                      setDeleteTarget(file);
                      setShowDeleteModal(true);
                    }}
                    className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Upload Progress Component
  const UploadProgress = () => (
    Object.keys(uploadProgress).length > 0 && (
      <div className="fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Uploading Files</h3>
        </div>
        <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
          {Object.entries(uploadProgress).map(([id, upload]) => (
            <div key={id} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700 truncate flex-1">{upload.name}</span>
                {upload.status === 'completed' ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <span className="text-gray-500">{Math.round(upload.progress)}%</span>
                )}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    upload.status === 'completed' ? 'bg-green-500' : 'bg-blue-600'
                  }`}
                  style={{ width: `${upload.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  );

  // Create Bucket Modal
  const CreateBucketModal = () => (
    showCreateModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl w-full max-w-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Create New Bucket</h2>
            <button
              onClick={() => setShowCreateModal(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bucket Name
              </label>
              <input
                type="text"
                placeholder="my-bucket-name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Must be globally unique and follow AWS naming conventions
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Region
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>us-east-1</option>
                <option>us-west-2</option>
                <option>eu-west-1</option>
                <option>ap-southeast-1</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Access Control
              </label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="radio" name="access" defaultChecked className="text-blue-600" />
                  <span className="text-sm text-gray-700">Private (Recommended)</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="radio" name="access" className="text-blue-600" />
                  <span className="text-sm text-gray-700">Public Read</span>
                </label>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              Create Bucket
            </button>
          </div>
        </div>
      </div>
    )
  );

  // Delete Confirmation Modal
  const DeleteModal = () => (
    showDeleteModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl w-full max-w-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Confirm Delete</h2>
            <button
              onClick={() => setShowDeleteModal(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center justify-center w-12 h-12 bg-red-50 rounded-full mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-gray-700">
              Are you sure you want to delete <span className="font-semibold">{deleteTarget?.name || deleteTarget?.key}</span>? 
              This action cannot be undone.
            </p>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
              Delete
            </button>
          </div>
        </div>
      </div>
    )
  );

  // Main content area
  const MainContent = () => (
    <main className="flex-1 p-6 bg-gray-50">
      {currentView === 'buckets' ? (
        <>
          {/* Buckets Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Buckets</p>
                  <p className="text-2xl font-bold text-gray-900">{buckets.length}</p>
                </div>
                <FolderOpen className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Storage</p>
                  <p className="text-2xl font-bold text-gray-900">24.3 GB</p>
                </div>
                <HardDrive className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Files</p>
                  <p className="text-2xl font-bold text-gray-900">5,039</p>
                </div>
                <File className="w-8 h-8 text-purple-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Regions</p>
                  <p className="text-2xl font-bold text-gray-900">4</p>
                </div>
                <Cloud className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </div>
          
          {/* Bucket Grid/List */}
          {viewMode === 'grid' ? <BucketGrid /> : <FileList />}
        </>
      ) : (
        <>
          {/* File Upload Area */}
          <div 
            className={`mb-6 border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Drop files here to upload
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              or click the upload button to select files
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Select Files
            </button>
          </div>
          
          {/* File List */}
          {viewMode === 'list' ? <FileList /> : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {files.map((file) => (
                <div key={file.key} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-all cursor-pointer">
                  <div className={`w-full h-20 rounded-lg flex items-center justify-center mb-3 ${
                    file.type === 'image' ? 'bg-purple-50' :
                    file.type === 'document' ? 'bg-blue-50' :
                    file.type === 'video' ? 'bg-red-50' :
                    file.type === 'audio' ? 'bg-green-50' :
                    file.type === 'archive' ? 'bg-yellow-50' :
                    'bg-gray-50'
                  }`}>
                    <div className={`${
                      file.type === 'image' ? 'text-purple-600' :
                      file.type === 'document' ? 'text-blue-600' :
                      file.type === 'video' ? 'text-red-600' :
                      file.type === 'audio' ? 'text-green-600' :
                      file.type === 'archive' ? 'text-yellow-600' :
                      'text-gray-600'
                    }`}>
                      {getFileIcon(file.type)}
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-900 truncate">{file.key.split('/').pop()}</p>
                  <p className="text-xs text-gray-500">{file.size}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <MainContent />
      
      {/* Modals */}
      <CreateBucketModal />
      <DeleteModal />
      
      {/* Upload Progress Indicator */}
      <UploadProgress />
    </div>
  );
};

export default S3AdminDashboard;
```