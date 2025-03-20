// This file helps Netlify properly handle Next.js serverless functions
const { createRequestHandler } = require('@netlify/next');

module.exports = createRequestHandler({
  // If you have a custom app directory, you can specify it here
  dir: '.',
  // Enable trailing slash handling
  trailingSlash: true,
  // This is important for the PWA service worker
  poweredByHeader: false,
}); 