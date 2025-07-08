# Deploying Civic Eye Reporting to Vercel

This guide will help you deploy the Civic Eye Reporting application to Vercel.

## Prerequisites

1. A [Vercel](https://vercel.com) account
2. [Vercel CLI](https://vercel.com/docs/cli) installed (optional, for local testing)
3. A MongoDB Atlas account (for the database)
4. Mapbox API key

## Setting Up Environment Variables in Vercel

Before deploying, you need to set up environment variables in your Vercel project. You can do this through the Vercel dashboard:

1. Go to your Vercel dashboard
2. Select your project
3. Go to "Settings" > "Environment Variables"
4. Add the following environment variables:

### Frontend Variables
- `VITE_API_URL`: URL to your API (e.g., `https://your-project.vercel.app/api`)
- `VITE_WS_URL`: WebSocket URL (e.g., `wss://your-project.vercel.app`)
- `VITE_MAPBOX_API_KEY`: Your Mapbox API key

### Backend Variables
- `PORT`: `5000` (Vercel will override this, but include it anyway)
- `MONGODB_URI`: Your MongoDB connection string
- `FLUVIO_ENABLED`: `true` or `false`
- `FLUVIO_TOPIC`: `civic-eye-issues`
- `FLUVIO_ENDPOINT`: Your Fluvio endpoint (if applicable)

### Email Variables
- `EMAIL_ENABLED`: `true` or `false`
- `EMAIL_SERVICE`: `gmail` (or another email service)
- `EMAIL_USER`: Your email address
- `EMAIL_PASSWORD`: Your email app password

## Deployment Steps

### Using Vercel Dashboard

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Log in to your Vercel dashboard
3. Click "New Project"
4. Import your repository
5. Configure the project:
   - Build Command: `npm run vercel-build`
   - Output Directory: `dist`
   - Install Command: `npm install`
6. Add the environment variables as described above
7. Click "Deploy"

### Using Vercel CLI

1. Install Vercel CLI: `npm i -g vercel`
2. Log in to Vercel: `vercel login`
3. Navigate to your project directory
4. Run: `vercel`
5. Follow the prompts to configure your project
6. To deploy to production: `vercel --prod`

## Troubleshooting

### WebSocket Connection Issues

If you're having issues with WebSocket connections, make sure:

1. Your `VITE_WS_URL` is using the `wss://` protocol (secure WebSockets)
2. Vercel's serverless functions have limitations with long-lived connections. You might need to adjust your WebSocket implementation or use a separate service for WebSockets.

### MongoDB Connection Issues

If you're having trouble connecting to MongoDB:

1. Make sure your IP address is whitelisted in MongoDB Atlas
2. Ensure your connection string is correct
3. Check that your database user has the correct permissions

### Environment Variable Issues

If your environment variables aren't working:

1. Make sure they're correctly set in the Vercel dashboard
2. Redeploy your application after updating environment variables
3. Check that you're referencing them correctly in your code

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Mapbox Documentation](https://docs.mapbox.com/)
