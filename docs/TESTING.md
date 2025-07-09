# Testing Backend Connectivity

This page allows you to test the connection between your Next.js application and the FastAPI backend.

## Using the Test Tool

1. Go to `/test-backend` in your browser
2. Click the "Test Health Endpoint" button to verify basic connectivity
3. Click the "Test Chat Endpoint" button to test the chat functionality

## Proxy Testing

You can also test the proxy functionality from the browser console:

```javascript
// Import the proxy test function
import { testProxy } from './utils/test-proxy';

// Run the test
testProxy();
```

## Troubleshooting

### Common Errors

#### Connection Refused
This usually means your FastAPI server is not running or not accessible at the configured URL.

- Check that your FastAPI server is running
- Verify your environment variables are set correctly
- If using ngrok, make sure the tunnel is active

#### 500 Internal Server Error
This indicates that the FastAPI server is accessible but encountered an error processing the request.

- Check your FastAPI server logs for detailed error information
- Verify that your request format matches what the server expects

#### CORS Errors
If you see CORS-related errors in the browser console, your FastAPI server needs to be configured to allow requests from your Next.js domain.

Add this to your FastAPI app:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-vercel-app.vercel.app"],  # Add your Vercel domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```
