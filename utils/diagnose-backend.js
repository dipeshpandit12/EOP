// Backend connection diagnostic script
async function diagnoseBackendConnection() {
  const FASTAPI_URL = 
    process.env.NEXT_PUBLIC_FASTAPI_BASE_URL || 
    process.env.FASTAPI_BASE_URL || 
    'http://localhost:8000';
  
  console.log('Diagnosing FastAPI backend connection...');
  console.log(`Using FastAPI URL: ${FASTAPI_URL}`);
  
  // Test basic connection
  try {
    console.log('\n1. Testing basic connection...');
    const startTime = Date.now();
    const response = await fetch(`${FASTAPI_URL}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      // Add timeout to avoid hanging
      signal: AbortSignal.timeout(5000)
    });
    const endTime = Date.now();
    
    console.log(`Response time: ${endTime - startTime}ms`);
    console.log(`Status: ${response.status} (${response.statusText})`);
    
    if (response.ok) {
      const data = await response.text();
      console.log(`Response data: ${data}`);
    } else {
      console.error(`Error response: ${await response.text()}`);
    }
  } catch (error) {
    console.error(`Connection error: ${error.message}`);
  }
  
  // Test chat endpoint
  try {
    console.log('\n2. Testing chat endpoint...');
    const startTime = Date.now();
    const response = await fetch(`${FASTAPI_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Hello, this is a diagnostic test',
        session_id: 'diagnostic-session'
      }),
      // Add timeout to avoid hanging
      signal: AbortSignal.timeout(10000)
    });
    const endTime = Date.now();
    
    console.log(`Response time: ${endTime - startTime}ms`);
    console.log(`Status: ${response.status} (${response.statusText})`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`Response data: ${JSON.stringify(data, null, 2)}`);
    } else {
      console.error(`Error response: ${await response.text()}`);
    }
  } catch (error) {
    console.error(`Chat endpoint error: ${error.message}`);
  }
}

// Run the diagnostic when this script is executed directly
if (typeof window !== 'undefined') {
  // Run in browser context
  window.runDiagnostic = diagnoseBackendConnection;
  console.log('Run window.runDiagnostic() to test the backend connection');
} else {
  // Run in Node.js context
  diagnoseBackendConnection();
}

export { diagnoseBackendConnection };
