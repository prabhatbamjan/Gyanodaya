const path = require('path');
const fs = require('fs');

/**
 * Creates the upload directory if it doesn't exist
 * @param {string} dirPath - Path to create
 */
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

/**
 * Converts a file path to a URL path
 * @param {string} filePath - The file system path 
 * @returns {string} - URL path for the file
 */
const getFileUrl = (filePath) => {
  // Extract the part of the path after 'uploads/'
  const regex = /uploads[/\\](.+)/;
  const match = filePath.match(regex);
  
  if (match && match[1]) {
    // Return a URL friendly path
    return `/uploads/${match[1].replace(/\\/g, '/')}`;
  }
  
  // If no match, return the original path
  return filePath;
};

/**
 * Process uploaded file data for storing in the database
 * @param {Object} file - Multer file object
 * @returns {Object} - File data for database storage
 */
const processUploadedFile = (file) => {
  return {
    filename: file.filename,
    originalName: file.originalname,
    path: file.path,
    url: getFileUrl(file.path),
    size: file.size,
    mimetype: file.mimetype,
    uploadedAt: new Date()
  };
};

/**
 * Delete a file from the filesystem
 * @param {string} filePath - Path to the file
 * @returns {boolean} - Whether deletion was successful
 */
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

module.exports = {
  ensureDirectoryExists,
  getFileUrl,
  processUploadedFile,
  deleteFile
}; 