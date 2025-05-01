import React, { useRef } from 'react';
import { Upload, X, FileText, AlertCircle } from 'lucide-react';

const FileUploader = ({ 
  files, 
  onFilesChange, 
  maxFiles = 5, 
  maxSize = 5, // in MB
  accept = '*', 
  error = null,
  label = 'Upload Files',
  note = `Maximum ${maxFiles} files. Each file must be ${maxSize}MB or less.`
}) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    // Filter out files that exceed maxSize
    const validFiles = selectedFiles.filter(file => {
      const fileSizeInMB = file.size / (1024 * 1024);
      return fileSizeInMB <= maxSize;
    });
    
    // Check if total files would exceed maxFiles
    if (files.length + validFiles.length > maxFiles) {
      alert(`You can only upload a maximum of ${maxFiles} files.`);
      return;
    }
    
    // Add valid files to existing files
    if (validFiles.length > 0) {
      onFilesChange([...files, ...validFiles]);
    }
    
    // Reset the input value to allow uploading the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  const formatFileSize = (size) => {
    if (size < 1024) {
      return `${size} B`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(2)} KB`;
    } else {
      return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    }
  };

  return (
    <div className="mt-2">
      <div className="flex flex-col">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        
        <div className="mt-1 flex items-center">
          <label className="cursor-pointer rounded-md bg-white px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 border border-gray-300">
            <Upload className="mr-2 inline-block h-4 w-4" />
            Choose Files
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              multiple
              accept={accept}
              onChange={handleFileChange}
            />
          </label>
          <span className="ml-3 text-sm text-gray-500">
            {files.length > 0
              ? `${files.length} ${files.length === 1 ? 'file' : 'files'} selected`
              : 'No files selected'}
          </span>
        </div>
        
        <p className="mt-1 text-xs text-gray-500">{note}</p>
        
        {error && (
          <div className="mt-2 text-sm text-red-600 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {error}
          </div>
        )}
        
        {/* Show selected files */}
        {files.length > 0 && (
          <div className="mt-3 space-y-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2">
                <div className="flex items-center max-w-xs sm:max-w-md overflow-hidden">
                  <FileText className="mr-2 h-5 w-5 text-gray-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 truncate">
                    {file.name}
                  </span>
                  <span className="ml-2 text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="ml-2 text-gray-500 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploader; 