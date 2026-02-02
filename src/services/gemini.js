const getApiKey = () => import.meta.env.VITE_GEMINI_API_KEY;
const getBaseUrl = () => import.meta.env.VITE_GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com';

export const generateStandProfile = async (inputs) => {
  return retryOperation(() => _generateStandProfile(inputs));
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const retryOperation = async (operation, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (err) {
      if (
        i < retries - 1 &&
        (err.message.includes("Overloaded") || err.message.includes("503") || err.message.includes("quota"))
      ) {
        console.warn(`API Overloaded. Retrying in ${(i + 1) * 2}s...`);
        await sleep((i + 1) * 2000);
        continue;
      }
      throw err;
    }
  }
};

const _generateStandProfile = async (inputs) => {
  const apiKey = getApiKey();

  // Only enforce API Key in Development (Client-side)
  // In Production, we use the backend proxy which has its own key.
  if (!import.meta.env.PROD && !apiKey) {
    throw new Error("请在 .env 文件中配置 VITE_GEMINI_API_KEY");
  }

  const { song, color, personality } = inputs;



  const baseUrl = getBaseUrl();
  const modelId = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash';
  const url = `${baseUrl}/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

  console.log("Current Model ID:", modelId);
  console.log("Request URL (masked):", url.replace(apiKey, '***'));

  const prompt = `你是一位《JOJO的奇妙冒险》替身设计专家。请根据以下用户特征，为一个新人类设计一个独特的替身(Stand)。

  用户特征:
  1. 音乐引用(决定命名): "${song}"
  2. 代表色(决定视觉): "${color}"
  3. 精神特质 / 欲望(决定能力核心): "${personality}"

    请返回一个合法的 JSON 对象(不要使用 Markdown 代码块)，包含以下字段:
  {
    "name": "替身名 (基于音乐引用的日文片假名或英文，并附带帅气的中文译名，例如 'Killer Queen (杀手皇后)')",
      "abilityName": "能力名 (汉字，如 '败者食尘')",
        "ability": "能力详细描述。必须基于'${personality}'设计。请使用以下格式：\n【能力概述】简短一句话。\n【详细机制】具体的发动条件和效果。\n【限制/代价】能力使用的弱点或风险 (JOJO的替身都有局限性)。",
          "stats": {
      "power": "评级 (A=极强, B=强, C=普通, D=弱, E=极弱, None=无, ∞=无限)。⚠️严禁全A面板！必须遵循等价交换原则：强力能力(A)必须伴随弱项(D/E/None)。请大胆使用 D 和 E 甚至 None。",
        "speed": "评级",
          "range": "评级",
            "durability": "评级",
              "precision": "评级",
                "potential": "成长性 (体现未来的可能性)"
    },
    "appearance": "基于'${color}'色调的详细外貌描述，包含服装、机械或生物特征，用于后续绘画。注意：不要描述任何文字、字母、符号或纹身在替身身上，保持外表纯净。",
      "shout": "替身吼叫 (如 ORA ORA, ARI ARI, 或与能力相关的独特声音)"
  }
  `;

  try {
    let response;

    // HYBRID STRATEGY: Prefer Direct Call if Key exists to reduce Serverless usage
    const useDirectCall = !!apiKey;

    if (!useDirectCall && import.meta.env.PROD) {
      // --- PRODUCTION: Use Serverless Proxy (Secure) ---
      response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'profile',
          payload: { ...inputs, userName: inputs.userName || 'Unknown', referenceImage: inputs.referenceImage }
        })
      });
    } else {
      // --- DIRECT CLIENT-SIDE CALL ---

      const systemPrompt = `你是一位《JOJO的奇妙冒险》替身设计专家。请设计一个符合JOJO世界观的替身(Stand)。\n要求：能力设计要有创意且易于理解，符合荒木飞吕彦的风格。\n请返回一个合法的 JSON 对象。`;
      const userPromptText = `
  用户特征:
  1. 替身使者: "${inputs.userName || 'Unknown'}"
  2. 音乐引用(决定命名): "${inputs.song}"
  3. 代表色(决定视觉): "${inputs.color}"
  4. 精神特质 / 欲望(决定能力核心): "${inputs.personality}"
        ${inputs.referenceImage ? "5. [重要] 请参考我提供的图片，将其中的视觉元素（如服装风格、姿势、物品）融入到替身的外貌描述中。" : ""}

        请返回 JSON:
  {
    "name": "替身名 (音乐引用+译名)",
      "abilityName": "能力名",
        "ability": "能力详细描述。基于'${inputs.personality}' ${inputs.referenceImage ? "并结合参考图特征" : ""} 设计。请严格遵守格式：\n【能力概述】...\n【详细机制】...\n【限制/代价】...",
          "stats": { 
            "power": "评级 (A=极强, B=强, C=普通, D=弱, E=极弱, None=无, ∞=无限)。⚠️严禁全A面板！必须遵循等价交换原则：强力能力(A)必须伴随弱项(D/E/None)。请大胆使用 D 和 E 甚至 None，特别是对于非战斗型替身。", 
            "speed": "评级", "range": "评级", "durability": "评级", "precision": "评级", "potential": "评级" 
          },
    "appearance": "基于'${inputs.color}'色调${inputs.referenceImage ? "及参考图视觉元素" : ""}的详细外貌描述",
      "shout": "替身吼叫"
  }
  `;

      const isGemini = modelId.toLowerCase().includes('gemini');
      let requestUrl, headers, body;

      if (isGemini) {
        requestUrl = `${baseUrl}/v1beta/models/${modelId}:generateContent?key=${apiKey}`;
        headers = { 'Content-Type': 'application/json' };

        // Gemini Multimodal Format
        const parts = [{ text: userPromptText }];
        if (inputs.referenceImage) {
          // inputs.referenceImage is "data:image/jpeg;base64,..."
          // Gemini needs raw base64 without prefix
          const base64Data = inputs.referenceImage.split(',')[1];
          const mimeType = inputs.referenceImage.split(';')[0].split(':')[1];
          parts.push({
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          });
        }
        body = { contents: [{ parts: parts }] };

      } else {
        // OpenAI Compatible Multimodal
        // Many proxies support standard OpenAI "image_url"
        requestUrl = `${baseUrl}/v1/chat/completions`;
        headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        };

        const userContentVector = [{ type: "text", text: userPromptText }];
        if (inputs.referenceImage) {
          userContentVector.push({
            type: "image_url",
            image_url: { url: inputs.referenceImage }
          });
        }

        body = {
          model: modelId,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userContentVector }
          ],
          response_format: { type: "json_object" }
        };
      }

      console.log("Using Direct Client-Side Call for Text");
      response = await fetch(requestUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body)
      });
    }

    if (!response.ok) {
      const errorRaw = await response.text();
      let errorMsg = `Status ${response.status} `;
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
      throw new Error(`Gemini API Error: ${errorMsg} `);
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

  const prompt = `(Masterpiece, Best Quality), Jojo's Bizarre Adventure Stand, art by Araki Hirohiko. ${appearance}. \n\nCOMPOSITION: Epic full body shot, Dynamic 'JoJo Pose'. \n\nBACKGROUND: Cinematic Atmosphere, Scenery linked to the Stand's ability (e.g. burning city, frozen wasteland, clock tower, cosmic void, biomechanical lab), Dramatic Lighting, Depth of Field. \n\nStyle tags: Anime Character Sheet, Thick Black Lines, Heavy Hatching, Hyper-muscular, Vibrant Colors, Movie Poster aesthetic. No humans, focus on the Stand entity. \n\nNEGATIVE PROMPT: text, letters, watermark, signature, username, ui, interface, speech bubble, caption, logo, low quality, pixelated.`;

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
  const timeoutId = setTimeout(() => controller.abort(), 120000); // 120s timeout (Images can be slow)

  try {
    let response;

    // HYBRID STRATEGY:
    // 1. If we have a local Key (VITE_...), use Client-Side Call (Fast, avoids Vercel 10s/30s Timeout limit).
    // 2. If no local Key, use Backend Proxy (Secure, but subject to Vercel Hobby Timeout limits).
    const useDirectCall = !!imgApiKey;

    if (!useDirectCall && import.meta.env.PROD) {
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
      // --- DIRECT CLIENT-SIDE CALL (Dev or Prod with Key) ---
      console.log("Using Direct Client-Side Call for Image (Bypassing Proxy Timeout)");
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
