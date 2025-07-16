$env:FASTAPI_BASE_URL="https://holy-crab-known.ngrok-free.app"
Write-Host "Set FASTAPI_BASE_URL to $env:FASTAPI_BASE_URL"
node test-backend-connection.js
