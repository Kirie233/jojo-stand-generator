export default async function handler(request, response) {
  // 1. CORS Setup (Allow your domain)
  response.setHeader('Access-Control-Allow-Credentials', true);
  response.setHeader('Access-Control-Allow-Origin', '*'); // In production, replace '*' with your actual Vercel domain
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  response.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request for CORS preflight
  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }

  // 2. Get Key from Server Environment
  // Vercel ENV: GEMINI_SECRET_KEY (Preferred) or VITE_GEMINI_API_KEY (Fallback)
  const apiKey = process.env.GEMINI_SECRET_KEY || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    return response.status(500).json({ error: 'Server Error: API Key not configured' });
  }

  // 3. Parse Frontend Request (Robustly)
  let body = request.body;

  // Vercel sometimes returns body as string if content-type isn't perfectly matched
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      console.error("JSON Parse Error:", e);
      return response.status(400).json({ error: 'Invalid JSON body' });
    }
  }

  const { prompt, model } = body || {};

  if (!prompt) {
    console.error("Missing Prompt. Body received:", body);
    return response.status(400).json({ error: 'Missing prompt in request body' });
  }

  const modelId = model || process.env.GEMINI_MODEL || process.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash';
  const baseUrl = process.env.GEMINI_BASE_URL || process.env.VITE_GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com';
  const url = `${baseUrl}/v1beta/models/${modelId}:generateContent`;

  try {
    // 4. Call Google API (Server-to-Server)
    const googleResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey // Key is injected HERE, inside the server
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await googleResponse.json();

    if (!googleResponse.ok) {
      // Forward Google's error structure for debugging
      return response.status(googleResponse.status).json(data);
    }

    // 5. Return Clean Data to Frontend
    return response.status(200).json(data);

  } catch (error) {
    console.error("Vercel Proxy Error:", error);
    return response.status(500).json({ error: error.message });
  }
}
