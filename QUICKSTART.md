# JinBo Chatbot - Quick Start Guide

Get your AI chatbot running in 5 minutes! ⚡

## 🚀 Installation

### Option 1: Automated Setup (Recommended)

```bash
# Make setup script executable
chmod +x setup.sh

# Run setup
./setup.sh

# Start the bot
npm start
```

### Option 2: Manual Setup

```bash
# Install dependencies
npm install

# Start the server
npm start
```

## 📂 Required Files

Ensure you have these files in your project root:

```
jinbo-chatbot/
├── server.js              ← Main server file
├── knowledge-base.json    ← Your knowledge base
├── package.json           ← Dependencies
├── public/
│   └── index.html        ← Chat UI
└── README.md
```

## ✅ Verify Installation

### 1. Check if server is running

Open your browser and visit:
```
http://localhost:3000
```

You should see the chat interface! 🎉

### 2. Test the health endpoint

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "healthy",
  "message": "JinBo is up and running!",
  "timestamp": "2024-12-30T10:30:00.000Z",
  "version": "1.0.0"
}
```

### 3. Test the chat API

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'
```

Expected response:
```json
{
  "response": "Hey! I'm JinBo, Prateesh's AI assistant...",
  "intent": "greeting",
  "timestamp": "2024-12-30T10:30:00.000Z"
}
```

### 4. Run automated tests

```bash
npm test
```

You should see all tests passing! ✓

## 🎯 Usage Examples

### Try these questions in the chat UI:

1. "Hello" → Get a greeting
2. "What is Prateesh's tech stack?" → See his skills
3. "Tell me about his projects" → View his work
4. "Show me the Go project" → Learn about the Event Ingestor
5. "How can I contact him?" → Get contact info
6. "Is he looking for a job?" → Check availability

## 🔧 Configuration

### Change Port

Edit `.env` file or set environment variable:

```bash
PORT=5000 npm start
```

### Update Knowledge Base

1. Open `knowledge-base.json`
2. Edit the content
3. Save the file
4. Restart the server: `Ctrl+C` then `npm start`

That's it! The bot automatically reloads the knowledge base.

## 🌐 Deploy to Production

### Quick Deploy to Render (Free):

1. Push your code to GitHub
2. Go to [render.com](https://render.com)
3. Create New Web Service
4. Connect your repository
5. Use these settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
6. Click Deploy

Your bot will be live at: `https://your-app.onrender.com` 🎉

**Detailed deployment guides:** See `DEPLOYMENT.md`

## 📱 Integrate with Your Portfolio

### Angular

```typescript
// chatbot.service.ts
import { HttpClient } from '@angular/common/http';

export class ChatbotService {
  private apiUrl = 'https://your-bot.onrender.com/api/chat';
  
  sendMessage(message: string) {
    return this.http.post(this.apiUrl, { message });
  }
}
```

### React

```jsx
const sendMessage = async (message) => {
  const response = await fetch('https://your-bot.onrender.com/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });
  return await response.json();
};
```

### Plain JavaScript

```javascript
async function chat(message) {
  const response = await fetch('https://your-bot.onrender.com/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });
  const data = await response.json();
  return data.response;
}
```

## 🐛 Troubleshooting

### Server won't start

**Check if port is already in use:**
```bash
# Linux/Mac
lsof -i :3000

# Windows
netstat -ano | findstr :3000
```

**Kill the process or use a different port:**
```bash
PORT=3001 npm start
```

### "Cannot find module" error

```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Knowledge base not loading

**Verify JSON is valid:**
```bash
# Linux/Mac
cat knowledge-base.json | python -m json.tool

# Or use online validator
# https://jsonlint.com/
```

### Bot gives wrong answers

1. Check intent detection in `server.js`
2. Add more keywords to match patterns
3. Update responses in `knowledge-base.json`

## 📊 Performance Tips

### For Production:

1. **Enable compression:**
```bash
npm install compression
```

Add to `server.js`:
```javascript
const compression = require('compression');
app.use(compression());
```

2. **Add rate limiting:**
```bash
npm install express-rate-limit
```

Add to `server.js`:
```javascript
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);
```

3. **Add logging:**
```bash
npm install morgan
```

Add to `server.js`:
```javascript
const morgan = require('morgan');
app.use(morgan('combined'));
```

## 📈 Monitoring

### Keep your bot alive (Render free tier):

```bash
# Use a service like UptimeRobot or cron-job.org
# to ping your health endpoint every 10 minutes
curl https://your-bot.onrender.com/health
```

### Check logs:

```bash
# View server logs
npm start

# Or on Render/Heroku
# Check the platform's log viewer
```

## 🎓 Learn More

- **Full Documentation:** `README.md`
- **Deployment Guide:** `DEPLOYMENT.md`
- **API Reference:** See README.md API section
- **Knowledge Base Format:** See `knowledge-base.json`

## 💡 Tips

1. **Test locally first** before deploying
2. **Keep knowledge base under 1MB** for fast loading
3. **Use clear, simple patterns** for intent detection
4. **Add multiple response variants** to avoid repetition
5. **Monitor the health endpoint** to catch issues early

## 🆘 Need Help?

1. Check the error message carefully
2. Review the README.md troubleshooting section
3. Test the API endpoints directly with curl
4. Check server logs for detailed errors
5. Verify your knowledge-base.json is valid JSON

## 🎉 Success!

If you can:
- ✅ Access http://localhost:3000
- ✅ Send a message and get a response
- ✅ See "healthy" status on /health

**You're all set!** 🚀

Now customize the knowledge base and deploy to production!

---

**Happy Coding!** 💻✨

*For more details, see the full README.md and DEPLOYMENT.md guides.*