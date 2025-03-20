// Script to fix TypeScript React type issues
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('📦 Fixing React TypeScript type issues...');

// Execute npm commands
try {
  console.log('🔄 Installing required React type definitions...');
  
  // Install specific versions of React types
  execSync('npm install --save-dev @types/react@18.2.45 @types/react-dom@18.2.18', { stdio: 'inherit' });
  
  // Create a temp file to verify React types are properly installed
  const tempFilePath = path.join(__dirname, 'temp-react-check.ts');
  fs.writeFileSync(tempFilePath, `import * as React from 'react'; const element: React.ReactNode = null;`);
  
  // Try to compile the temp file
  try {
    console.log('🔍 Verifying React types...');
    execSync(`npx tsc ${tempFilePath} --noEmit`, { stdio: 'inherit' });
    console.log('✅ React types are correctly installed!');
  } catch (error) {
    console.error('❌ There was an issue with the React types. Installing fallback options...');
    
    // Try to install an older version as fallback
    execSync('npm install --save-dev @types/react@18.0.28 @types/react-dom@18.0.11', { stdio: 'inherit' });
  } finally {
    // Clean up the temp file
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
  }
  
  // Update tsconfig.json to ensure proper JSX settings
  const tsconfigPath = path.join(__dirname, 'tsconfig.json');
  if (fs.existsSync(tsconfigPath)) {
    console.log('🔧 Updating tsconfig.json...');
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
    
    // Ensure proper JSX settings
    tsconfig.compilerOptions = {
      ...tsconfig.compilerOptions,
      jsx: "preserve",
      jsxImportSource: "react",
      allowSyntheticDefaultImports: true,
      esModuleInterop: true,
    };
    
    fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
    console.log('✅ tsconfig.json updated successfully!');
  }
  
  // Create React declaration file if needed
  const reactDtsPath = path.join(__dirname, 'react.d.ts');
  if (!fs.existsSync(reactDtsPath)) {
    console.log('📝 Creating React declaration file...');
    const reactDts = `declare module 'react' {
  export = React;
  export as namespace React;
  namespace React {
    type ReactNode = 
      | React.ReactElement<any, any>
      | React.ReactFragment
      | React.ReactPortal
      | boolean
      | null
      | undefined;
  }
}

declare module 'react/jsx-runtime' {
  export { jsx, jsxs } from 'react';
  const Fragment: symbol;
  export { Fragment };
}`;
    
    fs.writeFileSync(reactDtsPath, reactDts);
    console.log('✅ React declaration file created successfully!');
  }

  console.log('🎉 Type fixing complete! Try to rebuild your project now.');
} catch (error) {
  console.error('❌ Error fixing React types:', error.message);
  process.exit(1);
} 