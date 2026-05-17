const fs = require('fs');

async function testKey() {
  const envFile = fs.readFileSync('.env.local', 'utf8');
  const apiKey = envFile.split('=').slice(1).join('=').trim();
  
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
  const data = await res.json();
  const models = data.models.map(m => m.name);
  console.log("AVAILABLE MODELS:", models.filter(m => m.includes('gemini')));
}

testKey();
