#!/bin/bash

echo "🚀 Starting React types fix process..."

# Install required dependencies
echo "📦 Installing React type definitions..."
npm install --save-dev @types/react@18.2.45 @types/react-dom@18.2.18

# Create temp file to verify React types
echo "🔍 Verifying React types..."
cat > temp-react-check.ts << EOL
import * as React from 'react';
const element: React.ReactNode = null;
EOL

# Try to compile the temp file
if npx tsc temp-react-check.ts --noEmit; then
    echo "✅ React types are correctly installed!"
else
    echo "⚠️ Installing fallback React types..."
    npm install --save-dev @types/react@18.0.28 @types/react-dom@18.0.11
fi

# Clean up temp file
rm -f temp-react-check.ts

# Update tsconfig.json if it exists
if [ -f tsconfig.json ]; then
    echo "🔧 Updating tsconfig.json..."
    # Create a temporary file with jq
    jq '.compilerOptions += {
        "jsx": "preserve",
        "jsxImportSource": "react",
        "allowSyntheticDefaultImports": true,
        "esModuleInterop": true
    }' tsconfig.json > tsconfig.json.tmp && mv tsconfig.json.tmp tsconfig.json
    echo "✅ tsconfig.json updated successfully!"
fi

# Create React declaration file if it doesn't exist
if [ ! -f react.d.ts ]; then
    echo "📝 Creating React declaration file..."
    cat > react.d.ts << EOL
declare module 'react' {
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
}
EOL
    echo "✅ React declaration file created successfully!"
fi

echo "🎉 React types fix process complete!" 