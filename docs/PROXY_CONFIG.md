# FastAPI Proxy Configuration

This file documents how to set up and use the FastAPI proxy with your Next.js application.

## New Proxy Endpoint

We've created a new proxy endpoint at `/api/proxy-new/[...path]` that uses a different approach to route parameters which is compatible with Next.js App Router.

### How It Works

1. The proxy takes any request to `/api/proxy-new/*` and forwards it to your FastAPI backend
2. It preserves HTTP methods, headers, and request bodies
3. It includes timeout handling and error reporting

### Usage

When calling your FastAPI backend from the client:

```typescript
// Direct API call in development
const response = await fetch('/api/chat', { method: 'POST', body: ... });

// Proxied API call in production
const response = await fetch('/api/proxy-new/chat', { method: 'POST', body: ... });
```

We've configured `useChatAPI.ts` to automatically use the correct endpoint based on the environment:

```typescript
const API_ENDPOINT = process.env.NODE_ENV === 'production' 
  ? '/api/proxy-new/chat'  // Use proxy in production
  : '/api/chat';           // Use direct API in development
```

## Fixing the Type Error

We encountered a type error with the original proxy implementation:

```
app/api/proxy/[...path]/route.ts
Type error: Route has an invalid "GET" export:
Type "{ params: { path: string[]; }; }" is not a valid type for the function's second argument.
```

This was resolved by:

1. Creating a new proxy endpoint with the correct type definitions
2. Using a more structured approach to handle different HTTP methods
3. Following Next.js App Router's conventions for route handlers

## Configuration

To use this proxy with your Vercel deployment and local FastAPI backend:

1. Set up ngrok as described in the documentation
2. Update your Vercel environment variables:
   ```
   NEXT_PUBLIC_FASTAPI_BASE_URL=https://your-ngrok-url.ngrok.io
   ```
3. Make sure your FastAPI backend has CORS configured to accept requests from your Vercel domain
