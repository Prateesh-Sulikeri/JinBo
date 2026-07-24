# Deployment Guide

This guide covers how to deploy JinBo chatbot to various free hosting platforms.

## 📋 Pre-Deployment Checklist

- [ ] All dependencies listed in `package.json`
- [ ] `Prateesh_Master_Knowledge_Base_2026.json` is valid JSON
- [ ] Test bot locally with `npm start`
- [ ] Run tests with `npm test`
- [ ] `.gitignore` file in place
- [ ] README.md updated with your info
- [ ] Decide whether to set `GROQ_API_KEY` in production (optional - the bot is
      fully functional without it, just rule-based only)

## 🌐 Render (Recommended - Free Tier Available)

### Steps:

1. **Create Account**: Sign up at [render.com](https://render.com)

2. **New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

3. **Configure**:
   ```
   Name: jinbo-chatbot
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   ```

4. **Environment Variables** (Optional):
   ```
   NODE_ENV=production
   GROQ_API_KEY=your-free-groq-api-key
   GROQ_MODEL=llama-3.1-8b-instant
   RATE_LIMIT_MAX=20
   ```
   Get a free key at [console.groq.com/keys](https://console.groq.com/keys).
   Omitting `GROQ_API_KEY` is fine - the bot runs in rule-based-only mode.

5. **Deploy**: Click "Create Web Service"

6. **Your URLs**:
   ```
   Chat UI: https://jinbo-chatbot.onrender.com/
   API: https://jinbo-chatbot.onrender.com/api/chat
   Health: https://jinbo-chatbot.onrender.com/health
   ```

### Important Notes:
- Free tier spins down after 15 mins of inactivity
- First request after spin-down takes ~30 seconds
- Perfect for portfolio use!

---

## 🚂 Railway (Easy Alternative)

### Steps:

1. **Create Account**: Sign up at [railway.app](https://railway.app)

2. **New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Auto-Detection**:
   - Railway automatically detects Node.js
   - No configuration needed!

4. **Deploy**: Click "Deploy"

5. **Get URL**:
   - Go to "Settings" → "Networking"
   - Generate domain

### Important Notes:
- $5 free credit per month
- Doesn't sleep like Render
- Great for production use

---

## 🎨 Vercel (Frontend Focus)

### Steps:

1. **Create Account**: Sign up at [vercel.com](https://vercel.com)

2. **Import Project**:
   - Click "Add New" → "Project"
   - Import from GitHub

3. **Configure**:
   ```
   Framework Preset: Other
   Build Command: npm install
   Output Directory: public
   Install Command: npm install
   ```

4. **Environment Variables**:
   ```
   NODE_ENV=production
   GROQ_API_KEY=your-free-groq-api-key
   ```

5. **Deploy**: Click "Deploy"

### Important Notes:
- Best for serverless functions
- Excellent for static chat UI
- May need adjustments for Express.js

---

## 🔧 Heroku

### Steps:

1. **Install Heroku CLI**:
   ```bash
   npm install -g heroku
   ```

2. **Login**:
   ```bash
   heroku login
   ```

3. **Create App**:
   ```bash
   heroku create jinbo-chatbot
   ```

4. **Deploy**:
   ```bash
   git push heroku main
   ```

5. **Open App**:
   ```bash
   heroku open
   ```

### Important Notes:
- Free tier available (with credit card)
- Sleeps after 30 mins of inactivity
- Classic deployment option

---

## 🐳 Docker Deployment

### Create Dockerfile:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

### Create .dockerignore:

```
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
```

### Build and Run:

```bash
# Build image
docker build -t jinbo-chatbot .

# Run container
docker run -p 3000:3000 jinbo-chatbot
```

### Deploy to Docker Hub:

```bash
docker tag jinbo-chatbot yourusername/jinbo-chatbot
docker push yourusername/jinbo-chatbot
```

---

## 📱 Integration Examples

### Angular Component

```typescript
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-chatbot',
  template: `
    <div class="chatbot">
      <div *ngFor="let msg of messages">
        <p [class]="msg.isUser ? 'user' : 'bot'">{{ msg.text }}</p>
      </div>
      <input [(ngModel)]="userMessage" (keyup.enter)="sendMessage()">
      <button (click)="sendMessage()">Send</button>
    </div>
  `
})
export class ChatbotComponent {
  private apiUrl = 'https://jinbo-chatbot.onrender.com/api/chat';
  messages: any[] = [];
  userMessage = '';

  constructor(private http: HttpClient) {}

  sendMessage() {
    if (!this.userMessage.trim()) return;

    this.messages.push({ text: this.userMessage, isUser: true });
    
    this.http.post(this.apiUrl, { message: this.userMessage })
      .subscribe((response: any) => {
        this.messages.push({ text: response.response, isUser: false });
      });
    
    this.userMessage = '';
  }
}
```

### React Component

```jsx
import { useState } from 'react';

function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    if (!input.trim()) return;

    setMessages([...messages, { text: input, isUser: true }]);

    const response = await fetch('https://jinbo-chatbot.onrender.com/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input })
    });

    const data = await response.json();
    setMessages(prev => [...prev, { text: data.response, isUser: false }]);
    setInput('');
  };

  return (
    <div>
      {messages.map((msg, i) => (
        <p key={i} className={msg.isUser ? 'user' : 'bot'}>
          {msg.text}
        </p>
      ))}
      <input value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
```

---

## 🔍 Testing Deployment

After deployment, test these endpoints:

```bash
# Health check
curl https://your-app.com/health

# Chat API
curl -X POST https://your-app.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'

# KB Info
curl https://your-app.com/api/kb-info
```

---

## 🐛 Common Issues

### Issue: Bot not responding

**Solution:**
- Check server logs
- Verify `Prateesh_Master_Knowledge_Base_2026.json` is valid
- Test locally first

### Issue: CORS errors

**Solution:**
Add to `server.js`:
```javascript
app.use(cors({
  origin: 'https://your-frontend.com'
}));
```

### Issue: Port not binding

**Solution:**
Ensure you're using:
```javascript
const PORT = process.env.PORT || 3000;
```

### Issue: Knowledge base not found

**Solution:**
- Verify file is in root directory
- Check file name exactly: `Prateesh_Master_Knowledge_Base_2026.json`
- Ensure it's committed to git

### Issue: `source` is always `"rule-based"`, never `"ai"`

**Solution:**
- Confirm `GROQ_API_KEY` is set in the platform's environment variables (exact
  name, no typos/spaces)
- Check server logs for `[Groq] AI path failed, falling back to rule-based: ...`
  - a `429`/rate-limit message here is expected occasionally on the free tier
    and self-recovers after a short cooldown

---

## 📊 Monitoring

### Check Health Status

```javascript
// Simple uptime monitor
setInterval(async () => {
  const response = await fetch('https://your-app.com/health');
  const data = await response.json();
  console.log('Status:', data.status);
}, 300000); // Every 5 minutes
```

### Log Aggregation

For production, consider:
- Papertrail
- Loggly
- Sentry (for errors)

---

## 🔒 Security Considerations

1. **Rate Limiting**: Already implemented on `/api/chat` (default 20 req/min/IP,
   configurable via `RATE_LIMIT_MAX`/`RATE_LIMIT_WINDOW_MS`) - protects the
   shared free Groq quota from being drained

2. **Prompt-Injection Guardrails**: Known injection phrasing (e.g. "ignore
   previous instructions", "reveal your system prompt") is intercepted in code
   before it ever reaches Groq, in addition to instructions in the system
   prompt itself

3. **Helmet.js**: Security headers - not yet added, consider for production
   ```bash
   npm install helmet
   ```

4. **Input Validation**: Already implemented (500 char limit)

5. **CORS**: Currently wide open (`app.use(cors())`) - configure for your
   domain only if this isn't meant to be a publicly embeddable widget

---

## 📈 Scaling

For high traffic, consider:

1. **Add Caching**: Redis for frequent queries
2. **Load Balancing**: Multiple instances
3. **CDN**: Cloudflare for static assets
4. **Database**: PostgreSQL for analytics

---

## ✅ Post-Deployment Checklist

- [ ] Health endpoint returns 200
- [ ] Chat API responds correctly
- [ ] UI loads and sends messages
- [ ] Test on mobile devices
- [ ] Monitor first 24 hours
- [ ] Set up uptime monitoring
- [ ] Share link with friends!

---

## 🆘 Need Help?

- Check server logs first
- Test locally to isolate issue
- Review error messages carefully
- Check platform-specific documentation

## 📞 Support

For issues specific to JinBo:
- Create an issue on GitHub
- Check README.md for troubleshooting

Good luck with your deployment! 🚀