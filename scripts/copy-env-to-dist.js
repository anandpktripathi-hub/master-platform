// This script copies the .env file to the dist/backend directory after build.
// Add this script to your package.json as a postbuild step.

const fs = require('fs');
const path = require('path');


const src = path.resolve(__dirname, '../.env');
const destDir = path.resolve(__dirname, '../dist/backend');
const dest = path.join(destDir, '.env');

if (fs.existsSync(src)) {
  // Ensure the destination directory exists
  fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(src, dest);
  console.log('.env file copied to dist/backend/.env');
} else {
  console.warn('.env file not found in project root.');
}
