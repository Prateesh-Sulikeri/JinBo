// server.js - Complete Working Version with All FAQ Responses (Hybrid Intent Engine)
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const Fuse = require('fuse.js');
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

let cache = { github: null, leetcode: null, medium: null, linkedin: null, lastFetch: null };

/* ============================================
   INTENT DEFINITIONS (regex fallback layer)
   NOTE: Order in INTENT_ORDER controls priority.
   ============================================ */

const INTENTS = {
  greeting: [/^(hi|hello|hey|hola|namaste|greetings|good morning|good evening|sup|yo|wassup)\b/i],

  about_bot: [
    /\b(who|what|tell me about|introduce) (is |are )?jinbo\b/i,
    /\bwho (are|r) (you|u)\b/i,
    /\bwhat (are|r) (you|u)\b/i,
    /\bjinbo\b/i,
    /\bhow does this chatbot work/i,
    /\bhow (was|is) this (chatbot |bot )?built/i
  ],

  // Platform/profile intents must win before education
  github: [
    /\b(github|git hub|repositories|repos?)\b/i,
    /\b(show|what|tell) .* (github|code|repositories?)\b/i,
    /github(?:\.com| profile| account| username| repo| repos?| stats?)/i
  ],

  leetcode: [
    /\b(leetcode|leet ?code|coding problems?|dsa|algorithms?)\b/i,
    /(?:leetcode|leet ?code)(?: profile| account| stats?| problems?| username)?/i,
    /\bproblems? solved\b/i
  ],

  blogs: [
    /\b(blog|medium|article|writing|post)s?\b/i,
    /\b(does he |do you )?write\b/i,
    /\blatest (blog|article|post)\b/i,
    /(?:medium|blog)(?: profile| posts?| articles?| account)?/i
  ],

  linkedin: [
    /\blinkedin\b/i,
    /(?:linkedin|linkedin\.com)(?: profile| connect| network| account)?/i,
    /\bconnect (on )?linkedin\b/i
  ],

  // EDUCATION — guarded to avoid hijacking platform "profile" queries
  education: [
    // Direct references to education, not followed by platform terms
    /\b(prateesh|prateesh['’]s) (education|educational|qualification(s)?|degree|academic|academic background|stud(y|ies))\b(?!.*(github|linkedin|leetcode|medium))/i,

    // Questions with education words
    /\b(what|tell me|share|show|give|describe|say|talk about) .* (prateesh|he|he['’]s|his|you|your) .* (education(al)?( qualification(s)?)?|qualification(s)?|degree(s)?|study|studies|college|school|academic( background)?|major|course|field|graduation|alma mater)\b(?!.*(github|linkedin|leetcode|medium))/i,

    // General education background
    /\b(education|educational background|qualification(s)?|academic background|academic record|academic history|stud(y|ies)|college|school|degree(s)?|course|field of study|major|alma mater)\b(?!.*(github|linkedin|leetcode|medium))/i,

    // Where did he study?
    /\bwhere (did|do|does|has) (you|he|prateesh) (study|go to (college|school)|graduate|complete (his|your)? (degree|education))\b(?!.*(github|linkedin|leetcode|medium))/i,

    // “Background / History / Record / Profile” — but exclude platform profile
    /\b(his|your|the)? ?(educational|academic)? ?(background|history|record|profile)\b(?!.*(github|linkedin|leetcode|medium))/i,

    // Graduation / course / major
    /\b(did|have|has|was|were|is|are|what|where|which) .* (graduate|graduation|course|major|field of study|specialization|subject|stream)\b/i,

    // Highest/current level
    /\b(highest|current|level of) (education|qualification|degree|study|academic background)\b/i,

    // Short variants
    /\b(study|degree|education|college|school|graduation|qualification)\?$/i
  ],

  college: [
    /\bprateesh'?s? college\b/i,
    /\b(which |what |your |his )?college (did |does )?.*attend\b/i,
    /\b(which |what |your |his )?college\b/i,
    /\b(which |what |your |his )?university\b/i,
    /\bwhere .* graduate\b/i,
    /\bengineering college\b/i
  ],

  degree: [
    /\bprateesh'?s? degree\b/i,
    /\b(what |which )?degree (does |did )?.*have\b/i,
    /\b(what |which )?degree\b/i,
    /\bb\.?e\.?\b/i,
    /\bbachelor\b/i,
    /\bcomputer science (degree|engineering)\b/i
  ],

  schooling: [
    /\bprateesh'?s? school\b/i,
    /\b(school|10th|12th|sslc|p\.?u\.?)\b/i,
    /\bhigh school\b/i,
    /\bsecondary\b/i,
    /\bpre.?university\b/i
  ],

  cgpa: [
    /\bprateesh'?s? (cgpa|gpa|marks|score)\b/i,
    /\b(what |your |his )?(cgpa|gpa|grade|marks|percentage|score)\b/i,
    /\bhow much .* (score|marks)\b/i,
    /\bacademic (performance|record)\b/i
  ],

  about_creator: [
    /\b(who|what|tell me about|introduce) (is )?prateesh(?! .*(education|qualification|degree|college|school|study))\b/i,
    /\babout prateesh(?! .*(education|qualification|degree))\b/i,
    /\bprateesh sulikeri\b/i,
    /\bwho (is )?he\b/i,
    /\b(your|his) background(?! .*(education|academic))\b/i,
    /\bprateesh'?s? (story|journey|bio)\b/i
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
    /\bwhat (did|has) (he|prateesh|you) (built?|created?|made?)\b/i
  ],

  contact: [
    /\b(contact|email|reach|get in touch|message)\b/i,
    /\bhow (to|can i) (contact|reach|message|get in touch)\b/i
  ],

  job_seeking: [
    /\b(looking for|open to|available for|seeking) (job|work|opportunities?)\b/i,
    /\b(hiring|hire|job opportunities?)\b/i,
    /\bare you (looking|open|available)/i
  ],

  resume: [
    /\b(resume|cv|curriculum vitae)\b/i,
    /\bdownload .* resume\b/i
  ],

  location: [
    /\b(location|where .* live|timezone|current location)\b/i,
    /\bwhere (are you|is he) (based|located)\b/i
  ],

  portfolio_tech: [
    /\bwhat stack .* (use|used) .* (website|site|portfolio)\b/i,
    /\bhow .* (host|deploy) .* portfolio\b/i
  ],

  source_code: [
    /\b(is |the )?source code (public|available|open)\b/i,
    /\bcan i see .* (source |)code\b/i
  ],

  favorite_frameworks: [
    /\bfavorite (framework|technology|tech|language)\b/i,
    /\bpreferred (framework|stack)\b/i
  ],

  collaboration: [
    /\b(collaborate|work together|partnership|team up)\b/i,
    /\bcan i (collaborate|work) with\b/i
  ],

  learning_first: [
    /\bwhich (language|programming language) .* (learn first|start with|begin)\b/i,
    /\bfirst (language|programming language)\b/i
  ],

  build_portfolio: [
    /\bhow (can i|to|do i) build .* portfolio\b/i,
    /\bcreate .* portfolio\b/i
  ],

  resources: [
    /\b(what |which |any )?resources .* recommend\b/i,
    /\brecommend .* (resources|courses|tutorials)\b/i,
    /\bwhere .* learn\b/i
  ],

  mentoring: [
    /\bdo you (mentor|teach)\b/i,
    /\bmentorship\b/i,
    /\bcan you (help|guide|teach) me\b/i
  ],

  freelance: [
    /\b(freelance|hire|services)\b/i,
    /\bdo you take .* (freelance|projects?)\b/i,
    /\bavailable for (work|hire)\b/i
  ],

  experience: [
    /\bhow many years .* experience\b/i,
    /\byears of experience\b/i,
    /\bexperience with .* (web|ai|automation|apps?)\b/i
  ],

  pricing: [
    /\b(hourly rate|pricing|rates?|cost|how much)\b/i,
    /\bwhat .* (charge|cost)\b/i
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
    /\bcontribute to .* repos?\b/i
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

// Explicit priority: platform/profile before education
const INTENT_ORDER = [
  'github', 'leetcode', 'linkedin', 'blogs',
  'greeting', 'about_bot',
  'education', 'college', 'degree', 'schooling', 'cgpa',
  'about_creator', 'tech_stack', 'skills', 'projects',
  'contact', 'job_seeking', 'resume', 'location', 'portfolio_tech',
  'source_code', 'favorite_frameworks', 'collaboration',
  'learning_first', 'build_portfolio', 'resources', 'mentoring',
  'freelance', 'experience', 'pricing', 'why_developer',
  'learning_journey', 'open_source', 'personal_info', 'inappropriate'
];

/* ============================================
   Search index for fuzzy KB (unchanged behavior)
   ============================================ */
function buildSearchIndex() {
  const searchableData = [];

  // Index responses
  Object.entries(KB.responses).forEach(([key, value]) => {
    const responses = Array.isArray(value) ? value : [value];
    responses.forEach(text => {
      searchableData.push({
        type: 'response',
        key: key,
        content: text,
        keywords: key.split('_').join(' ')
      });
    });
  });

  // Index personal data
  Object.entries(KB.personal).forEach(([key, value]) => {
    if (typeof value === 'string') {
      searchableData.push({
        type: 'personal',
        key: key,
        content: value,
        keywords: key
      });
    } else if (Array.isArray(value)) {
      value.forEach((item, idx) => {
        searchableData.push({
          type: 'personal',
          key: `${key}[${idx}]`,
          content: JSON.stringify(item),
          keywords: key
        });
      });
    }
  });

  return new Fuse(searchableData, {
    keys: ['keywords', 'content'],
    threshold: 0.4,
    includeScore: true,
    ignoreLocation: true,
    minMatchCharLength: 3
  });
}

const searchIndex = buildSearchIndex();

function fuzzySearchKB(query) {
  const results = searchIndex.search(query);
  if (results.length === 0) return null;

  const best = results[0];
  if (best.score < 0.6) {
    return {
      key: best.item.key,
      content: best.item.content,
      confidence: Math.round((1 - best.score) * 100),
      type: best.item.type
    };
  }
  return null;
}

function validateFuzzyResult(query, result) {
  const queryTerms = query.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const resultText = result.content.toLowerCase();
  const matchedTerms = queryTerms.filter(term => resultText.includes(term));
  const validationScore = matchedTerms.length / (queryTerms.length || 1);
  return {
    isValid: validationScore >= 0.4 || result.confidence >= 70,
    validationScore: Math.round(validationScore * 100),
    matchedTerms
  };
}

/* ============================================
   Normalization + Hybrid Intent Engine
   ============================================ */
function normalizeMessage(message) {
  return message
    .trim()
    .toLowerCase()
    .replace(/['`´]/g, "'")
    .replace(/(\w+)'(s|re|ve|ll|d|m|t)\b/g, '$1 $2')
    .replace(/[^\w\s?!.'-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// lightweight weighted scoring
const weightedKeywords = {
  github: ['github', 'repo', 'repository', 'code', 'stars', 'commit', 'pull request', 'profile'],
  leetcode: ['leetcode', 'leet code', 'dsa', 'problem', 'problems', 'coding', 'profile'],
  linkedin: ['linkedin', 'connect', 'professional', 'network', 'profile'],
  blogs: ['medium', 'blog', 'article', 'post', 'profile'],
  education: ['education', 'college', 'degree', 'qualification', 'academic', 'study', 'school', 'profile']
};

function scoreIntents(message) {
  const text = normalizeMessage(message);
  const scores = {};
  const hasProfile = /\bprofile\b/i.test(text);

  for (const [intent, words] of Object.entries(weightedKeywords)) {
    scores[intent] = words.reduce((acc, w) => acc + (text.includes(w) ? 1 : 0), 0);
    // small bonus if user says "profile" with a platform
    if (hasProfile && ['github','leetcode','linkedin','blogs'].includes(intent) && text.includes(intent)) {
      scores[intent] += 1;
    }
  }

  // pick max
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [bestIntent, bestScore] = sorted[0] || ['default', 0];

  // require a minimal confidence
  if (bestScore >= 2) return bestIntent;
  return null;
}

// explicit platform-profile override
function platformProfileOverride(message) {
  const t = normalizeMessage(message);
  if (!/\bprofile\b/.test(t)) return null;
  if (/\bgithub\b/.test(t)) return 'github';
  if (/\bleet ?code\b/.test(t)) return 'leetcode';
  if (/\blinkedin\b/.test(t)) return 'linkedin';
  if (/\bmedium\b|\bblog\b/.test(t)) return 'blogs';
  return null;
}

function classifyIntent(message) {
  const normalized = normalizeMessage(message);

  // 0) explicit override for "X profile"
  const override = platformProfileOverride(normalized);
  if (override) return override;

  // 1) keyword scoring first (handles overlaps naturally)
  const scored = scoreIntents(normalized);
  if (scored) return scored;

  // 2) ordered regex fallback
  for (const intent of INTENT_ORDER) {
    const patterns = INTENTS[intent];
    if (!patterns) continue;
    if (patterns.some(p => p.test(normalized))) return intent;
  }

  return 'default';
}

/* ============================================
   Data fetchers (unchanged)
   ============================================ */
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

    const totalStars = repos.data.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);

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
      const stats = user.submitStatsGlobal.acSubmissionNum || [];

      const pick = (lvl) => (stats.find(s => s.difficulty === lvl)?.count) || 0;
      return {
        username: user.username,
        total: pick('All'),
        easy: pick('Easy'),
        medium: pick('Medium'),
        hard: pick('Hard')
      };
    }
    return null;
  } catch (error) {
    console.error('LeetCode error:', error.message);
    return null;
  }
}

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

async function fetchLinkedInActivity() {
  try {
    if (KB.social.linkedin_data) {
      return KB.social.linkedin_data;
    }
    return {
      profileUrl: `https://linkedin.com/in/${KB.social.linkedin}`,
      latestPost: null,
      connections: null,
      followers: null
    };
  } catch (error) {
    console.error('LinkedIn data load error:', error.message);
    return {
      profileUrl: `https://linkedin.com/in/${KB.social.linkedin}`,
      latestPost: null
    };
  }
}

/* ============================================
   Init data (unchanged)
   ============================================ */
async function initData() {
  console.log('🔄 Fetching data...');

  const [gh, lc, md, li] = await Promise.allSettled([
    fetchGitHub(KB.social.github),
    fetchLeetCode(KB.social.leetcode),
    fetchMedium(KB.social.medium),
    fetchLinkedInActivity()
  ]);

  cache.github = gh.status === 'fulfilled' ? gh.value : null;
  cache.leetcode = lc.status === 'fulfilled' ? lc.value : null;
  cache.medium = md.status === 'fulfilled' ? md.value : null;
  cache.linkedin = li.status === 'fulfilled' ? li.value : null;
  cache.lastFetch = new Date();

  console.log(`GitHub: ${cache.github ? '✓' : '✗'}`);
  console.log(`LeetCode: ${cache.leetcode ? '✓' : '✗'}`);
  console.log(`Medium: ${cache.medium ? '✓' : '✗'}\n`);
  console.log(`LinkedIn: ${cache.linkedin ? '✓' : '✗'}\n`);
}

/* ============================================
   Helpers
   ============================================ */
function getRandomVariation(responses) {
  if (Array.isArray(responses)) {
    return responses[Math.floor(Math.random() * responses.length)];
  }
  return responses;
}

/* ============================================
   Response generator (kept intact, safer cgpa)
   ============================================ */
function generateResponse(intent, originalMessage) {
  let response = '';
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
          `${i + 1}. ${r.name} (${r.language || 'N/A'}) - ${r.url}`
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
          response += `${i + 1}. ${r.name} (${r.language || 'N/A'})\n`;
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
      if (cache.medium && cache.medium.posts && cache.medium.posts.length > 0) {
        response = `Latest blog posts:\n\n`;
        cache.medium.posts.forEach((post, i) => {
          response += `${i + 1}. ${post.title}\n   ${post.link}\n\n`;
        });
        response += `Read more: https://medium.com/${KB.social.medium}`;
      } else {
        response = `Check out Medium: https://medium.com/${KB.social.medium}`;
      }
      response += `\n\n` + getResp('blog_frequency');
      break;

    case 'linkedin':
      if (cache.linkedin) {
        response = `LinkedIn Profile: ${cache.linkedin.profileUrl}\n\n`;

        if (cache.linkedin.connections) {
          response += `🤝 ${cache.linkedin.connections}+ connections\n`;
        }
        if (cache.linkedin.followers) {
          response += `👥 ${cache.linkedin.followers} followers\n\n`;
        }

        if (cache.linkedin.latestPost) {
          response += `📝 Latest Post:\n`;
          response += `"${cache.linkedin.latestPost.text}"\n\n`;
          response += `❤️ ${cache.linkedin.latestPost.likes} likes | `;
          response += `💬 ${cache.linkedin.latestPost.comments} comments | `;
          response += `🔄 ${cache.linkedin.latestPost.shares} shares\n`;
          response += `🔗 ${cache.linkedin.latestPost.url}\n\n`;
        }

        response += `Connect for professional networking!`;
      } else {
        response = `LinkedIn: https://linkedin.com/in/${KB.social.linkedin}\n\nConnect for professional networking!`;
      }
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

    case 'inappropriate': {
      const msg = originalMessage || '';
      if (/hack/i.test(msg)) response = getResp('inappropriate_hacking');
      else if (/homework/i.test(msg)) response = getResp('homework');
      else if (/date|marry/i.test(msg)) response = getResp('dating');
      else if (/api|password|bank/i.test(msg)) response = getResp('api_keys');
      else response = KB.responses.fallback;
      break;
    }

    case 'education':
      response = getResp('education');
      break;

    case 'college':
      response = getResp('college');
      break;

    case 'degree':
      response = getResp('degree');
      break;

    case 'schooling':
      response = getResp('schooling');
      break;

    case 'cgpa': {
      // Safe dynamic response
      const edu = (KB.education && Array.isArray(KB.education)) ? KB.education : [];
      const be = edu.find(e => e.level && /Bachelor of Engineering/i.test(e.level));
      const pu = edu.find(e => /Pre-?University/i.test(e.level || '')) || edu[1];
      const sslc = edu.find(e => /Secondary|SSLC|10th/i.test(e.level || '')) || edu[2];

      if (!be && !pu && !sslc) {
        response = "Education data not found in knowledge base.";
        break;
      }

      response = `Academic Performance:\n\n`;
      if (be) response += `🎓 B.E Computer Science: ${be.cgpa ?? 'N/A'} CGPA (${be.year ?? 'N/A'})\n`;
      if (pu) response += `📚 12th Grade: ${pu.percentage ?? 'N/A'}% (${pu.year ?? 'N/A'})\n`;
      if (sslc) response += `📖 10th Grade: ${sslc.percentage ?? 'N/A'}% (${sslc.year ?? 'N/A'})`;
      break;
    }

    case 'default':
      response = getResp('default');
      break;

    default:
      response = KB.responses.fallback;
  }

  return response;
}

/* ============================================
   API endpoints
   ============================================ */
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

    let intent = classifyIntent(message);
    console.log(`🎯 Intent: ${intent}`);

    let response;
    let usedFuzzy = false;

    if (intent === 'default') {
      console.log(`🔍 Attempting fuzzy search...`);
      const fuzzyResult = fuzzySearchKB(message);

      if (fuzzyResult) {
        const validation = validateFuzzyResult(message, fuzzyResult);
        console.log(`📊 Fuzzy: confidence=${fuzzyResult.confidence}%, validation=${validation.validationScore}%`);

        if (validation.isValid) {
          response = (fuzzyResult.type === 'response')
            ? fuzzyResult.content
            : `Based on your question, here's what I found:\n\n${fuzzyResult.content}`;

          response += `\n\n⚠️ *Note: This answer was extracted from my knowledge base with ${fuzzyResult.confidence}% confidence and may not perfectly match your question. For more accurate info, please rephrase or contact Prateesh directly.*`;
          usedFuzzy = true;
        } else {
          console.log(`❌ Fuzzy validation failed`);
          response = generateResponse('default', message);
        }
      } else {
        console.log(`❌ No fuzzy results`);
        response = generateResponse('default', message);
      }
    } else {
      response = generateResponse(intent, message);
    }

    res.json({
      success: true,
      response,
      debug: {
        intent,
        usedFuzzySearch: usedFuzzy,
        method: usedFuzzy ? 'fuzzy' : 'intent'
      }
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
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Only start the server when run directly (keeps Jest clean)
if (require.main === module) {
  app.listen(PORT, async () => {
    console.log('\n╔════════════════════════════════╗');
    console.log(`║  🤖 ${KB.bot.name} - Complete!      ║`);
    console.log('╚════════════════════════════════╝\n');
    console.log(`Server: http://localhost:${PORT}`);
    console.log(`User: ${KB.personal.name}\n`);
    await initData();
    console.log('✅ Ready with comprehensive FAQs!\n');
  });
}

module.exports = app;
