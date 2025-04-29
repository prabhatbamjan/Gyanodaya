const fs = require('fs');
const path = require('path');

// Path to directories
const oldDir = path.join(__dirname, 'contorollers');
const newDir = path.join(__dirname, 'controllers');

// Create new directory if it doesn't exist
if (!fs.existsSync(newDir)) {
  fs.mkdirSync(newDir, { recursive: true });
  console.log('Created controllers directory');
}

// Check if old directory exists
if (!fs.existsSync(oldDir)) {
  console.log('Old controllers directory (contorollers) does not exist');
  process.exit(0);
}

// Copy files from old to new directory
try {
  const files = fs.readdirSync(oldDir);
  
  console.log(`Found ${files.length} files to copy from contorollers to controllers`);
  
  for (const file of files) {
    const oldPath = path.join(oldDir, file);
    const newPath = path.join(newDir, file);
    
    // Only copy files, not directories
    if (fs.statSync(oldPath).isFile()) {
      fs.copyFileSync(oldPath, newPath);
      console.log(`Copied ${file} to controllers directory`);
    }
  }
  
  console.log('All controller files have been copied successfully');
  console.log('You can now update your imports to use the correctly spelled directory');
  
} catch (error) {
  console.error('Error copying files:', error);
  process.exit(1);
} 