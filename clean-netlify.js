// Script to clean up files before Netlify deployment
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧹 Cleaning up before Netlify deployment...');

// Directories to clean
const cleanupDirs = [
  '.next/cache',
  'node_modules/.cache',
];

// Clean specific directories
cleanupDirs.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);
  if (fs.existsSync(dirPath)) {
    console.log(`📁 Cleaning directory: ${dir}`);
    try {
      // Use rimraf to remove directory recursively
      execSync(`npx rimraf "${dirPath}"`);
      console.log(`✅ Cleaned ${dir}`);
    } catch (error) {
      console.error(`❌ Error cleaning ${dir}:`, error.message);
    }
  }
});

// Modify package.json to include only necessary dependencies
try {
  console.log('📝 Optimizing package.json dependencies...');
  const packagePath = path.join(process.cwd(), 'package.json');
  const packageJson = require(packagePath);
  
  // Move certain dev dependencies to dependencies for Netlify
  const criticalDevDeps = ['@netlify/next'];
  const devDeps = packageJson.devDependencies || {};
  const deps = packageJson.dependencies || {};
  
  criticalDevDeps.forEach(dep => {
    if (devDeps[dep] && !deps[dep]) {
      console.log(`⚠️ Moving ${dep} from devDependencies to dependencies`);
      deps[dep] = devDeps[dep];
      delete devDeps[dep];
    }
  });
  
  packageJson.dependencies = deps;
  packageJson.devDependencies = devDeps;
  
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Package.json optimized');
} catch (error) {
  console.error('❌ Error optimizing package.json:', error.message);
}

console.log('✨ Cleanup complete! Ready for deployment.'); 