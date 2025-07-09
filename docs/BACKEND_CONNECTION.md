# Next.js + FastAPI Connection Guide

## Local Development Setup
When running both Next.js and FastAPI locally, they can communicate directly:
- Next.js: http://localhost:3000 
- FastAPI: http://localhost:8000

## Production Deployment

### Option 1: Tunnel Your Local FastAPI to the Internet

Since your FastAPI server will always run locally, you need to make it accessible from the internet. You can use a tunneling service like ngrok to expose your local FastAPI server to the internet.

1. **Install and set up ngrok**:
   ```
   npm install -g ngrok
   # or
   yarn global add ngrok
   ```

2. **Start your FastAPI server locally**:
   ```
   # Start your FastAPI server on port 8000
   ```

3. **Create a tunnel with ngrok**:
   ```
   ngrok http 8000
   ```

4. **Update your Vercel environment variable**:
   In your Vercel project settings, add an environment variable:
   ```
   NEXT_PUBLIC_FASTAPI_BASE_URL=https://your-ngrok-url.ngrok.io
   ```

### Option 2: Proxy Requests Through Next.js API Routes

We've already set up rewrites in your Next.js config that will proxy requests to your FastAPI backend through your Next.js API routes.

1. **Update API routes to use the proxy**:
   Update your chat API call in `useChatAPI.ts` to use the proxy endpoint:

   ```typescript
   const response = await fetch('/api/proxy/chat', { ... })
   ```

   Instead of:
   ```typescript
   const response = await fetch('/api/chat', { ... })
   ```

2. **Set the NEXT_PUBLIC_FASTAPI_BASE_URL in Vercel**:
   In your Vercel project settings, add the environment variable with your ngrok URL:
   ```
   NEXT_PUBLIC_FASTAPI_BASE_URL=https://your-ngrok-url.ngrok.io
   ```

### Important Security Considerations

1. **Authentication**: Make sure your FastAPI endpoints require authentication to prevent unauthorized access.

2. **CORS Configuration**: Your FastAPI server should have CORS properly configured to accept requests from your Vercel domain.

3. **Rate Limiting**: Add rate limiting to your FastAPI server to prevent abuse.

## Troubleshooting

If you're experiencing connection issues:

1. **Check your ngrok tunnel** is running and note the URL (it changes each time unless you have a paid account)

2. **Verify environment variables** are set correctly in Vercel

3. **Test the connection** using the `/test-backend` page we added

4. **Check browser console** for any CORS or network errors

5. **Review server logs** from both Next.js and FastAPI for errors
