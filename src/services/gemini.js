const getApiKey = () => import.meta.env.VITE_GEMINI_API_KEY;
const getBaseUrl = () => import.meta.env.VITE_GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com';

export const generateStandProfile = async (inputs) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("请在 .env 文件中配置 VITE_GEMINI_API_KEY");
  }

  const { song, color, personality } = inputs;



  const baseUrl = getBaseUrl();
  const modelId = import.meta.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash';
  const url = `${baseUrl}/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

  console.log("Current Model ID:", modelId);
  console.log("Request URL (masked):", url.replace(apiKey, '***'));

  const prompt = `
    你是一位《JOJO的奇妙冒险》替身设计专家。请根据以下用户特征，为一个新人类设计一个独特的替身(Stand)。

    用户特征:
    1. 音乐引用 (决定命名): "${song}"
    2. 代表色 (决定视觉): "${color}"
    3. 精神特质/欲望 (决定能力核心): "${personality}"

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
      "appearance": "基于'${color}'色调的详细外貌描述，包含服装、机械或生物特征，用于后续绘画。注意：不要描述任何文字、字母、符号或纹身在替身身上，保持外表纯净。",
      "shout": "替身吼叫 (如 ORA ORA, ARI ARI, 或与能力相关的独特声音)"
    }
  `;

  try {
    let response;

    if (import.meta.env.PROD) {
      // --- PRODUCTION: Use Serverless Proxy (Secure) ---
      response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'profile',
          payload: { ...inputs, userName: inputs.userName || 'Unknown' }
        })
      });
    } else {
      // --- DEVELOPMENT: Direct Client-Side Call (Fast/Debug) ---
      // --- DEVELOPMENT: Direct Client-Side Call (Fast/Debug) ---
      const systemPrompt = `你是一位《JOJO的奇妙冒险》替身设计专家。请设计一个符合JOJO世界观的替身(Stand)。\n要求：能力设计要有创意且易于理解，符合荒木飞吕彦的风格。\n请返回一个合法的 JSON 对象。`;
      const userPrompt = `
        用户特征:
        1. 替身使者: "${inputs.userName || 'Unknown'}"
        2. 音乐引用 (决定命名): "${inputs.song}"
        3. 代表色 (决定视觉): "${inputs.color}"
        4. 精神特质/欲望 (决定能力核心): "${inputs.personality}"

        请返回 JSON:
        {
          "name": "替身名 (音乐引用+译名)",
          "abilityName": "能力名",
          "ability": "能力详细描述。基于'${inputs.personality}'设计，要有JOJO式的特色，但要让人能看懂。",
          "stats": { "power": "A-E", "speed": "A-E", "range": "A-E", "durability": "A-E", "precision": "A-E", "potential": "A-E" },
          "appearance": "基于'${inputs.color}'色调的详细外貌描述",
          "shout": "替身吼叫"
        }
      `;

      const isGemini = modelId.toLowerCase().includes('gemini');
      let url, headers, body;

      if (isGemini) {
        url = `${baseUrl}/v1beta/models/${modelId}:generateContent?key=${apiKey}`;
        headers = { 'Content-Type': 'application/json' };
        body = { contents: [{ parts: [{ text: prompt }] }] };
      } else {
        // OpenAI Compatible
        url = `${baseUrl}/v1/chat/completions`;
        headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        };
        body = {
          model: modelId,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt }
          ],
          response_format: { type: "json_object" }
        };
      }

      response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body)
      });
    }

    if (!response.ok) {
      const errorRaw = await response.text();
      let errorMsg = `Status ${response.status}`;
      try {
        const errorJson = JSON.parse(errorRaw);
        // Check for specific provider error messages
        const detail = errorJson.error?.message || "";
        if (detail.includes("quota exhausted") || detail.includes("RemainQuota")) {
          throw new Error("API 额度已用尽 (Quota Exhausted)。请检查您的余额。");
        }
        errorMsg = JSON.stringify(errorJson, null, 2);
      } catch (e) {
        // If it was already our friendly error, rethrow it
        if (e.message.startsWith("API 额度")) throw e;
        errorMsg = errorRaw;
      }
      throw new Error(`Gemini API Error: ${errorMsg}`);
    }

    const data = await response.json();
    console.log("--- RAW API RESPONSE (DEBUG) ---");
    console.log(data);

    // Attempt standard Google format
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    // Fallback: Check for OpenAI format (some proxies convert it)
    if (!text && data.choices?.[0]?.message?.content) {
      console.log("Detected OpenAI-style response format");
      text = data.choices[0].message.content;
    }

    if (!text) throw new Error("API response is empty or has unrecognized format. Check console logs.");

    // Clean up json
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1) throw new Error("Invalid JSON format");

    const jsonString = text.substring(jsonStart, jsonEnd + 1);
    return JSON.parse(jsonString);

  } catch (err) {
    console.error("Stand Generation Failed:", err);
    throw err;
  }
};

export const generateStandImage = async (appearance) => {
  const apiKey = getApiKey();
  const baseUrl = getBaseUrl();
  const imageModel = import.meta.env.VITE_IMAGE_MODEL || 'dall-e-3';

  console.log("Generating Image Model:", imageModel);

  const prompt = `(Masterpiece, Best Quality), Jojo's Bizarre Adventure Stand, art by Araki Hirohiko. ${appearance}. \n\nStyle tags: Anime Character Sheet, Full Body Reference, White Background, Simple Background, Bold Black Lines, Heavy Hatching, Dramatic Shading, Hyper-muscular, Dynamic 'JoJo Pose', Vibrant Colors. No humans, focus on the Stand entity. \n\nNEGATIVE PROMPT: text, letters, watermark, signature, username, ui, interface, speech bubble, caption, logo.`;

  // 1. Determine API Strategy based on Model Name
  const isGemini = imageModel.toLowerCase().includes('gemini');

  // Support independent Image Provider
  const imgApiKey = import.meta.env.VITE_IMAGE_API_KEY || apiKey;
  const imgBaseUrl = import.meta.env.VITE_IMAGE_BASE_URL || baseUrl;

  let url, body, headers;

  if (isGemini) {
    // --- STRATEGY A: Google Gemini Native API ---
    // Endpoint: /v1beta/models/MODEL_NAME:generateContent
    url = `${imgBaseUrl}/v1beta/models/${imageModel}:generateContent?key=${imgApiKey}`;

    headers = {
      'Content-Type': 'application/json'
    };

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

    console.log("Using Gemini Native Endpoint:", url);

  } else {
    // --- STRATEGY B: OpenAI Compatible API (DALL-E, etc) ---
    url = `${imgBaseUrl}/v1/images/generations`;
    headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${imgApiKey}`
    };
    body = {
      model: imageModel,
      prompt: prompt,
      n: 1,
      size: "1024x1024"
    };
    console.log("Using OpenAI Compatible Endpoint:", url);
  }

  // 2. Timeout Controller
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 40000); // 40s timeout (Images can be slow)

  try {
    let response;

    if (import.meta.env.PROD) {
      // --- PRODUCTION: Use Serverless Proxy (Secure) ---
      response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'image',
          payload: { appearance }
        }),
        signal: controller.signal
      });
    } else {
      // --- DEVELOPMENT: Direct Client-Side Call ---
      response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body),
        signal: controller.signal
      });
    }

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      console.warn("Image Generation Failed:", response.status, errText);
      return null;
    }

    const data = await response.json();
    console.log("--- RAW GEMINI IMAGE RESPONSE ---", JSON.stringify(data, null, 2));

    // 3. Parse Response
    // 3. Parse Response
    if (isGemini) {
      const candidate = data.candidates?.[0];
      if (candidate?.finishReason) {
        console.log("Gemini Finish Reason:", candidate.finishReason);
      }

      const parts = candidate?.content?.parts || [];
      console.log("Response Parts Count:", parts.length);

      // A. Look for Base64 Image (inline_data vs inlineData)
      const imagePart = parts.find(p => (p.inline_data && p.inline_data.data) || (p.inlineData && p.inlineData.data));
      if (imagePart) {
        const dataObj = imagePart.inline_data || imagePart.inlineData;
        console.log("Found Image in parts (Base64)");
        return `data:image/jpeg;base64,${dataObj.data}`;
      }

      // B. Look for Image URL in Text (Markdown link)
      // Some models return text: "Here is the image: ![alt](url)"
      const textParts = parts.filter(p => p.text).map(p => p.text).join('\n');
      if (textParts) {
        // Check for http link in parens (markdown) or just raw url
        const urlMatch = textParts.match(/https?:\/\/[^\s\)]+(?:\.png|\.jpg|\.jpeg|\.webp)|https?:\/\/oaidalleapiprodscus[^\s\)]+/);
        if (urlMatch) {
          console.log("Found Image URL in text:", urlMatch[0]);
          return urlMatch[0];
        }

        console.warn("Gemini returned text but no image found:", textParts);
      }

      return null;
    } else {
      // Parse OpenAI Response (URL)
      return data.data?.[0]?.url;
    }

    return null;

  } catch (err) {
    console.error("Image Generation Error:", err);
    return null;
  }
};

// Cache Helpers
const CACHE_PREFIX = 'jojo_stand_cache_';
const CACHE_DURATION = 55 * 60 * 1000; // 55 minutes

const getCacheKey = (inputs) => {
  return CACHE_PREFIX + JSON.stringify(inputs);
};

export const getCachedStand = (inputs) => {
  try {
    const key = getCacheKey(inputs);
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const record = JSON.parse(cached);
    const age = Date.now() - record.timestamp;

    if (age > CACHE_DURATION) {
      localStorage.removeItem(key);
      return null;
    }

    console.log("Using cached stand data for:", inputs);
    return record.data;
  } catch (e) {
    console.error("Cache read error:", e);
    return null;
  }
};

export const saveCachedStand = (inputs, data) => {
  try {
    const key = getCacheKey(inputs);
    const record = {
      timestamp: Date.now(),
      data: data
    };
    localStorage.setItem(key, JSON.stringify(record));
    console.log("Saved stand to cache:", inputs);
  } catch (e) {
    console.error("Cache write error:", e);
  }
};
