// server.js - Complete Working Version with All FAQ Responses
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: '*' }));
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

let KB = {};
try {
  KB = JSON.parse(fs.readFileSync(path.join(__dirname, 'knowledge-base.json'), 'utf8'));
  console.log('✅ Knowledge base loaded');
} catch (error) {
  console.error('❌ Failed to load knowledge base');
  process.exit(1);
}

let cache = { github: null, leetcode: null, medium: null, lastFetch: null };

// ===== COMPREHENSIVE INTENT PATTERNS =====
const INTENTS = {
  greeting: [/^(hi|hello|hey|hola|namaste|greetings|good morning|good evening|sup|yo|wassup)\b/i],
  
  about_bot: [
    /\b(who|what|tell me about|introduce) (is |are )?jinbo\b/i,
    /\bwho (are|r) (you|u)\b/i,
    /\bwhat (are|r) (you|u)\b/i,
    /\bjinbo\b/i,
    /\bhow does this chatbot work/i,
    /\bhow (was|is) this (chatbot |bot )?built/i,
    /\bdid you build this/i
  ],
  
  about_creator: [
    /\b(who|what|tell me about|introduce) (is )?prateesh\b/i,
    /\babout prateesh\b/i,
    /\bprateesh sulikeri\b/i,
    /\bwho (is )?he\b/i,
    /\byour background\b/i,
    /\bwhat'?s (your|his) background\b/i
  ],
  
  tech_stack: [
    /\b(what |show |tell me )?(are )?(his |your |the )?(technologies?|tech stack)\b/i,
    /\bwhat (technologies|tech) (do|does) (you|he|prateesh) (work with|use|know)\b/i,
    /\bdo you have experience with (aws|react|python|angular|node)/i,
    /\bexperience with (aws|react|python|angular|java|spring)/i
  ],
  
  skills: [
    /\b(what |show |tell me )?(are )?(his |your |the )?skills?\b/i,
    /\bwhat (can|does) (he|prateesh|you) (do|know)\b/i,
    /\b(his |your |the )?expertise\b/i,
    /\bprogramming languages?\b/i
  ],
  
  projects: [
    /\b(show|tell|what|list|see) .*(projects?|portfolio|work)\b/i,
    /\blatest projects?\b/i,
    /\bcan i see .* projects?\b/i,
    /\bwhat (did|has) (he|prateesh|you) (built?|created?|made?)\b/i
  ],
  
  github: [
    /\b(github|git hub|repositories|repos?)\b/i,
    /\b(show|what|tell) .* (github|code|repositories?)\b/i,
    /\bgithub (username|profile|stats?)\b/i,
    /\b(his |the )?(latest |recent )?(project|repo)\b/i,
    /\bcan i see (your|his) github/i
  ],
  
  leetcode: [
    /\b(leetcode|leet code|coding problems?|dsa|algorithms?)\b/i,
    /\bleetcode (stats?|profile|username)\b/i,
    /\bproblems? solved\b/i,
    /\b(problem solving|competitive programming|cp)\b/i
  ],
  
  blogs: [
    /\b(blog|medium|article|writing|post)s?\b/i,
    /\b(does he |do you )?write\b/i,
    /\blatest (blog|article|post)\b/i,
    /\bhow often .* (blog|post|write)\b/i,
    /\bcan i subscribe/i,
    /\b(where|can i) read .* (blog|article)/i
  ],
  
  linkedin: [
    /\blinkedin\b/i,
    /\bprofessional (profile|network)\b/i,
    /\bconnect (on )?linkedin\b/i
  ],
  
  contact: [
    /\b(contact|email|reach|get in touch|message)\b/i,
    /\bhow (to|can i) (contact|reach|message|get in touch)\b/i,
    /\bcan i contact (you|him) directly\b/i
  ],
  
  job_seeking: [
    /\b(looking for|open to|available for|seeking) (job|work|opportunities?)\b/i,
    /\b(hiring|hire|job opportunities?)\b/i,
    /\bare you (looking|open|available)/i,
    /\bwhat (kind|type) of roles?\b/i
  ],
  
  resume: [
    /\b(resume|cv|curriculum vitae)\b/i,
    /\bdownload .* resume\b/i,
    /\bcan i (see|get|download) .* (resume|cv)\b/i
  ],
  
  location: [
    /\b(location|where .* live|timezone|current location)\b/i,
    /\bwhat'?s .* (location|timezone)\b/i,
    /\bwhere (are you|is he) (based|located)\b/i
  ],
  
  portfolio_tech: [
    /\bwhat stack .* (use|used) .* (website|site|portfolio)\b/i,
    /\bhow .* (host|deploy) .* portfolio\b/i,
    /\btech behind .* (site|website|portfolio)\b/i,
    /\bwhat'?s the tech behind\b/i
  ],
  
  source_code: [
    /\b(is |the )?source code (public|available|open)\b/i,
    /\bcan i see .* (source |)code\b/i,
    /\bopen source\b/i
  ],
  
  favorite_frameworks: [
    /\bfavorite (framework|technology|tech|language)\b/i,
    /\bwhat'?s .* favorite\b/i,
    /\bpreferred (framework|stack)\b/i
  ],
  
  collaboration: [
    /\b(collaborate|work together|partnership|team up)\b/i,
    /\bcan i (collaborate|work) with\b/i,
    /\bjoin .* project\b/i,
    /\bcontribute to\b/i
  ],
  
  learning_first: [
    /\bwhich (language|programming language) .* (learn first|start with|begin)\b/i,
    /\bfirst (language|programming language)\b/i,
    /\bstart learning .* (programming|coding)\b/i
  ],
  
  build_portfolio: [
    /\bhow (can i|to|do i) build .* portfolio\b/i,
    /\bcreate .* portfolio\b/i,
    /\bmake .* portfolio like\b/i
  ],
  
  resources: [
    /\b(what |which |any )?resources .* recommend\b/i,
    /\brecommend .* (resources|courses|tutorials)\b/i,
    /\blearning resources\b/i,
    /\bwhere .* learn\b/i
  ],
  
  mentoring: [
    /\bdo you (mentor|teach)\b/i,
    /\bmentorship\b/i,
    /\bcan you (help|guide|teach) me\b/i,
    /\bhelp .* (debug|code)\b/i
  ],
  
  freelance: [
    /\b(freelance|hire|services)\b/i,
    /\bdo you take .* (freelance|projects?)\b/i,
    /\bwhat services\b/i,
    /\bavailable for (work|hire)\b/i
  ],
  
  experience: [
    /\bhow many years .* experience\b/i,
    /\byears of experience\b/i,
    /\bexperience with .* (web|ai|automation|apps?)\b/i,
    /\bdo you have experience\b/i
  ],
  
  pricing: [
    /\b(hourly rate|pricing|rates?|cost|how much)\b/i,
    /\bwhat .* (charge|cost)\b/i
  ],
  
  client_work: [
    /\bcan you show .* (client |)work\b/i,
    /\bclient (work|projects?)\b/i,
    /\bprofessional work\b/i
  ],
  
  why_developer: [
    /\bwhy .* (become|became) .* developer\b/i,
    /\bwhy (programming|coding|development)\b/i
  ],
  
  learning_journey: [
    /\bhow did you (start|begin|learn) .* (programming|coding)\b/i,
    /\blearning journey\b/i,
    /\bhow .* become .* developer\b/i
  ],
  
  open_source: [
    /\bopen source (contribution|repos?|projects?)\b/i,
    /\bcontribute to .* repos?\b/i,
    /\bmaintain .* packages?\b/i,
    /\bwhat license\b/i,
    /\bopen to (prs|pull requests)\b/i
  ],
  
  personal_info: [
    /\b(age|gender|pronouns?)\b/i,
    /\bhow old\b/i,
    /\bwhat'?s .* age\b/i
  ],
  
  inappropriate: [
    /\bhack .* for me\b/i,
    /\bdo .* homework\b/i,
    /\b(date|marry|girlfriend|boyfriend)\b/i,
    /\bapi key\b/i,
    /\bpassword\b/i,
    /\bbank (details|account)\b/i
  ]
};

