const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Load knowledge base
let knowledgeBase;
try {
    const kbPath = path.join(__dirname, 'knowledge-base.json');
    knowledgeBase = JSON.parse(fs.readFileSync(kbPath, 'utf8'));
    console.log('✅ Knowledge base loaded successfully');
} catch (error) {
    console.error('❌ Error loading knowledge base:', error);
    process.exit(1);
}

// Simple intent detection using keyword matching
function detectIntent(message) {
  const msg = message.toLowerCase().trim();

  // ============================================
  // TIER 1: GREETINGS & IDENTITY (Highest Priority)
  // ============================================
  
  // Greeting patterns - exact matches at start
  if (/^(hi|hello|hey|greetings|good morning|good afternoon|good evening|namaste|sup|yo)/.test(msg)) {
    return 'greeting';
  }

  // Bot identity
  if (/who (are|r) you|what (are|r) you|your name|about you|tell me about yourself/.test(msg)) {
    return 'about_bot';
  }

  // Quick facts/summary
  if (/quick.*fact|tell.*quick|tldr|summary|brief|short.*version|in.*nutshell/.test(msg)) {
    return 'quick_facts';
  }

  // ============================================
  // TIER 2: SPECIFIC SOCIAL MEDIA (Before Contact)
  // ============================================
  
  // GitHub
  if (/github|git hub/.test(msg)) {
    return 'social_github';
  }

  // LinkedIn
  if (/linkedin|linked in/.test(msg)) {
    return 'social_linkedin';
  }

  // LeetCode
  if (/leetcode|leet code/.test(msg)) {
    return 'social_leetcode';
  }

  // All social media links
  if (/social|socials|social media|social links|all.*links/.test(msg)) {
    return 'social_media';
  }

  // ============================================
  // TIER 3: SPECIFIC CONTACT METHODS (Before General)
  // ============================================
  
  // Email only
  if (/^email$|email.*address|his email|what.*email/.test(msg)) {
    return 'email';
  }

  // Phone only
  if (/^phone$|phone.*number|his phone|what.*phone|call|mobile/.test(msg)) {
    return 'phone';
  }

  // Portfolio/Website
  if (/portfolio|website|site|web.*page/.test(msg) && !/build.*portfolio|create.*portfolio/.test(msg)) {
    return 'portfolio';
  }

  // General contact info (AFTER specific methods)
  if (/contact|reach|get in touch|talk to|message|reach out|how.*contact/.test(msg)) {
    return 'contact';
  }

  // ============================================
  // TIER 4: AVAILABILITY & HIRING
  // ============================================
  
  // Hiring/Availability
  if (/hire|hiring|recruit|available.*hire|looking.*hire|can i hire/.test(msg)) {
    return 'hire';
  }

  // Job seeking
  if (/job|looking for|opportunities|position|role|employment/.test(msg) && /seeking|looking|available|open/.test(msg)) {
    return 'job_seeking';
  }

  // Freelance
  if (/freelance|contract/.test(msg) && !/hire/.test(msg)) {
    return 'freelance';
  }

  // ============================================
  // TIER 5: ABOUT PRATEESH
  // ============================================
  
  // Creator info
  if (/who is prateesh|tell me about prateesh|about prateesh|who made|who created/.test(msg)) {
    return 'about_creator';
  }

  // Background/Journey
  if (/background|journey|story|how.*started|become.*developer/.test(msg)) {
    return 'background';
  }

  // Personal info (age, gender, etc.)
  if (/age|old|gender|pronouns/.test(msg)) {
    return 'personal_info';
  }

  // Location
  if (/where.*live|location|based|city|country|timezone/.test(msg)) {
    return 'location';
  }

  // ============================================
  // TIER 6: TECHNICAL SKILLS & STACK
  // ============================================
  
  // Specialization (specific)
  if (/speciali[sz]ation|preferred.*stack|favorite.*stack|go.*angular|what.*stack.*prefer|tech.*speciali[sz]e/.test(msg)) {
    return 'specialization';
  }

  // Preferred tech
  if (/preferred.*tech|favorite.*tech|best.*stack|ideal.*stack/.test(msg)) {
    return 'preferred_tech';
  }

  // Skills/Expertise
  if (/what.*can.*do|capabilities|expertise|proficient|good at/.test(msg) && !/project/.test(msg)) {
    return 'skills';
  }

  // General tech stack
  if (/tech stack|technology|technologies|programming languages|what does.*know|technical skills/.test(msg)) {
    return 'tech_stack';
  }

  // Favorite frameworks
  if (/favorite|favourite|prefer|like.*framework|like.*library/.test(msg)) {
    return 'favorite_frameworks';
  }

  // ============================================
  // TIER 7: PROJECTS
  // ============================================
  
  // Go project (specific)
  if (/go.*project|event.*ingestor|go.*event|rate.*limit|gin.*project/.test(msg)) {
    return 'go_project';
  }

  // General projects
  if (/projects|work|built|repos|repositories/.test(msg) && !/portfolio/.test(msg)) {
    return 'projects';
  }

  // Portfolio tech stack
  if (/portfolio.*built|portfolio.*tech|portfolio.*made|how.*portfolio|what.*portfolio/.test(msg)) {
    return 'portfolio_tech';
  }

  // Source code
  if (/source code|code.*portfolio|portfolio.*code|repo/.test(msg)) {
    return 'source_code';
  }

  // ============================================
  // TIER 8: EDUCATION & EXPERIENCE
  // ============================================
  
  // Education (general)
  if (/education|study|studied/.test(msg) && !/college|university|degree/.test(msg)) {
    return 'education';
  }

  // College specific
  if (/college|university/.test(msg)) {
    return 'college';
  }

  // Degree specific
  if (/degree|qualification/.test(msg)) {
    return 'degree';
  }

  // Schooling
  if (/school|10th|12th|sslc/.test(msg)) {
    return 'schooling';
  }

  // Experience
  if (/experience|years.*experience|how long|worked/.test(msg)) {
    return 'experience_domains';
  }

  // ============================================
  // TIER 9: RESOURCES & LEARNING
  // ============================================
  
  // Resume/CV
  if (/resume|cv|curriculum vitae/.test(msg)) {
    return 'resume';
  }

  // Learning first language
  if (/first.*language|start.*programming|learn.*code|beginner.*language/.test(msg)) {
    return 'learning_first_language';
  }

  // Resources
  if (/resources|tutorial|course|recommend.*learn|where.*learn/.test(msg)) {
    return 'resources';
  }

  // Mentoring
  if (/mentor|mentoring|teach|guidance/.test(msg)) {
    return 'mentoring';
  }

  // ============================================
  // TIER 10: COLLABORATION & SERVICES
  // ============================================
  
  // Build portfolio (help with)
  if (/build.*portfolio|make.*portfolio|create.*portfolio|portfolio.*guide/.test(msg)) {
    return 'build_portfolio';
  }

  // Collaboration
  if (/collaborate|collaboration|work together|partner/.test(msg)) {
    return 'collaboration';
  }

  // Pricing
  if (/price|cost|rate|charge|fee|budget/.test(msg)) {
    return 'pricing';
  }

  // Open source
  if (/open source|contribute|contribution/.test(msg)) {
    return 'open_source';
  }

  // ============================================
  // TIER 11: SAFETY & INAPPROPRIATE (Low Priority)
  // ============================================
  
  // Inappropriate requests
  if (/hack|crack|pirate|illegal|cheat|steal/.test(msg) ||
      /dating|date|relationship|girlfriend|boyfriend/.test(msg) ||
      /api.*key|password|credential/.test(msg)) {
    return 'inappropriate';
  }

  // Homework
  if (/homework|assignment|exam|test.*help|solve.*problem/.test(msg)) {
    return 'homework';
  }

  // ============================================
  // FALLBACK
  // ============================================
  
  return 'default';
}
// Get random response from array
function getRandomResponse(responses) {
    if (!Array.isArray(responses)) return responses;
    return responses[Math.floor(Math.random() * responses.length)];
}

