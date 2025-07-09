/* This test script verifies that the FastAPI proxy is working correctly */

async function testProxy() {
  console.log('Testing FastAPI proxy...');
  
  // Test the proxy health endpoint
  try {
    console.log('\n1. Testing proxy health endpoint...');
    const response = await fetch('/api/proxy/health');
    console.log(`Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.text();
      console.log(`Response: ${data}`);
    } else {
      console.error(`Error: ${response.statusText}`);
      try {
        const errorText = await response.text();
        console.error(`Error details: ${errorText}`);
      } catch (error) {
        console.error('Could not read error details:', error);
      }
    }
  } catch (error) {
    console.error('Proxy health test failed:', error);
  }
  
  // Test the proxy chat endpoint
  try {
    console.log('\n2. Testing proxy chat endpoint...');
    const response = await fetch('/api/proxy/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Hello, this is a proxy test',
        session_id: 'proxy-test-session'
      })
    });
    
    console.log(`Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`Response: ${JSON.stringify(data, null, 2)}`);
    } else {
      console.error(`Error: ${response.statusText}`);
      try {
        const errorText = await response.text();
        console.error(`Error details: ${errorText}`);
      } catch (error) {
        console.error('Could not read error details:', error);
      }
    }
  } catch (error) {
    console.error('Proxy chat test failed:', error);
  }
  
  console.log('\nProxy testing complete.');
}

// Make the function available in the browser console
if (typeof window !== 'undefined') {
  window.testProxy = testProxy;
  console.log('Run window.testProxy() to test the FastAPI proxy');
}

export { testProxy };
