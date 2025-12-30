# JinBo API Documentation

Complete API reference for integrating JinBo chatbot into your applications.

## Base URL

```
Local: http://localhost:3000
Production: https://your-app.onrender.com
```

## Authentication

No authentication required. The API is publicly accessible.

## Rate Limiting

- **Development:** No rate limiting
- **Production:** Recommended to implement rate limiting (see README.md)

---

## Endpoints

### 1. Health Check

Check if the bot server is running and healthy.

**Endpoint:** `GET /health`

**Request:**
```bash
curl http://localhost:3000/health
```

**Response:** `200 OK`
```json
{
  "status": "healthy",
  "message": "JinBo is up and running!",
  "timestamp": "2024-12-30T10:30:00.000Z",
  "version": "1.0.0"
}
```

**Response Fields:**
- `status` (string): Health status - always "healthy" if server is running
- `message` (string): Confirmation message
- `timestamp` (string): ISO 8601 timestamp of the response
- `version` (string): Bot version number

**Status Codes:**
- `200 OK`: Server is healthy
- `500 Internal Server Error`: Server has issues

**Use Cases:**
- Uptime monitoring
- Health checks before sending messages
- Integration testing
- Load balancer health checks

---

### 2. Send Chat Message

Send a message to the bot and receive an AI-generated response.

**Endpoint:** `POST /api/chat`

**Request:**
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is Prateesh'\''s tech stack?"
  }'
