# JinBo - AI Portfolio Chatbot

A self-hosted AI chatbot assistant for Prateesh Sulikeri's portfolio. Built with Express.js, backed by Groq's free-tier Llama models for real generative responses, with a deterministic keyword-matching engine as an automatic fallback whenever the AI path is unavailable.

## 🌟 Features

- **Groq-Powered AI Responses**: Real generative answers grounded in the knowledge base (RAG-style system prompt) - free tier, no credit card required
- **Deterministic Fallback**: If no API key is set, the Groq call errors, or it times out, requests transparently degrade to a rule-based keyword-matching engine - the bot is never fully down
- **Knowledge Base Driven**: Both the AI and fallback paths are grounded in the same structured JSON knowledge base
- **Self-Hosted**: Complete control over your data and deployment
- **RESTful API**: Easy integration with any frontend
- **Beautiful Chat UI**: Modern, responsive chat interface included
- **Health Monitoring**: Built-in health check endpoint
- **Read-Only KB**: Bot cannot modify the knowledge base
- **Free to Host**: Works on free tiers of Render, Heroku, Railway, etc.

## 📁 Project Structure

```
jinbo-chatbot/
├── server.js                                  # Main Express server
├── Prateesh_Master_Knowledge_Base_2026.json   # Knowledge base (easily updatable)
├── package.json                                # Dependencies
├── public/
│   └── index.html                             # Chat UI
├── README.md                                   # This file
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
  "message": "What is Prateesh's tech stack?",
  "history": [
    { "role": "user", "content": "Hi" },
    { "role": "assistant", "content": "Hey! I'm JinBo..." }
  ]
}
```
`history` is optional - up to the last 6 turns are used to give the AI path light
conversational memory (the server itself is stateless). Malformed entries are
silently dropped rather than rejected.

**Response:**
```json
{
  "response": "Prateesh works primarily with Go, C++, Java (Spring Boot)...",
  "intent": "tech_stack",
  "source": "ai",
  "timestamp": "2024-12-30T10:30:00.000Z"
}
```
`source` is `"ai"` when Groq produced the answer, or `"rule-based"` when it fell
back to the deterministic engine (no API key configured, Groq errored, timed
out, or is in a post-rate-limit cooldown).

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
  "availableIntents": 47
}
```

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env` and fill in what you need - everything is optional,
and omitting `GROQ_API_KEY` runs the bot in rule-based-only mode with zero config:

```env
PORT=3000

# Groq API (free tier - https://console.groq.com/keys). Leave blank to run
# in rule-based-only mode with zero config.
GROQ_API_KEY=
GROQ_MODEL=llama-3.1-8b-instant
GROQ_TIMEOUT_MS=8000
MAX_HISTORY_MESSAGES=6

# Rate limiting for POST /api/chat
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=20
```

### Updating Knowledge Base

Simply edit `Prateesh_Master_Knowledge_Base_2026.json` and restart the server. The bot will automatically load the new data.

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

1. **Intent Detection**: User message is always analyzed using keyword matching and regex patterns (`detectIntent()`) - this happens regardless of which path answers, and is returned in the `intent` field for logging/consumers
2. **AI Path (primary, when configured)**: The message, a grounding system prompt built from the knowledge base, and recent conversation history are sent to Groq's Llama models for a real generative answer
3. **Rule-Based Fallback (automatic)**: If no `GROQ_API_KEY` is set, the Groq call errors, times out, or is in a post-rate-limit cooldown, the matched intent is used to pick a pre-written response variant from the knowledge base instead - the bot is never fully down
4. **Randomization**: Multiple response variants prevent repetitive fallback answers
5. **Grounded, Not Hallucinated**: The AI path's system prompt instructs it to only use facts from the knowledge base and say so when something isn't covered, rather than inventing details

## 🛡️ Security Features

- Input validation (max 500 characters)
- CORS enabled for cross-origin requests
- No database required (stateless)
- Read-only knowledge base
- Rate limiting on `/api/chat` (default 20 req/min/IP, configurable via `RATE_LIMIT_MAX`/`RATE_LIMIT_WINDOW_MS`) - protects the shared free Groq quota from being drained
- Prompt-injection guardrails: known injection phrasing (e.g. "ignore previous instructions", "reveal your system prompt") is intercepted in code before it ever reaches the AI, in addition to instructions in the system prompt itself

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

Both the AI system prompt and the rule-based fallback are built from the same
knowledge base file, so updating it improves both paths at once.

### Add New Intent (rule-based fallback)

1. Open `Prateesh_Master_Knowledge_Base_2026.json`
2. Add your response to the `historical_knowledge_base.responses` object:

```json
"new_intent": [
  "Response variant 1",
  "Response variant 2"
]
```

3. Open `server.js`
4. Add pattern matching in `detectIntent()` function, in the correct tier
   (see `CLAUDE.md` - tier ordering is load-bearing; a specific pattern placed
   after a broader one will never be reached):

```javascript
if (/your.*pattern|keywords/.test(msg)) {
  return 'new_intent';
}
```

5. Restart the server

### Update Existing Content

Edit the values in `Prateesh_Master_Knowledge_Base_2026.json` and restart - this
updates the AI's grounding facts and the fallback's canned responses together.

## 🐛 Troubleshooting

### Bot not responding
- Check if server is running: `curl http://localhost:3000/health`
- Verify `Prateesh_Master_Knowledge_Base_2026.json` is valid JSON
- Check server logs for errors

### AI responses aren't showing up (`source` is always `"rule-based"`)
- Confirm `GROQ_API_KEY` is set correctly in `.env` (exact variable name,
  no stray spaces) and restart the server
- Check server logs for `[Groq] AI path failed, falling back to rule-based: ...`
  warnings - this is expected occasionally under Groq's free-tier rate limits
  and self-recovers after a short cooldown

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

**Note:** This bot's primary path uses Groq's free-tier Llama models for real generative responses, grounded in a knowledge-base system prompt to minimize hallucination. If no API key is configured (or the AI path fails/times out/is rate-limited), it transparently falls back to deterministic keyword-based pattern matching against the same knowledge base.