# IQLEVAL

A cognitive assessment application built with Next.js.

## Deployment to Netlify

### Prerequisites

- A Netlify account
- Git repository with your code

### Deployment Steps

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)

2. In Netlify:
   - Click "New site from Git"
   - Connect to your Git provider and select your repository
   - Use the following build settings:
     - Build command: `npm run build`
     - Publish directory: `.next`

3. Environment Variables:
   - In Netlify site settings, go to "Environment variables"
   - Add the following environment variables:
     ```
     NEXT_PUBLIC_AI_API_KEY=your_api_key_here
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
     ```

4. Deploy!
   - Netlify will automatically deploy your site
   - Any future pushes to your main branch will trigger new deployments

### Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Visit `http://localhost:3000` to see the application. 