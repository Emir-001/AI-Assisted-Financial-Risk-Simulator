const fs = require('fs');

async function testKey() {
  const envFile = fs.readFileSync('.env.local', 'utf8');
  const apiKey = envFile.split('=').slice(1).join('=').trim();
  
  console.log("Testing with API Key:", apiKey.substring(0, 10) + "...");
  
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
  const data = await res.json();
  console.log("Response:", JSON.stringify(data, null, 2));
}

testKey();
