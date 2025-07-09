#!/bin/bash

# This script helps expose your local FastAPI server to the internet using ngrok
# This allows your Vercel-hosted Next.js app to communicate with your local FastAPI server

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "ngrok is not installed. Please install it first:"
    echo "npm install -g ngrok  # or"
    echo "yarn global add ngrok"
    exit 1
fi

# Define the FastAPI port
FASTAPI_PORT=8000

echo "Starting ngrok tunnel to expose your FastAPI server..."
echo "Your FastAPI server should be running on port $FASTAPI_PORT"

# Start ngrok in the foreground
ngrok http $FASTAPI_PORT

# Note: After running this script, copy the HTTPS URL from the ngrok output
# and add it as NEXT_PUBLIC_FASTAPI_BASE_URL in your Vercel environment variables
