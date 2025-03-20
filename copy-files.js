// Script to copy essential files for Next.js build on Netlify
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('📁 Copying essential files for Netlify build...');

const copyFolders = [
  { src: 'lib', dest: '.next/server/lib' },
  { src: 'components', dest: '.next/server/components' },
  { src: 'types', dest: '.next/server/types' }
];

// Ensure the build folders exist and copy files
copyFolders.forEach(({ src, dest }) => {
  if (fs.existsSync(src)) {
    try {
      // Create destination directory
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      
      // Use a cross-platform command to copy files
      const command = process.platform === 'win32'
        ? `xcopy /E /I /Y "${src}" "${dest}"`
        : `cp -r "${src}/"* "${dest}/"`;
      
      execSync(command);
      console.log(`✅ Copied ${src} to ${dest}`);
    } catch (error) {
      console.error(`❌ Error copying ${src} to ${dest}:`, error.message);
    }
  } else {
    console.warn(`⚠️ Source folder ${src} does not exist.`);
  }
});

console.log('✨ File copying complete!'); 