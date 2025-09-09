import React, { useState } from 'react';
import { Routes, Route, useLocation, useParams } from 'react-router-dom';
import { Header } from './components/Header.jsx';
import { BucketListView } from './components/BucketListView.jsx';
import { FileListView } from './components/FileListView.jsx';
import { FileDetailView } from './components/FileDetailView.jsx';
import { RateLimitNotification } from './components/RateLimitNotification.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

// Layout component that wraps all views with the header
const Layout = ({ children }) => {
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    sizeRange: 'any',
    customSizeMin: null,
    customSizeMax: null
  });
  const location = useLocation();
  
  // Determine current view and selected bucket from route
  const currentView = location.pathname === '/' ? 'buckets' : 'files';
  const bucketName = location.pathname.startsWith('/buckets/') 
    ? decodeURIComponent(location.pathname.split('/')[2]) 
    : null;

  const handleRefresh = () => {
    // Trigger refresh by emitting a custom event that child components can listen to
    window.dispatchEvent(new CustomEvent('refresh-data'));
  };

  const handleCreateBucket = () => {
    // Trigger create bucket modal by emitting a custom event
    window.dispatchEvent(new CustomEvent('open-create-bucket-modal'));
  };

  const handleUploadFiles = () => {
    // For files view, trigger file upload
    window.dispatchEvent(new CustomEvent('trigger-file-upload'));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header
        currentView={currentView}
        selectedBucket={bucketName}
        viewMode={viewMode}
        searchQuery={searchQuery}
        filters={filters}
        onViewChange={(view) => {
          // This is handled by routing now
        }}
        onViewModeChange={setViewMode}
        onSearchChange={setSearchQuery}
        onFiltersChange={setFilters}
        onRefresh={handleRefresh}
        onCreateBucket={handleCreateBucket}
        onUploadFiles={handleUploadFiles}
      />
      
      <main className="flex-1 p-6">
        {React.cloneElement(children, { viewMode, searchQuery, filters })}
      </main>
    </div>
  );
};

// Home page component (bucket listing)
const HomePage = ({ viewMode, searchQuery }) => {
  return <BucketListView viewMode={viewMode} searchQuery={searchQuery} />;
};

// Bucket files page component
const BucketFilesPage = ({ viewMode, searchQuery, filters }) => {
  return <FileListView viewMode={viewMode} searchQuery={searchQuery} filters={filters} />;
};

// Main App component with routing
function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Layout><HomePage /></Layout>} />
        <Route path="/buckets/:bucketName" element={<Layout><BucketFilesPage /></Layout>} />
        <Route path="/buckets/:bucketName/files/:fileKey" element={<FileDetailView />} />
        <Route path="*" element={
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h1>
              <p className="text-gray-600">The requested page could not be found.</p>
              <a href="/" className="btn-primary mt-4 inline-flex">
                Return Home
              </a>
            </div>
          </div>
        } />
      </Routes>
      
      {/* Global Rate Limit Notifications */}
      <RateLimitNotification />
    </ErrorBoundary>
  );
}

export default App;