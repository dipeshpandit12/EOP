# FastAPI Gemini Integration Troubleshooting

## The Problem
Your FastAPI backend is returning test responses instead of calling the Gemini API. The chatbot responses are always:
```
"Hello! I received your message: '[user input]'. I'm your Emergency Operations Plan assistant. This is a test response while we set up the full system."
```

## What to Check in Your FastAPI Code

### 1. **Environment Variables**
Make sure your FastAPI has access to the Gemini API key:

```bash
# In your .env file or environment
GOOGLE_API_KEY=your_actual_gemini_api_key_here
# or
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 2. **FastAPI Chat Endpoint Should Look Like This:**

```python
import os
import google.generativeai as genai
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

# Configure Gemini
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel('gemini-pro')

class ChatMessage(BaseModel):
    message: str
    session_id: str = None
    proposal_id: str = None
    timestamp: str = None

@app.post("/chat")
async def chat_endpoint(chat_data: ChatMessage):
    try:
        # This is what should happen - call Gemini API
        response = model.generate_content(
            f"""You are an Emergency Operations Plan assistant helping tribal nations create comprehensive emergency plans. 
            
            User message: {chat_data.message}
            
            Provide helpful, specific guidance for emergency planning."""
        )
        
        return {
            "response": response.text,
            "session_id": chat_data.session_id,
            "proposal_id": chat_data.proposal_id,
            "nextQuestion": "What specific hazards are you most concerned about in your area?"
        }
        
    except Exception as e:
        print(f"Gemini API Error: {e}")
        # This is probably what's happening now - fallback to test response
        return {
            "response": f"Hello! I received your message: '{chat_data.message}'. I'm your Emergency Operations Plan assistant. This is a test response while we set up the full system."
        }
```

### 3. **Common Issues:**

#### **Issue A: No API Key**
```python
# Check if API key is loaded
print(f"API Key loaded: {bool(os.getenv('GOOGLE_API_KEY'))}")
```

#### **Issue B: Wrong Import/Setup**
```python
# Make sure you have the right package installed
# pip install google-generativeai

import google.generativeai as genai
```

#### **Issue C: API Call Failing**
```python
# Add error logging to see what's happening
try:
    response = model.generate_content(prompt)
    print(f"Gemini response: {response.text}")
except Exception as e:
    print(f"Gemini failed: {e}")
    # Don't fall back to test response - raise the error
    raise HTTPException(status_code=500, detail=f"AI service error: {e}")
```

### 4. **How to Fix It:**

1. **Check your FastAPI `/chat` endpoint** - it's likely catching exceptions and returning test responses
2. **Verify the Gemini API key** is loaded in your environment
3. **Remove test/fallback responses** so errors are visible
4. **Add proper error handling** that shows what's going wrong

### 5. **Expected FastAPI Logs:**
When working correctly, you should see:
```
API Key loaded: True
Calling Gemini with: "user message here"
Gemini response: "detailed AI response here"
```

When broken, you might see:
```
API Key loaded: False
Gemini failed: API key not found
Falling back to test response
```

## Test Commands

### Test Gemini API Key Directly:
```python
import os
import google.generativeai as genai

# Test the API key
api_key = os.getenv("GOOGLE_API_KEY")
print(f"API Key: {api_key[:10]}..." if api_key else "No API key found")

if api_key:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-pro')
    response = model.generate_content("Hello, can you help with emergency planning?")
    print(f"Gemini works: {response.text}")
```

### Test FastAPI Endpoint:
```bash
curl -X POST "http://localhost:8000/chat" \
     -H "Content-Type: application/json" \
     -d '{"message": "Hello", "session_id": "test"}'
```

## Next Steps

1. **Click "🔍 Test Gemini" button** in the debug panel
2. **Check FastAPI console/logs** for error messages
3. **Verify API key configuration**
4. **Remove test response fallbacks** to see real errors
5. **Update the chat endpoint** to properly call Gemini API

The issue is 100% in your FastAPI code - the Next.js frontend is working perfectly!
