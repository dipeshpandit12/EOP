// Simple script to test backend connection
async function testBackendConnection() {
  // Use environment variable or fallback to the ngrok URL
  const FASTAPI_URL = process.env.FASTAPI_BASE_URL || 'https://holy-crab-known.ngrok-free.app'
  
  console.log('Testing FastAPI backend connection...')
  console.log(`Using FastAPI URL: ${FASTAPI_URL}`)
  
  try {
    // Test health endpoint
    console.log('\n1. Testing /health endpoint...')
    const healthResponse = await fetch(`${FASTAPI_URL}/health`)
    console.log(`Health Status: ${healthResponse.status}`)
    if (healthResponse.ok) {
      const healthData = await healthResponse.text()
      console.log(`Health Response: ${healthData}`)
    }
  } catch (error) {
    console.error('Health endpoint failed:', error.message)
  }
  
  try {
    // Test proposals endpoint
    console.log('\n2. Testing /proposals endpoint...')
    const proposalsResponse = await fetch(`${FASTAPI_URL}/proposals`)
    console.log(`Proposals Status: ${proposalsResponse.status}`)
    if (proposalsResponse.ok) {
      const proposalsData = await proposalsResponse.json()
      console.log(`Proposals Response: ${JSON.stringify(proposalsData, null, 2)}`)
    }
  } catch (error) {
    console.error('Proposals endpoint failed:', error.message)
  }
  
  try {
    // Test chat endpoint
    console.log('\n3. Testing /chat endpoint...')
    const chatResponse = await fetch(`${FASTAPI_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Hello, test message',
        session_id: 'test-session',
        proposal_id: 'test-proposal'
      })
    })
    console.log(`Chat Status: ${chatResponse.status}`)
    if (chatResponse.ok) {
      const chatData = await chatResponse.json()
      console.log(`Chat Response: ${JSON.stringify(chatData, null, 2)}`)
    }
  } catch (error) {
    console.error('Chat endpoint failed:', error.message)
  }
  
  try {
    // Test docs endpoint
    console.log('\n4. Testing /docs endpoint...')
    const docsResponse = await fetch(`${FASTAPI_URL}/docs`)
    console.log(`Docs Status: ${docsResponse.status}`)
  } catch (error) {
    console.error('Docs endpoint failed:', error.message)
  }
}

// Run the test
testBackendConnection().catch(console.error)
