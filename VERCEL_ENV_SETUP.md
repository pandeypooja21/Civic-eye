# Setting Up Environment Variables in Vercel

## IMPORTANT: Direct Deployment Instructions

If you're still having issues with deployment, follow these exact steps:

1. **Go to the Vercel Dashboard**: https://vercel.com/dashboard

2. **Create a New Project**:
   - Click "Add New" > "Project"
   - Import your GitHub repository

3. **Configure Project**:
   - **Framework Preset**: Select "Other"
   - **Root Directory**: Leave as is (should be `.`)
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Environment Variables**:
   - Click "Environment Variables" section
   - Add each variable listed below in the "Required Environment Variables" section
   - Make sure to set them for all environments (Production, Preview, Development)

5. **Deploy**:
   - Click "Deploy"
   - Wait for the build to complete

6. **Check Logs**:
   - If the deployment fails, check the build logs for specific errors

This guide will help you set up environment variables for your Civic Eye Reporting application in Vercel.

## Why Environment Variables?

Environment variables allow you to store configuration settings and sensitive information (like API keys and database credentials) separately from your code. This is important for:

1. **Security**: Keeping sensitive information out of your codebase
2. **Flexibility**: Easily changing configuration between environments (development, staging, production)
3. **Portability**: Making your application work in different hosting environments

## Setting Up Environment Variables in Vercel

### Method 1: Using the Vercel Dashboard (Recommended)

1. Log in to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** > **Environment Variables**
4. Add each environment variable by clicking **Add New**:
   - Enter the name (e.g., `VITE_API_URL`)
   - Enter the value (e.g., `https://your-app-name.vercel.app/api`)
   - Select the environments where it should be available (Production, Preview, Development)
   - Click **Add**
5. Repeat for all required environment variables
6. Click **Save** when done
7. Redeploy your application for the changes to take effect

### Method 2: Using the Vercel CLI

You can also set environment variables using the Vercel CLI:

```bash
# Install Vercel CLI if you haven't already
npm i -g vercel

# Log in to Vercel
vercel login

# Set environment variables
vercel env add VITE_API_URL
# Follow the prompts to enter the value and select environments

# Repeat for all environment variables
# Then deploy your application
vercel --prod
```

## Required Environment Variables

### Frontend Variables

| Name | Example Value | Description |
|------|--------------|-------------|
| `VITE_API_URL` | `https://your-app-name.vercel.app/api` | URL to your API endpoint |
| `VITE_WS_URL` | `wss://your-app-name.vercel.app` | WebSocket URL (must use wss:// in production) |
| `VITE_MAPBOX_API_KEY` | `pk.eyJ1Ijoi...` | Your Mapbox API key |

### Backend Variables

| Name | Example Value | Description |
|------|--------------|-------------|
| `PORT` | `5000` | Port for the server (Vercel will override this) |
| `MONGODB_URI` | `mongodb+srv://username:password@cluster.mongodb.net/civic-eye` | MongoDB connection string |
| `FLUVIO_ENABLED` | `true` | Whether to enable Fluvio real-time updates |
| `FLUVIO_TOPIC` | `civic-eye-issues` | Fluvio topic name |
| `EMAIL_ENABLED` | `true` | Whether to enable email notifications |
| `EMAIL_SERVICE` | `gmail` | Email service provider |
| `EMAIL_USER` | `your-email@gmail.com` | Email address for sending notifications |
| `EMAIL_PASSWORD` | `your-app-password` | Email password or app password |

## Troubleshooting

### Environment Variables Not Working

If your environment variables aren't working:

1. **Check for typos**: Make sure the variable names match exactly what your code expects
2. **Verify scope**: Ensure variables are set for the correct environments (Production, Preview, Development)
3. **Redeploy**: Environment variable changes require a new deployment to take effect
4. **Check logs**: Look at your Vercel deployment logs for any error messages
5. **Prefix check**: Frontend variables accessible to the browser must start with `VITE_`

### "References Secret" Error

If you see an error like:
```
Environment Variable "VITE_API_URL" references Secret "vite_api_url", which does not exist.
```

This means you're trying to use a secret (with `@` prefix) that hasn't been created. Either:

1. Create the secret using `vercel secrets add vite_api_url your-value`, or
2. Use a direct value instead of a secret reference in your environment variables

### Build Failures

If your build is failing:

1. **Check the build logs**: Look for specific error messages
2. **Verify dependencies**: Make sure all dependencies are correctly installed
3. **Check build commands**: Ensure your build commands are correct
4. **Try a simpler deployment**: Start with just the frontend, then add the backend

### Deployment Strategies

If you're still having issues, try these alternative deployment strategies:

#### Strategy 1: Frontend-Only Deployment

1. Deploy only the frontend to Vercel
2. Deploy the backend separately (e.g., to Heroku, Railway, or Render)
3. Update the environment variables to point to your separate backend

#### Strategy 2: Monorepo Deployment

1. Use Vercel's monorepo support
2. Set the root directory to the frontend directory
3. Deploy the backend separately

#### Strategy 3: Use Vercel CLI

Try deploying with the Vercel CLI instead of the dashboard:

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (from project root)
vercel
```

Follow the prompts and set your environment variables when asked.

## Best Practices

1. **Use secrets for sensitive data**: For API keys, passwords, and tokens
2. **Set appropriate scopes**: Some variables might only be needed in production
3. **Use descriptive names**: Make it clear what each variable is for
4. **Document your variables**: Keep a list of all required variables and their purpose
5. **Don't commit .env files**: Keep your environment files out of version control

## Next Steps

After setting up your environment variables:

1. Deploy your application to Vercel
2. Verify that all features are working correctly
3. Check the logs for any environment-related errors
4. Test your application thoroughly in the production environment
