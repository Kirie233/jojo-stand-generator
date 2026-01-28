export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { action, payload } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    const baseUrl = process.env.GEMINI_BASE_URL || process.env.VITE_GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com';

    // Allow overriding models via env vars, formatted for backend
    const textModel = process.env.GEMINI_MODEL || process.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash';
    const imageModel = process.env.IMAGE_MODEL || process.env.VITE_IMAGE_MODEL || 'dall-e-3';

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Server configuration error: Missing API Key' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // --- Action: Generate Profile (Text) ---
    if (action === 'profile') {
      const { song, color, personality, userName } = payload;
      const url = `${baseUrl}/v1beta/models/${textModel}:generateContent?key=${apiKey}`;

      const prompt = `
        你是一位《JOJO的奇妙冒险》替身设计专家。请根据以下用户特征，为一个新人类设计一个独特的替身(Stand)。

        用户特征:
        1. 替身使者: "${userName || 'Unknown'}"
        2. 音乐引用 (决定命名): "${song}"
        3. 代表色 (决定视觉): "${color}"
        4. 精神特质/欲望 (决定能力核心): "${personality}"

        请返回一个合法的 JSON 对象 (不要使用 Markdown 代码块)，包含以下字段:
        {
          "name": "替身名 (基于音乐引用的日文片假名或英文，并附带帅气的中文译名，例如 'Killer Queen (杀手皇后)')",
          "abilityName": "能力名 (汉字，如 '败者食尘')",
          "ability": "能力详细描述。必须基于'${personality}'设计，要有JOJO式的奇妙逻辑，避免通用的超能力。",
          "stats": {
            "power": "评级 (A-E, 或 ∞, ?)",
            "speed": "评级",
            "range": "评级",
            "durability": "评级",
            "precision": "评级",
            "potential": "评级"
          },
          "appearance": "基于'${color}'色调的详细外貌描述，包含服装、机械或生物特征，用于后续绘画。",
          "shout": "替身吼叫 (如 ORA ORA, ARI ARI, 或与能力相关的独特声音)"
        }
      `;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      const data = await response.json();
      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // --- Action: Generate Image ---
    if (action === 'image') {
      const { appearance } = payload;
      const isGemini = imageModel.toLowerCase().includes('gemini');
      let url, body, headers;

      const prompt = `(Masterpiece, Best Quality), Jojo's Bizarre Adventure Stand, art by Araki Hirohiko. ${appearance}. \n\nStyle tags: Anime, Manga Cover Art, Bold Black Lines, Heavy Hatching, Dramatic Shading, Hyper-muscular, Surreal Fashion, Dynamic 'JoJo Pose', Menacing Atmosphere (Gogogo), Vibrant and High Contrast Colors, Psychedelic Background. No humans, focus on the Stand entity.`;

      if (isGemini) {
        url = `${baseUrl}/v1beta/models/${imageModel}:generateContent?key=${apiKey}`;
        headers = { 'Content-Type': 'application/json' };
        body = {
          contents: [{
            role: "user",
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            responseModalities: ["TEXT", "IMAGE"]
          },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
          ]
        };
      } else {
        url = `${baseUrl}/v1/images/generations`;
        headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        };
        body = {
          model: imageModel,
          prompt: prompt,
          n: 1,
          size: "1024x1024"
        };
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body)
      });

      // We return the raw provider response to the frontend, 
      // letting the frontend logic (which is already capable) handle the parsing details.
      const data = await response.json();
      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