// ===== CLASSIFY INTENT =====
function classifyIntent(message) {
  const msg = message.trim();
  
  for (const [intent, patterns] of Object.entries(INTENTS)) {
    for (const pattern of patterns) {
      if (pattern.test(msg)) {
        return intent;
      }
    }
  }
  
  return 'default';
}

// ===== FETCH GITHUB =====
async function fetchGitHub(username) {
  try {
    const [user, repos] = await Promise.all([
      axios.get(`https://api.github.com/users/${username}`, { timeout: 10000 }),
      axios.get(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`, { timeout: 10000 })
    ]);
    
    const languages = {};
    repos.data.forEach(r => {
      if (r.language) languages[r.language] = (languages[r.language] || 0) + 1;
    });
    
    const topLangs = Object.entries(languages)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([lang]) => lang);
    
    const totalStars = repos.data.reduce((sum, r) => sum + r.stargazers_count, 0);
    
    return {
      username: user.data.login,
      repos: user.data.public_repos,
      stars: totalStars,
      followers: user.data.followers,
      languages: topLangs.join(', '),
      topRepos: repos.data.slice(0, 2).map(r => ({
        name: r.name,
        description: r.description,
        url: r.html_url,
        stars: r.stargazers_count,
        language: r.language
      }))
    };
  } catch (error) {
    console.error('GitHub error:', error.message);
    return null;
  }
}

// ===== FETCH LEETCODE =====
async function fetchLeetCode(username) {
  try {
    const query = `
      query($username: String!) {
        matchedUser(username: $username) {
          username
          submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
            }
          }
        }
      }
    `;
    
    const response = await axios.post('https://leetcode.com/graphql', {
      query,
      variables: { username }
    }, { timeout: 10000 });
    
    if (response.data?.data?.matchedUser) {
      const user = response.data.data.matchedUser;
      const stats = user.submitStatsGlobal.acSubmissionNum;
      
      return {
        username: user.username,
        total: stats.find(s => s.difficulty === 'All')?.count || 0,
        easy: stats.find(s => s.difficulty === 'Easy')?.count || 0,
        medium: stats.find(s => s.difficulty === 'Medium')?.count || 0,
        hard: stats.find(s => s.difficulty === 'Hard')?.count || 0
      };
    }
    
    return null;
  } catch (error) {
    console.error('LeetCode error:', error.message);
    return null;
  }
}

// ===== FETCH MEDIUM =====
async function fetchMedium(username) {
  try {
    const response = await axios.get(
      `https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/${username}`,
      { timeout: 10000 }
    );
    
    if (response.data?.items) {
      return {
        posts: response.data.items.slice(0, 5).map(p => ({
          title: p.title,
          link: p.link,
          date: p.pubDate
        })),
        latest: response.data.items[0]
      };
    }
    
    return null;
  } catch (error) {
    console.error('Medium error:', error.message);
    return null;
  }
}

// ===== INITIALIZE DATA =====
async function initData() {
  console.log('🔄 Fetching data...');
  
  const [gh, lc, md] = await Promise.allSettled([
    fetchGitHub(KB.social.github),
    fetchLeetCode(KB.social.leetcode),
    fetchMedium(KB.social.medium)
  ]);
  
  cache.github = gh.status === 'fulfilled' ? gh.value : null;
  cache.leetcode = lc.status === 'fulfilled' ? lc.value : null;
  cache.medium = md.status === 'fulfilled' ? md.value : null;
  cache.lastFetch = new Date();
  
  console.log(`GitHub: ${cache.github ? '✓' : '✗'}`);
  console.log(`LeetCode: ${cache.leetcode ? '✓' : '✗'}`);
  console.log(`Medium: ${cache.medium ? '✓' : '✗'}\n`);
}

// ===== RANDOM VARIATION SELECTOR =====
function getRandomVariation(responses) {
  if (Array.isArray(responses)) {
    return responses[Math.floor(Math.random() * responses.length)];
  }
  return responses;
}

// ===== GENERATE RESPONSE =====
function generateResponse(intent) {
  let response = '';
  
  // Get random variation for responses that have multiple versions
  const getResp = (key) => getRandomVariation(KB.responses[key]);
  
  switch (intent) {
    case 'greeting':
      response = getResp('greeting');
      break;
      
    case 'about_bot':
      response = getResp('about_bot');
      break;
      
    case 'about_creator':
      response = getResp('about_creator');
      break;
      
    case 'tech_stack':
      response = getResp('tech_stack');
      break;
      
    case 'skills':
      response = getResp('tech_stack');
      break;
      
    case 'projects':
      response = getResp('projects_latest');
      if (cache.github && cache.github.topRepos) {
        const repos = cache.github.topRepos.map((r, i) => 
          `${i+1}. ${r.name} (${r.language || 'N/A'}) - ${r.url}`
        ).join('\n');
        response = response.replace('[GITHUB_REPOS]', repos);
      } else {
        response = response.replace('[GITHUB_REPOS]', 'Check GitHub: https://github.com/' + KB.social.github);
      }
      response = response.replace('[COMPANY_NAME]', 'his current company');
      response = response.replace('[PROJECT_DETAILS]', 'exciting projects');
      break;
      
    case 'github':
      if (cache.github) {
        response = `GitHub Stats for @${cache.github.username}:\n\n`;
        response += `📦 ${cache.github.repos} public repositories\n`;
        response += `⭐ ${cache.github.stars} total stars\n`;
        response += `👥 ${cache.github.followers} followers\n`;
        response += `💻 Top languages: ${cache.github.languages}\n\n`;
        response += `Latest repos:\n`;
        cache.github.topRepos.forEach((r, i) => {
          response += `${i+1}. ${r.name} (${r.language || 'N/A'})\n`;
          if (r.description) response += `   ${r.description}\n`;
          response += `   ${r.url}\n`;
        });
        response += `\nFull profile: https://github.com/${cache.github.username}`;
      } else {
        response = `Check out GitHub: https://github.com/${KB.social.github}`;
      }
      break;
      
    case 'leetcode':
      if (cache.leetcode) {
        response = `LeetCode Stats for @${cache.leetcode.username}:\n\n`;
        response += `✅ Total Solved: ${cache.leetcode.total}\n`;
        response += `🟢 Easy: ${cache.leetcode.easy}\n`;
        response += `🟡 Medium: ${cache.leetcode.medium}\n`;
        response += `🔴 Hard: ${cache.leetcode.hard}\n\n`;
        response += `Profile: https://leetcode.com/u/${cache.leetcode.username}`;
      } else {
        response = `LeetCode: https://leetcode.com/u/${KB.social.leetcode}`;
      }
      break;
      
    case 'blogs':
      if (cache.medium && cache.medium.posts.length > 0) {
        response = `Latest blog posts:\n\n`;
        cache.medium.posts.forEach((post, i) => {
          response += `${i+1}. ${post.title}\n   ${post.link}\n\n`;
        });
        response += `Read more: https://medium.com/${KB.social.medium}`;
      } else {
        response = `Check out Medium: https://medium.com/${KB.social.medium}`;
      }
      response += `\n\n` + getResp('blog_frequency');
      break;
      
    case 'linkedin':
      response = `LinkedIn: https://linkedin.com/in/${KB.social.linkedin}\n\nConnect for professional networking!`;
      break;
      
    case 'contact':
      response = getResp('contact');
      break;
      
    case 'job_seeking':
      response = getResp('job_seeking');
      break;
      
    case 'resume':
      response = getResp('resume');
      break;
      
    case 'location':
      response = getResp('location');
      break;
      
    case 'portfolio_tech':
      response = getResp('portfolio_tech');
      break;
      
    case 'source_code':
      response = getResp('source_code');
      break;
      
    case 'favorite_frameworks':
      response = getResp('favorite_frameworks');
      break;
      
    case 'collaboration':
      response = getResp('collaboration');
      break;
      
    case 'learning_first':
      response = getResp('learning_first_language');
      break;
      
    case 'build_portfolio':
      response = getResp('build_portfolio');
      break;
      
    case 'resources':
      response = getResp('resources');
      break;
      
    case 'mentoring':
      response = getResp('mentoring');
      break;
      
    case 'freelance':
      response = getResp('freelance');
      break;
      
    case 'experience':
      response = getResp('experience_domains');
      break;
      
    case 'pricing':
      response = getResp('pricing');
      break;
      
    case 'client_work':
      response = getResp('collaboration');
      break;
      
    case 'why_developer':
      response = getResp('why_developer');
      break;
      
    case 'learning_journey':
      response = getResp('background');
      break;
      
    case 'open_source':
      response = getResp('open_source');
      break;
      
    case 'personal_info':
      response = getResp('personal_info');
      break;
      
    case 'inappropriate':
      const msg = arguments[1] || '';
      if (/hack/i.test(msg)) response = getResp('inappropriate_hacking');
      else if (/homework/i.test(msg)) response = getResp('homework');
      else if (/date|marry/i.test(msg)) response = getResp('dating');
      else if (/api|password|bank/i.test(msg)) response = getResp('api_keys');
      else response = KB.responses.fallback;
      break;
      
    case 'default':
      response = getResp('default');
      break;
      
    default:
      // Show we tried but couldn't find an answer
      response = KB.responses.fallback;
  }
  
  return response;
}

