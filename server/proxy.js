const fs = require('fs');
const path = require('path');
const http = require('http');

function loadDotEnv() {
  const envFile = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envFile)) {
    return;
  }

  const lines = fs.readFileSync(envFile, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');
    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value.replace(/^['"]|['"]$/g, '');
    }
  }
}

loadDotEnv();

const PORT = Number(process.env.PORT || 3001);
const DEFAULT_PROVIDER = process.env.AI_PROVIDER || 'groq';
const DEFAULT_MODEL = process.env.AI_MODEL || 'openai/gpt-oss-20b';
const DEFAULT_BASE_URL = process.env.AI_BASE_URL || 'https://api.groq.com/openai/v1';
const API_KEY = process.env.AI_API_KEY || process.env.GROQ_API_KEY || process.env.OPENROUTER_API_KEY || '';

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    sendJson(res, 200, { ok: true });
    return;
  }

  if (req.method !== 'POST' || req.url !== '/api/ai') {
    sendJson(res, 404, { error: 'Not found' });
    return;
  }

  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
  });

  req.on('end', async () => {
    try {
      const payload = JSON.parse(body || '{}');
      const provider = (payload.provider || DEFAULT_PROVIDER).toLowerCase();
      const model = payload.model || DEFAULT_MODEL;
      const baseUrl = provider === 'openrouter'
        ? 'https://openrouter.ai/api/v1'
        : (payload.baseUrl || DEFAULT_BASE_URL);
      const messages = payload.messages || [
        { role: 'user', content: payload.userMessage || 'Hello' },
      ];
      const apiKey = payload.apiKey || API_KEY;

      if (!apiKey) {
        sendJson(res, 401, {
          error: 'Missing AI API key. Set AI_API_KEY in the environment or pass apiKey in the request body.',
        });
        return;
      }

      const upstreamResponse = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          ...(provider === 'openrouter'
            ? {
                'HTTP-Referer': 'http://localhost:4200',
                'X-Title': 'SciExplore PH',
              }
            : {}),
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: payload.temperature ?? 0.7,
          max_tokens: payload.max_tokens ?? 300,
        }),
      });

      const text = await upstreamResponse.text();
      let data = null;
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }

      if (!upstreamResponse.ok) {
        sendJson(res, upstreamResponse.status, {
          error: 'AI provider returned an error',
          provider,
          status: upstreamResponse.status,
          details: data,
        });
        return;
      }

      const reply = data?.choices?.[0]?.message?.content;
      sendJson(res, 200, {
        reply: typeof reply === 'string' ? reply.trim() : '',
      });
    } catch (error) {
      sendJson(res, 500, {
        error: 'Proxy failed',
        detail: error.message,
      });
    }
  });
});

server.listen(PORT, () => {
  console.log(`SciExplore AI proxy running on http://localhost:${PORT}/api/ai`);
});
