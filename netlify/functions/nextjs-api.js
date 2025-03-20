// This file handles Next.js API routes in Netlify Functions

// Use the Next.js API handler from the @netlify/next package
const { nextApiHandler } = require('@netlify/next');

exports.handler = nextApiHandler; 