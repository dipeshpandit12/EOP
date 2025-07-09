# PowerShell script to start an ngrok tunnel for your FastAPI server
# This exposes your local FastAPI server to the internet
# Allowing your Vercel-hosted Next.js app to communicate with your local FastAPI server

# Check if ngrok is installed
$ngrokInstalled = $null
try {
    $ngrokInstalled = Get-Command ngrok -ErrorAction Stop
} catch {
    Write-Host "ngrok is not installed. Please install it first:" -ForegroundColor Red
    Write-Host "npm install -g ngrok  # or" -ForegroundColor Yellow
    Write-Host "yarn global add ngrok" -ForegroundColor Yellow
    exit 1
}

# Define the FastAPI port
$FASTAPI_PORT = 8000

Write-Host "Starting ngrok tunnel to expose your FastAPI server..." -ForegroundColor Green
Write-Host "Your FastAPI server should be running on port $FASTAPI_PORT" -ForegroundColor Cyan

# Start ngrok in the foreground
ngrok http $FASTAPI_PORT

# Note: After running this script, copy the HTTPS URL from the ngrok output
# and add it as NEXT_PUBLIC_FASTAPI_BASE_URL in your Vercel environment variables
