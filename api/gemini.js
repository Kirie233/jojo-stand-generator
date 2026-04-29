export const config = {
  runtime: 'edge',
};

const normalizeBaseUrl = (url) => url.replace(/\/+$/, '');
const joinUrl = (baseUrl, path) => `${normalizeBaseUrl(baseUrl)}${path.startsWith('/') ? path : `/${path}`}`;

const jsonResponse = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const readJsonOrText = async (response) => {
  const rawText = await response.text();
  if (!rawText) return {};

  try {
    return JSON.parse(rawText);
  } catch {
    return { error: rawText };
  }
};

export default async function handler(req) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,OPTIONS,POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  // Get Key from Server Environment
  const apiKey = process.env.TEXT_SECRET_KEY || process.env.TEXT_API_KEY || process.env.GEMINI_SECRET_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return jsonResponse({ error: 'Server Error: API Key not configured' }, 500);
  }

  try {
    const body = await req.json();
    const { prompt, model } = body || {};

    if (!prompt) {
      return jsonResponse({ error: 'Missing prompt in request body' }, 400);
    }

    const modelId = model || process.env.TEXT_MODEL || process.env.GEMINI_MODEL || 'gemini-3-flash-preview';
    const baseUrl = process.env.TEXT_BASE_URL || process.env.GEMINI_BASE_URL || 'https://api.bltcy.ai/';
    const url = joinUrl(baseUrl, `/v1beta/models/${modelId}:generateContent`);

    // Call API (Server-to-Server)
    const googleResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    const data = await readJsonOrText(googleResponse);

    return jsonResponse(data, googleResponse.status);

  } catch (error) {
    console.error("Edge Proxy Error:", error);
    return jsonResponse({ error: error.message }, 500);
  }
}
