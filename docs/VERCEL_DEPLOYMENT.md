# FastAPI Backend Connection with Vercel

This guide explains how to connect your Vercel-deployed Next.js application to your local FastAPI backend server.

## Setup Instructions

### 1. Start Your FastAPI Server Locally

Make sure your FastAPI server is running on port 8000.

### 2. Create a Tunnel to Expose Your Local Server

Use the provided script to create a tunnel with ngrok:

#### Windows:
```powershell
.\scripts\start-tunnel.ps1
```

#### macOS/Linux:
```bash
bash scripts/start-tunnel.sh
```

This will give you a public HTTPS URL (e.g., https://abcd1234.ngrok.io).

### 3. Update Vercel Environment Variable

In your Vercel project settings, add or update this environment variable:

```
NEXT_PUBLIC_FASTAPI_BASE_URL=https://your-ngrok-url.ngrok.io
```

Replace `your-ngrok-url.ngrok.io` with the URL from ngrok.

### 4. Deploy Your Next.js App to Vercel

Your Vercel-deployed app will now be able to communicate with your local FastAPI server through the ngrok tunnel.

## How It Works

1. Your Vercel-deployed Next.js app receives requests from users
2. Next.js forwards API requests to your local FastAPI server via the ngrok tunnel
3. Your FastAPI server processes the requests and sends responses back

## Important Notes

- **Tunnel URL Changes**: The free version of ngrok gives you a different URL each time you restart the tunnel. You'll need to update your Vercel environment variable whenever you restart ngrok.
- **Security**: Be cautious as your local server is now exposed to the internet. Consider adding authentication.
- **Reliability**: For a more reliable setup in production, consider hosting your FastAPI server on a cloud provider.
