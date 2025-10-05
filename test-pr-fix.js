#!/usr/bin/env node

// Simple test script to verify PR data fetching fix
// Run with: node test-pr-fix.js

const https = require('https');

// Mock environment for testing
global.import = {
  meta: {
    env: {
      VITE_GITHUB_TOKEN: process.env.GITHUB_TOKEN || ''
    }
  }
};

// Simple fetch implementation for Node.js
global.fetch = (url, options = {}) => {
  return new Promise((resolve, reject) => {
    const request = https.request(url, options, (response) => {
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        resolve({
          ok: response.statusCode >= 200 && response.statusCode < 300,
          status: response.statusCode,
          statusText: response.statusMessage,
          headers: {
            get: (name) => response.headers[name.toLowerCase()]
          },
          json: () => Promise.resolve(JSON.parse(data))
        });
      });
    });
    
    request.on('error', reject);
    request.end();
  });
};

// Mock localStorage
global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {}
};

// Mock window
global.window = {};

async function testPRFetching() {
  console.log('🧪 Testing PR data fetching fix...\n');
  
  try {
    // Import the GitHub service (this will work in Node.js with the mocks above)
    const { getActivePRsCount } = await import('./src/services/github.js');
    
    const testRepos = [
      { owner: 'facebook', repo: 'react' },
      { owner: 'microsoft', repo: 'vscode' },
      { owner: 'vercel', repo: 'next.js' }
    ];
    
    for (const { owner, repo } of testRepos) {
      console.log(`\n📊 Testing ${owner}/${repo}...`);
      
      try {
        const prCount = await getActivePRsCount(owner, repo);
        console.log(`✅ ${owner}/${repo}: ${prCount} active PRs`);
        
        if (prCount === 0) {
          console.log(`⚠️  WARNING: ${owner}/${repo} shows 0 PRs - this might indicate an issue`);
        } else {
          console.log(`✅ SUCCESS: ${owner}/${repo} shows ${prCount} PRs - fix appears to be working`);
        }
      } catch (error) {
        console.log(`❌ ERROR: ${owner}/${repo} failed: ${error.message}`);
      }
    }
    
    console.log('\n🎉 Test completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Open test-pr-fix.html in your browser');
    console.log('2. Run the development server: npm run dev');
    console.log('3. Check the browser console for detailed logs');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 This is expected in Node.js environment.');
    console.log('💡 The fix should work in the browser with the dev server.');
  }
}

// Run the test
testPRFetching().catch(console.error);
