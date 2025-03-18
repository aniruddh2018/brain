// This helps Netlify build process with Next.js
// Ensures proper file generation and post-processing

const { existsSync, copyFileSync, mkdirSync } = require('fs');
const { join } = require('path');

/**
 * Netlify Build Plugin to ensure proper Next.js deployment
 */
module.exports = {
  onPostBuild: ({ constants }) => {
    const { PUBLISH_DIR } = constants;
    
    // Ensure the 404 page is copied to the correct location
    const customErrorPath = join(process.cwd(), 'public', '404.html');
    const targetErrorPath = join(PUBLISH_DIR, '404.html');
    
    if (existsSync(customErrorPath)) {
      console.log('📋 Copying custom 404 page for Netlify...');
      copyFileSync(customErrorPath, targetErrorPath);
    }
    
    // Create a _redirects file to ensure client-side routing works
    console.log('📋 Creating fallback routing rules...');
    const redirectsPath = join(PUBLISH_DIR, '_redirects');
    
    // If you already have a _redirects file in your project, this won't overwrite it
    if (!existsSync(redirectsPath)) {
      const redirectsContent = `
# Netlify redirects
/api/*  /.netlify/functions/nextjs-api/:splat  200
/*      /index.html                            200
      `;
      
      require('fs').writeFileSync(redirectsPath, redirectsContent.trim());
    }
    
    console.log('✅ Next.js + Netlify setup complete!');
  }
}; 