```

**Request Body:**
```json
{
  "message": "What is Prateesh's tech stack?"
}
```

**Request Fields:**
- `message` (string, required): User's question or message
  - Min length: 1 character
  - Max length: 500 characters
  - Type: string
  - Trimmed automatically

**Response:** `200 OK`
```json
{
  "response": "Prateesh works primarily with Go, C++, Java (Spring Boot), AWS, Python, and Shell scripting. He's also experienced in Angular, TypeScript, Node.js, React, and ML/AI tools like TensorFlow, PyTorch, Langchain, and RAG. His database experience includes PostgreSQL, Redis, IBM DB2, and DynamoDB!",
  "intent": "tech_stack",
  "timestamp": "2024-12-30T10:30:00.000Z"
}
```

**Response Fields:**
- `response` (string): Bot's response to the user's message
- `intent` (string): Detected intent/category of the user's message
- `timestamp` (string): ISO 8601 timestamp of the response

**Status Codes:**
- `200 OK`: Message processed successfully
- `400 Bad Request`: Invalid request (missing message, empty message, or too long)
- `500 Internal Server Error`: Server error processing the message

**Error Response:** `400 Bad Request`
```json
{
  "error": "Invalid request. Please provide a message."
}
```

**Error Response:** `500 Internal Server Error`
```json
{
  "error": "Something went wrong processing your message. Please try again.",
  "response": "I searched through what I know, but couldn't find a good answer..."
}
```

---

### 3. Knowledge Base Info

Get summary information about the bot's knowledge base (read-only).

**Endpoint:** `GET /api/kb-info`

**Request:**
```bash
curl http://localhost:3000/api/kb-info
```

**Response:** `200 OK`
```json
{
  "name": "Prateesh Sulikeri",
  "title": "Software Engineer",
  "location": "Pune, India",
  "experience": "2+",
  "primaryTech": [
    "Go",
    "C++",
    "Java (Spring Boot)",
    "AWS",
    "Python",
    "Shell Scripting"
  ],
  "availableIntents": 30
}
```

**Response Fields:**
- `name` (string): Person's full name
- `title` (string): Professional title
- `location` (string): Current location
- `experience` (string): Years of experience
- `primaryTech` (array): List of primary technologies
- `availableIntents` (number): Number of intents the bot can handle

**Status Codes:**
- `200 OK`: Information retrieved successfully
- `500 Internal Server Error`: Error accessing knowledge base

**Use Cases:**
- Display bot capabilities
- Show quick facts
- Verify knowledge base is loaded
- Integration testing

---

### 4. Chat UI

Access the built-in chat interface.

**Endpoint:** `GET /`

**Request:**
```bash
# Open in browser
http://localhost:3000
```

**Response:** `200 OK`
- Returns HTML page with chat interface

**Features:**
- Modern, responsive design
- Real-time messaging
- Quick action buttons
- Typing indicators
- Mobile-friendly

---

## Intent Types

The bot can detect and respond to these intents:

| Intent | Description | Example Query |
|--------|-------------|---------------|
| `greeting` | Welcome messages | "Hello", "Hi", "Hey" |
| `about_bot` | Information about JinBo | "Who are you?", "What are you?" |
| `about_creator` | Information about Prateesh | "Who is Prateesh?", "Tell me about him" |
| `tech_stack` | Technical skills | "What technologies does he know?" |
| `projects` | Portfolio projects | "Show me his projects" |
| `go_project` | Go Event Ingestor project | "Tell me about the Go project" |
| `job_seeking` | Job opportunities | "Is he looking for a job?" |
| `resume` | Resume/CV information | "Where can I get his resume?" |
| `location` | Geographic location | "Where does he live?" |
| `contact` | Contact information | "How can I contact him?" |
| `education` | Educational background | "What is his education?" |
| `experience_domains` | Work experience | "How many years of experience?" |
| `freelance` | Freelance availability | "Does he do freelance work?" |
| `resources` | Learning resources | "What resources do you recommend?" |
| `default` | Fallback for unknown queries | Any unrecognized message |

---

## Code Examples

### JavaScript (Fetch API)

```javascript
async function sendMessage(message) {
  try {
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Bot:', data.response);
    console.log('Intent:', data.intent);
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Usage
sendMessage('What is his tech stack?');
```

### TypeScript (Angular)

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

interface ChatResponse {
  response: string;
  intent: string;
  timestamp: string;
}

interface HealthResponse {
  status: string;
  message: string;
  timestamp: string;
  version: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private readonly apiUrl = 'http://localhost:3000/api/chat';
  private readonly healthUrl = 'http://localhost:3000/health';

  constructor(private http: HttpClient) {}

  sendMessage(message: string): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(this.apiUrl, { message })
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  checkHealth(): Observable<HealthResponse> {
    return this.http.get<HealthResponse>(this.healthUrl)
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
```

### Python (Requests)

```python
import requests
import json

class JinBoChatbot:
    def __init__(self, base_url='http://localhost:3000'):
        self.base_url = base_url
        self.chat_url = f'{base_url}/api/chat'
        self.health_url = f'{base_url}/health'
    
    def send_message(self, message):
        """Send a message to the chatbot"""
        try:
            response = requests.post(
                self.chat_url,
                json={'message': message},
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f'Error: {e}')
            return None
    
    def check_health(self):
        """Check bot health"""
        try:
            response = requests.get(self.health_url, timeout=5)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f'Error: {e}')
            return None

# Usage
bot = JinBoChatbot()
health = bot.check_health()
print(f'Health: {health}')

result = bot.send_message('What projects has he built?')
print(f'Response: {result["response"]}')
print(f'Intent: {result["intent"]}')
```

### React (Hooks)

```jsx
import { useState, useEffect } from 'react';

function useChatbot(apiUrl = 'http://localhost:3000/api/chat') {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = async (message) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      setMessages(prev => [
        ...prev,
        { text: message, isUser: true },
        { text: data.response, isUser: false, intent: data.intent }
      ]);

      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return { messages, loading, error, sendMessage };
}

// Component usage
function ChatComponent() {
  const { messages, loading, error, sendMessage } = useChatbot();
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(input);
      setInput('');
    }
  };

  return (
    <div>
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={msg.isUser ? 'user' : 'bot'}>
            {msg.text}
          </div>
        ))}
      </div>
      {loading && <div>Typing...</div>}
      {error && <div>Error: {error}</div>}
      <form onSubmit={handleSubmit}>
        <input 
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading}>Send</button>
      </form>
    </div>
  );
}
```

---

## Best Practices

### 1. Error Handling

Always implement proper error handling:

```javascript
try {
  const response = await fetch(apiUrl, options);
  
  if (!response.ok) {
    // Handle HTTP errors
    const error = await response.json();
    console.error('API Error:', error);
    return;
  }
  
  const data = await response.json();
  // Process data
} catch (error) {
  // Handle network errors
  console.error('Network Error:', error);
}
```

### 2. Input Validation

Validate user input before sending:

```javascript
function validateMessage(message) {
  if (!message || typeof message !== 'string') {
    throw new Error('Message must be a non-empty string');
  }
  
  const trimmed = message.trim();
  
  if (trimmed.length === 0) {
    throw new Error('Message cannot be empty');
  }
  
  if (trimmed.length > 500) {
    throw new Error('Message too long (max 500 characters)');
  }
  
  return trimmed;
}
```

### 3. Loading States

Show loading indicators during API calls:

```javascript
function ChatBot() {
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (msg) => {
    setIsLoading(true);
    try {
      const response = await fetch(apiUrl, { /*...*/ });
      // Process response
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && <LoadingSpinner />}
      {/* Rest of UI */}
    </>
  );
}
```

### 4. Retry Logic

Implement retry for failed requests:

```javascript
async function fetchWithRetry(url, options, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

### 5. Caching

Cache responses for frequent queries:

```javascript
const cache = new Map();

async function getCachedResponse(message) {
  if (cache.has(message)) {
    return cache.get(message);
  }
  
  const response = await sendMessage(message);
  cache.set(message, response);
  return response;
}
```

---

## WebSocket Support (Future Enhancement)

Currently, the API uses HTTP REST. For real-time features, consider implementing WebSocket:

```javascript
// Future implementation example
const ws = new WebSocket('ws://localhost:3000/ws');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Bot:', data.response);
};

ws.send(JSON.stringify({ message: 'Hello' }));
```

---

## Testing

### Health Check Test

```bash
#!/bin/bash
response=$(curl -s http://localhost:3000/health)
status=$(echo $response | jq -r '.status')

if [ "$status" == "healthy" ]; then
  echo "✓ Health check passed"
  exit 0
else
  echo "✗ Health check failed"
  exit 1
fi
```

### Integration Test

```javascript
// test-api.js
const assert = require('assert');

async function testAPI() {
  // Test health
  const health = await fetch('http://localhost:3000/health');
  assert.strictEqual(health.status, 200);
  
  // Test chat
  const chat = await fetch('http://localhost:3000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Hello' })
  });
  assert.strictEqual(chat.status, 200);
  
  const data = await chat.json();
  assert.ok(data.response);
  assert.ok(data.intent);
  
  console.log('✓ All tests passed');
}

testAPI().catch(console.error);
```

---

## Support

For API issues or questions:
- Check the error response message
- Review server logs
- Test with curl first
- Refer to README.md troubleshooting section

---

**API Version:** 1.0.0  
**Last Updated:** December 30, 2024