// ===== MAIN CHAT ENDPOINT =====
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message required' });
    }
    
    console.log(`\n💬 Query: "${message}"`);
    
    if (!cache.lastFetch || Date.now() - cache.lastFetch > 3600000) {
      await initData();
    }
    
    const intent = classifyIntent(message);
    console.log(`🎯 Intent: ${intent}`);
    
    // Log unhandled queries for improvement
    if (intent === 'default') {
      console.log(`⚠️  Unmatched query: "${message}"`);
    }
    
    const response = generateResponse(intent, message);
    
    res.json({
      success: true,
      response: response,
      debug: { intent }
    });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      success: false, 
      response: KB.responses.fallback 
    });
  }
});

app.post('/api/refresh', async (req, res) => {
  await initData();
  res.json({ success: true });
});

app.get('/api/data', (req, res) => {
  res.json({ success: true, cache });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    bot: KB.bot.name,
    data: {
      github: !!cache.github,
      leetcode: !!cache.leetcode,
      medium: !!cache.medium
    }
  });
});

// Serve frontend for root and unknown routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, async () => {
  console.log('\n╔════════════════════════════════╗');
  console.log(`║  🤖 ${KB.bot.name} - Complete!      ║`);
  console.log('╚════════════════════════════════╝\n');
  console.log(`Server: http://localhost:${PORT}`);
  console.log(`User: ${KB.personal.name}\n`);
  
  await initData();
  
  console.log('✅ Ready with comprehensive FAQs!\n');
});
