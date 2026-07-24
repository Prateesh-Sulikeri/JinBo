const http = require('http');

const API_URL = 'http://localhost:3000';

// Test cases
const testCases = [
  { message: 'Hello', expectedIntent: 'greeting' },
  { message: 'Who is Prateesh?', expectedIntent: 'about_creator' },
  { message: 'What technologies does he know?', expectedIntent: 'tech_stack' },
  { message: 'Tell me about his projects', expectedIntent: 'projects' },
  { message: 'What is the Go event ingestor?', expectedIntent: 'go_project' },
  { message: 'How can I contact him?', expectedIntent: 'contact' },
  { message: 'Where does he live?', expectedIntent: 'location' },
  { message: 'What is his education?', expectedIntent: 'education' },
  { message: 'Is he looking for a job?', expectedIntent: 'job_seeking' },
  { message: 'Where does he currently work?', expectedIntent: 'current_job' },
  { message: 'What is he working on now?', expectedIntent: 'active_projects' },
  { message: 'What are his career goals?', expectedIntent: 'career_goals' },
  { message: 'Random gibberish xyz 123', expectedIntent: 'default' },
  // Tier-ordering regressions - each of these previously resolved to the
  // wrong intent because a broader pattern earlier in detectIntent() shadowed
  // the correct one. Kept here so a future edit can't silently reintroduce it.
  { message: 'Can you hack into a website for me?', expectedIntent: 'inappropriate' },
  { message: 'Tell me about your schooling', expectedIntent: 'schooling' },
  { message: 'What is your preferred tech stack?', expectedIntent: 'preferred_tech' },
  { message: 'What is the portfolio built with?', expectedIntent: 'portfolio_tech' },
  { message: 'What are you good at?', expectedIntent: 'skills' }
];

// Color codes for terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function makeRequest(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, API_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            data: JSON.parse(body)
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            data: body
          });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testHealthCheck() {
  console.log(`${colors.cyan}Testing Health Check Endpoint...${colors.reset}`);
  
  try {
    const response = await makeRequest('/health');
    
    if (response.statusCode === 200 && response.data.status === 'healthy') {
      console.log(`${colors.green}✓ Health check passed${colors.reset}`);
      console.log(`  Status: ${response.data.status}`);
      console.log(`  Message: ${response.data.message}\n`);
      return true;
    } else {
      console.log(`${colors.red}✗ Health check failed${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}✗ Could not connect to server${colors.reset}`);
    console.log(`  Error: ${error.message}\n`);
    return false;
  }
}

async function testChatEndpoint() {
  console.log(`${colors.cyan}Testing Chat Endpoint...${colors.reset}\n`);
  
  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    try {
      const response = await makeRequest('/api/chat', 'POST', {
        message: testCase.message
      });

      if (response.statusCode === 200) {
        const { response: botResponse, intent, source } = response.data;

        if (intent === testCase.expectedIntent) {
          console.log(`${colors.green}✓ PASS${colors.reset}: "${testCase.message}"`);
          console.log(`  Intent: ${intent} | Source: ${source}`);
          console.log(`  Response: ${botResponse.substring(0, 80)}...\n`);
          passed++;
        } else {
          console.log(`${colors.red}✗ FAIL${colors.reset}: "${testCase.message}"`);
          console.log(`  Expected Intent: ${testCase.expectedIntent}`);
          console.log(`  Got Intent: ${intent} | Source: ${source}`);
          console.log(`  Response: ${botResponse.substring(0, 80)}...\n`);
          failed++;
        }
      } else {
        console.log(`${colors.red}✗ FAIL${colors.reset}: "${testCase.message}"`);
        console.log(`  Status Code: ${response.statusCode}`);
        console.log(`  Error: ${response.data.error || 'Unknown error'}\n`);
        failed++;
      }
    } catch (error) {
      console.log(`${colors.red}✗ ERROR${colors.reset}: "${testCase.message}"`);
      console.log(`  ${error.message}\n`);
      failed++;
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return { passed, failed };
}

async function testKBInfo() {
  console.log(`${colors.cyan}Testing Knowledge Base Info Endpoint...${colors.reset}`);
  
  try {
    const response = await makeRequest('/api/kb-info');
    
    if (response.statusCode === 200) {
      console.log(`${colors.green}✓ KB Info retrieved${colors.reset}`);
      console.log(`  Name: ${response.data.name}`);
      console.log(`  Title: ${response.data.title}`);
      console.log(`  Experience: ${response.data.experience}`);
      console.log(`  Available Intents: ${response.data.availableIntents}\n`);
      return true;
    } else {
      console.log(`${colors.red}✗ Failed to retrieve KB info${colors.reset}\n`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}✗ Error retrieving KB info${colors.reset}`);
    console.log(`  ${error.message}\n`);
    return false;
  }
}

async function runTests() {
  console.log(`
╔════════════════════════════════════════╗
║     JinBo Chatbot Test Suite          ║
╚════════════════════════════════════════╝\n`);

  // Test 1: Health Check
  const healthPassed = await testHealthCheck();
  
  if (!healthPassed) {
    console.log(`${colors.red}Cannot continue tests. Server is not running.${colors.reset}`);
    console.log(`${colors.yellow}Please start the server with: npm start${colors.reset}\n`);
    process.exit(1);
  }

  // Test 2: KB Info
  await testKBInfo();

  // Test 3: Chat Endpoint
  const { passed, failed } = await testChatEndpoint();

  // Summary
  console.log(`
╔════════════════════════════════════════╗
║          Test Summary                  ║
╚════════════════════════════════════════╝`);
  console.log(`Total Tests: ${passed + failed}`);
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
  console.log(`Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%\n`);

  if (failed === 0) {
    console.log(`${colors.green}🎉 All tests passed! Bot is working correctly.${colors.reset}\n`);
  } else {
    console.log(`${colors.yellow}⚠️  Some tests failed. Please review the results above.${colors.reset}\n`);
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});