# AWS S3 Resource Admin

A modern, full-stack web application for managing AWS S3 buckets and files built with React 18, Vite, Fastify, and Node.js.

## 🚀 Features

- **Bucket Management**: Create, list, and delete S3 buckets
- **File Operations**: Upload, download, delete, and manage files
- **Modern UI**: Beautiful, responsive interface with drag-and-drop support
- **Real-time Updates**: Live progress tracking for file uploads
- **Search & Filter**: Find buckets and files quickly
- **Multiple Views**: Grid and list view modes
- **Security**: Input validation, rate limiting, and secure file handling

## 🏗️ Architecture

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Node.js + Fastify + AWS SDK v3
- **Package Management**: NPM Workspaces
- **Cloud Service**: AWS S3

## 📋 Prerequisites

- Node.js 18+ 
- NPM 9+
- AWS Account with S3 access
- IAM User with S3 permissions

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd app-AWS-S3-Resource-Admin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your AWS credentials:
   ```bash
   AWS_S3_ACCESS_KEY=your_aws_access_key_here
   AWS_S3_SECRET_KEY=your_aws_secret_key_here
   AWS_REGION=us-east-1
   AWS_ACCOUNT_ID=your_aws_account_id_here
   PORT=3001
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:5173
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend server on http://localhost:3001
   - Frontend development server on http://localhost:5173

## 🔧 Available Scripts

### Root Level
- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build both applications for production
- `npm run start` - Start production server
- `npm run test` - Run tests (when implemented)
- `npm run lint` - Run linting (when implemented)

### Backend (server/)
- `npm run dev` - Start server with auto-reload
- `npm run start` - Start production server
- `npm run build` - No build step required for Node.js

### Frontend (client/)
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🔐 AWS IAM Permissions

Your AWS IAM user needs the following S3 permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket",
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:CreateBucket",
        "s3:DeleteBucket",
        "s3:GetBucketLocation",
        "s3:ListObjectsV2"
      ],
      "Resource": [
        "arn:aws:s3:::*",
        "arn:aws:s3:::*/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListAccessPoints",
        "s3:DeleteAccessPoint"
      ],
      "Resource": "*"
    }
  ]
}
```

**Note**: The access point permissions are optional but recommended. If you don't have these permissions, buckets with access points will need to be cleaned up manually in the AWS Console before deletion.

## 📁 Project Structure

```
app-AWS-S3-Resource-Admin/
├── package.json                 # Workspace root configuration
├── env.example                  # Environment variables template
├── README.md                    # This file
├── server/                      # Backend application
│   ├── package.json
│   └── src/
│       ├── index.js            # Server entry point
│       ├── config/
│       │   └── aws.js          # AWS configuration
│       ├── services/
│       │   └── s3Service.js    # AWS S3 service layer
│       ├── routes/
│       │   ├── buckets.js      # Bucket CRUD routes
│       │   └── files.js        # File CRUD routes
│       ├── middleware/
│       │   └── validation.js   # Request validation
│       └── utils/
└── client/                      # Frontend application
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── main.jsx            # React entry point
        ├── App.jsx             # Main application component
        ├── components/         # React components
        │   ├── Header.jsx
        │   ├── BucketCard.jsx
        │   ├── FileCard.jsx
        │   ├── FileUpload.jsx
        │   ├── Modal.jsx
        │   └── ...
        ├── services/
        │   └── api.js          # API client service
        ├── hooks/
        │   ├── useApi.js
        │   └── useFileUpload.js
        ├── utils/
        │   ├── cn.js
        │   └── fileUtils.js
        └── styles/
            └── index.css
```

## 🌐 API Endpoints

### Bucket Operations
- `GET /api/buckets` - List all buckets
- `POST /api/buckets` - Create new bucket
- `DELETE /api/buckets/:name` - Delete bucket
- `GET /api/buckets/:name` - Get bucket details

### File Operations
- `GET /api/buckets/:bucket/files` - List files in bucket
- `POST /api/buckets/:bucket/files` - Upload file
- `GET /api/buckets/:bucket/files/:key` - Download file
- `DELETE /api/buckets/:bucket/files/:key` - Delete file
- `GET /api/buckets/:bucket/files/:key/metadata` - Get file metadata
- `GET /api/buckets/:bucket/files/:key/download-url` - Get presigned download URL

### Health Check
- `GET /health` - Server health status

## 🎨 UI Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark/Light Mode**: Automatic theme detection
- **Drag & Drop**: Intuitive file upload experience
- **Progress Tracking**: Real-time upload progress
- **Search & Filter**: Quick content discovery
- **Bulk Operations**: Select multiple files for batch actions
- **File Previews**: Visual file type indicators

## 🔒 Security Features

- Input validation and sanitization
- Rate limiting on API endpoints
- CORS configuration
- File type and size restrictions
- Secure AWS credential handling
- XSS and CSRF protection

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Environment Variables for Production
```bash
NODE_ENV=production
PORT=3001
AWS_S3_ACCESS_KEY=your_production_key
AWS_S3_SECRET_KEY=your_production_secret
AWS_REGION=us-east-1
CORS_ORIGIN=https://yourdomain.com
```

### Docker Deployment (Optional)
```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

## 🧪 Testing

Testing setup is prepared but not yet implemented. Future testing will include:

- Unit tests for S3 service methods
- Integration tests for API endpoints
- Component tests for React components
- End-to-end tests for critical user flows

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

1. **AWS Credentials Error**
   - Ensure your AWS credentials are correctly set in `.env`
   - Verify IAM permissions for S3 access

2. **CORS Issues**
   - Check that `CORS_ORIGIN` matches your frontend URL
   - Ensure both servers are running on correct ports

3. **File Upload Fails**
   - Check file size limits (default: 100MB)
   - Verify file type restrictions
   - Ensure bucket exists and is accessible

4. **Build Errors**
   - Clear node_modules and reinstall: `npm run clean && npm install`
   - Check Node.js version compatibility

### Getting Help

- Check the browser console for frontend errors
- Check server logs for backend errors
- Verify AWS S3 permissions and bucket access
- Ensure all environment variables are set correctly

## 🔄 Updates

This application uses modern technologies and follows current best practices:

- **React 18**: Stable React version with excellent performance and features
- **Vite**: Fast build tool with excellent developer experience
- **Fastify**: High-performance Node.js web framework
- **AWS SDK v3**: Latest AWS SDK with modular architecture
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development