

const { existsSync, copyFileSync, mkdirSync } = require('fs');
const { join } = require('path');

/**
 * Netlify Build Plugin to ensure proper Next.js deployment
 */
module.exports = {
  onPostBuild: ({ constants }) => {
    const { PUBLISH_DIR } = constants;
    
    
    const customErrorPath = join(process.cwd(), 'public', '404.html');
    const targetErrorPath = join(PUBLISH_DIR, '404.html');
    
    if (existsSync(customErrorPath)) {
      console.log('📋 Copying custom 404 page for Netlify...');
      copyFileSync(customErrorPath, targetErrorPath);
    }
    
   
    console.log('📋 Creating fallback routing rules...');
    const redirectsPath = join(PUBLISH_DIR, '_redirects');
    
    
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