// Generate contextual response
function generateResponse(message, intent) {
    const responses = knowledgeBase.responses;

    // Check if intent exists in responses
    if (responses[intent]) {
        return getRandomResponse(responses[intent]);
    }

    // Context-aware fallback
    const msg = message.toLowerCase();

    // Check for specific keywords that might need special handling
    if (msg.includes('linkedin') || msg.includes('github') || msg.includes('leetcode')) {
        return getRandomResponse(responses.contact);
    }

    if (msg.includes('angular') || msg.includes('spring') || msg.includes('java') || msg.includes('golang')) {
        return getRandomResponse(responses.tech_stack);
    }

    if (msg.includes('pune') || msg.includes('india')) {
        return getRandomResponse(responses.location);
    }

    // Default fallback
    return responses.fallback;
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        message: 'JinBo is up and running!',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Chat endpoint
app.post('/api/chat', (req, res) => {
    try {
        const { message } = req.body;

        // Better validation
        if (!message) {
            return res.status(400).json({
                error: 'Message is required',
                response: 'Oops! Looks like your message was empty. Try asking me something about Prateesh!'
            });
        }

        if (typeof message !== 'string') {
            return res.status(400).json({
                error: 'Message must be a string',
                response: 'Sorry, I can only process text messages. Please try again!'
            });
        }

        const trimmedMessage = message.trim();

        if (trimmedMessage.length === 0) {
            return res.status(400).json({
                error: 'Message cannot be empty',
                response: 'Your message seems to be empty. Ask me about Prateesh\'s skills, projects, or how to contact him!'
            });
        }

        if (trimmedMessage.length > 500) {
            return res.status(400).json({
                error: 'Message too long (max 500 characters)',
                response: 'That\'s a long message! Please keep it under 500 characters so I can help you better. 😊'
            });
        }

        // Detect intent and generate response
        const intent = detectIntent(trimmedMessage);
        const response = generateResponse(trimmedMessage, intent);

        // Log for monitoring
        console.log(`[${new Date().toISOString()}] Intent: ${intent} | Message: "${trimmedMessage.substring(0, 50)}${trimmedMessage.length > 50 ? '...' : ''}"`);

        res.json({
            response,
            intent,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error processing chat:', error);
        res.status(500).json({
            error: 'Internal server error',
            response: knowledgeBase.responses.fallback
        });
    }
});

// Knowledge base info endpoint (read-only)
app.get('/api/kb-info', (req, res) => {
    res.json({
        name: knowledgeBase.personal.name,
        title: knowledgeBase.personal.title,
        location: knowledgeBase.personal.location,
        experience: knowledgeBase.personal.experience_years,
        primaryTech: knowledgeBase.personal.tech_stack.primary,
        availableIntents: Object.keys(knowledgeBase.responses).length
    });
});

// Serve chat UI
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        availableEndpoints: [
            'GET /health',
            'POST /api/chat',
            'GET /api/kb-info',
            'GET /'
        ]
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║      JinBo AI Chatbot Server          ║
║                                        ║
║  🤖 Status: Running                   ║
║  🌐 Port: ${PORT}                        ║
║  📚 KB Loaded: ✅                      ║
║  🔗 Health: http://localhost:${PORT}/health
║  💬 Chat UI: http://localhost:${PORT}/     
║                                        ║
╚════════════════════════════════════════╝
  `);
});