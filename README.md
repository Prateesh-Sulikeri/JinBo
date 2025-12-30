# JinBo - AI Portfolio Chatbot

A self-hosted AI chatbot assistant for Prateesh Sulikeri's portfolio. Built with Express.js and intent-based NLP for accurate, hallucination-free responses.

## 🌟 Features

- **Intent-Based Response System**: Uses keyword matching and pattern recognition instead of generative AI to prevent hallucinations
- **Knowledge Base Driven**: All responses come from a structured JSON knowledge base
- **Self-Hosted**: Complete control over your data and deployment
- **RESTful API**: Easy integration with any frontend
- **Beautiful Chat UI**: Modern, responsive chat interface included
- **Health Monitoring**: Built-in health check endpoint
- **Read-Only KB**: Bot cannot modify the knowledge base
- **Free to Host**: Works on free tiers of Render, Heroku, Railway, etc.

## 📁 Project Structure

```
jinbo-chatbot/
├── server.js              # Main Express server
├── knowledge-base.json    # Knowledge base (easily updatable)
├── package.json           # Dependencies
├── public/
│   └── index.html        # Chat UI
├── README.md             # This file
├── .gitignore
└── .env.example
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Locally

```bash
npm start
```

The bot will be available at:
- Chat UI: http://localhost:3000
- Health Check: http://localhost:3000/health
- API Endpoint: http://localhost:3000/api/chat

### 3. Development Mode (with auto-reload)

```bash
npm run dev
```

## 📡 API Endpoints

### POST /api/chat
Send a message to the chatbot.

**Request:**
```json
{
  "message": "What is Prateesh's tech stack?"
}
```

**Response:**
```json
{
  "response": "Prateesh works primarily with Go, C++, Java (Spring Boot)...",
  "intent": "tech_stack",
  "timestamp": "2024-12-30T10:30:00.000Z"
}
```

### GET /health
Check bot health status.

**Response:**
```json
{
  "status": "healthy",
  "message": "JinBo is up and running!",
  "timestamp": "2024-12-30T10:30:00.000Z",
  "version": "1.0.0"
}
```

### GET /api/kb-info
Get knowledge base summary (read-only).

**Response:**
```json
{
  "name": "Prateesh Sulikeri",
  "title": "Software Engineer",
  "location": "Pune, India",
  "experience": "2+",
  "primaryTech": ["Go", "C++", "Java (Spring Boot)", "AWS", "Python"],
  "availableIntents": 30
}
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file (optional):

```env
PORT=3000
NODE_ENV=production
```

### Updating Knowledge Base

Simply edit `knowledge-base.json` and restart the server. The bot will automatically load the new data.

**Important:** The bot is read-only - it cannot modify the knowledge base file.

## 🌐 Deployment

### Deploy to Render (Free)

1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Use these settings:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Deploy!

Your API will be available at: `https://your-app.onrender.com`

### Deploy to Heroku

```bash
heroku create your-app-name
git push heroku main
```

### Deploy to Railway

1. Connect your GitHub repo to [Railway](https://railway.app)
2. Railway will auto-detect the Node.js app
3. Deploy!

## 🔌 Integration Example

### Angular Service

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private readonly apiUrl = 'https://jinbo.onrender.com/api/chat';
  private readonly healthUrl = 'https://jinbo.onrender.com/health';

  constructor(private http: HttpClient) {}

  sendMessage(message: string): Observable<any> {
    return this.http.post(this.apiUrl, { message });
  }

  checkHealth(): Observable<any> {
    return this.http.get(this.healthUrl);
  }
}
```

### JavaScript/Fetch

```javascript
async function sendMessage(message) {
  const response = await fetch('https://jinbo.onrender.com/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message })
  });
  
  const data = await response.json();
  console.log(data.response);
}
```

## 🎯 How It Works

1. **Intent Detection**: User message is analyzed using keyword matching and regex patterns
2. **Response Selection**: Matched intent is used to select appropriate response from knowledge base
3. **Randomization**: Multiple response variants prevent repetitive answers
4. **Fallback**: Unknown intents trigger contextual fallback responses
5. **No Hallucination**: Bot only responds with pre-defined knowledge base content

## 🛡️ Security Features

- Input validation (max 500 characters)
- CORS enabled for cross-origin requests
- No database required (stateless)
- Read-only knowledge base
- Rate limiting ready (add middleware if needed)

## 📊 Supported Intents

- Greetings
- About Bot/Creator
- Tech Stack
- Projects (including Go Event Ingestor)
- Job Opportunities
- Contact Information
- Resume/CV
- Location & Timezone
- Education & Background
- Resources & Learning
- Freelance & Collaboration
- And more...

## 🔄 Updating the Bot

### Add New Intent

1. Open `knowledge-base.json`
2. Add your response to the `responses` object:

```json
"new_intent": [
  "Response variant 1",
  "Response variant 2"
]
```

3. Open `server.js`
4. Add pattern matching in `detectIntent()` function:

```javascript
if (/your.*pattern|keywords/.test(msg)) {
  return 'new_intent';
}
```

5. Restart the server

### Update Existing Content

Just edit the values in `knowledge-base.json` and restart!

## 🐛 Troubleshooting

### Bot not responding
- Check if server is running: `curl http://localhost:3000/health`
- Verify knowledge-base.json is valid JSON
- Check server logs for errors

### "Cannot find module" error
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then reinstall

### Deployment issues
- Ensure `PORT` environment variable is set correctly
- Check that all files are committed to git
- Verify build and start commands in platform settings

## 📝 License

MIT License - feel free to use this for your own portfolio!

## 👨‍💻 Author

**Prateesh Sulikeri**
- Portfolio: https://prateesh-sulikeri-portfolio.vercel.app/
- GitHub: https://github.com/Prateesh-Sulikeri
- LinkedIn: https://linkedin.com/in/prateesh-sulikeri

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

---

**Note:** This bot uses intent-based pattern matching, not generative AI, ensuring accurate, hallucination-free responses based solely on your knowledge base.