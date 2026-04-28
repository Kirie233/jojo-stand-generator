const normalizeBaseUrl = (url) => url.replace(/\/+$/, '');
const joinUrl = (baseUrl, path) => `${normalizeBaseUrl(baseUrl)}${path.startsWith('/') ? path : `/${path}`}`;
const getApiKey = () => import.meta.env.VITE_GEMINI_API_KEY;
const getBaseUrl = () => import.meta.env.VITE_GEMINI_BASE_URL || 'https://api.bltcy.ai/';
const isBrowser = () => typeof window !== 'undefined';

const getProxyUrl = (targetUrl, proxyPrefix) => {
  if (!isBrowser() || import.meta.env.PROD) {
    return targetUrl;
  }

  const parsed = new URL(targetUrl, window.location.origin);
  if (parsed.origin === window.location.origin) {
    return targetUrl;
  }

  const normalizedPath = parsed.pathname.replace(/^\/+/, '/');
  return `${proxyPrefix}${normalizedPath}${parsed.search}`;
};

const parseJsonResponse = async (response, label) => {
  const rawText = await response.text();
  if (!rawText) {
    return {};
  }

  try {
    return JSON.parse(rawText);
  } catch {
    const preview = rawText.slice(0, 200).replace(/\s+/g, ' ').trim();
    throw new Error(`${label} returned non-JSON response (${response.status}): ${preview}`);
  }
};

const shouldRetryWithoutImageResponseFormat = (response, text) => (
  response.status === 400 &&
  /response_format|unsupported|unknown|invalid/i.test(text || '')
);

const toImageDataUrl = (value, mimeType = 'image/png') => {
  if (!value) return null;
  if (/^data:image\/[a-zA-Z0-9.+-]+;base64,/.test(value)) {
    return value;
  }
  return `data:${mimeType};base64,${value}`;
};

const buildEyecatchPrompt = ({
  appearance,
  standName,
  userName,
  song,
  color,
  personality,
  referenceImage
}) => {
  const resolvedSong = song || 'an unspecified musical reference';
  const backgroundStyle = `${color || 'bold contrasting'} radial burst with retro TV scanline texture, manga speed lines, and a dramatic mood shaped by ${personality || 'mysterious psychic tension'}, inspired by ${resolvedSong}`;
  const referenceNote = referenceImage
    ? 'The user also provided a reference photo; preserve any distinctive silhouette, facial impression, or styling cues already reflected in the stand concept.'
    : 'No reference photo was provided.';

  return `Authentic Japanese TV anime eyecatch screenshot, 16:9 landscape composition, bizarre stylish action manga aesthetic, classic anime cel-shading.

Background: ${backgroundStyle}

Story context: The Stand is named "${standName || 'Unknown Stand'}" and belongs to "${userName || 'Unknown User'}". Use this only as design inspiration; do not render any visible text.

Canvas and framing: Wide horizontal 16:9 frame only, landscape orientation, cinematic TV eyecatch. Do not use a vertical poster, portrait crop, phone wallpaper, centered full-body poster, or tall character-card composition.

Character layout: Put the Stand on the left or center-left, occupying about 45% of the frame width. Show the upper body and dynamic silhouette cropped naturally by the wide frame. Leave the right half and lower corners cleaner and darker as negative space for later UI overlay.

Character: A highly stylized psychic guardian avatar, ${appearance}. The design should channel the emotional and symbolic feel of the music reference "${resolvedSong}" and the user's inner drive "${personality || 'mysterious resolve'}". ${referenceNote} Striking an exaggerated, bizarre, dynamic pose. Varied line weight, distinct hard-edge anime shadows, unique palette.

Graphic direction: Use the full horizontal canvas with sweeping speed lines and background energy extending across the width. Suggest the mood of a circular stat chart area using composition only. Do not draw an actual radar chart, labels, numbers, rings, UI boxes, or typography. The right side may contain subtle glow, framing, or empty spotlight space where a stat panel could be overlaid later.

Constraints: NO text, NO letters, NO words, NO numbers, NO subtitles, NO logos, NO watermarks, NO captions, NO radar chart, NO stat wheel, NO interface elements, NO embedded nameplates. Keep the composition readable and leave overlay-safe empty space.

Vibe: Retro TV broadcast quality, high contrast, visually striking wide composition.`;
};

export const generateStandProfile = async (inputs, premadeConcept = null) => {
  return retryOperation(() => _generateStandProfile(inputs, premadeConcept));
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const stripCodeFences = (text) => {
  const trimmed = text.trim();
  if (!trimmed.startsWith('```')) {
    return trimmed;
  }

  return trimmed
    .replace(/^```[a-zA-Z0-9_-]*\s*/, '')
    .replace(/\s*```$/, '')
    .trim();
};

const escapeInnerQuotesInJsonStrings = (text) => {
  let result = '';
  let inString = false;
  let escaping = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (escaping) {
      result += char;
      escaping = false;
      continue;
    }

    if (char === '\\') {
      result += char;
      escaping = true;
      continue;
    }

    if (char === '"') {
      if (!inString) {
        inString = true;
        result += char;
        continue;
      }

      let j = i + 1;
      while (j < text.length && /\s/.test(text[j])) {
        j++;
      }

      const nextChar = text[j];
      if (nextChar === ',' || nextChar === '}' || nextChar === ']' || nextChar === ':') {
        inString = false;
        result += char;
      } else {
        result += '\\"';
      }
      continue;
    }

    result += char;
  }

  return result;
};

const parseJsonCandidate = (text) => {
  const normalized = stripCodeFences(text);

  try {
    return JSON.parse(normalized);
  } catch {
    return JSON.parse(escapeInnerQuotesInJsonStrings(normalized));
  }
};

const extractJSON = (text) => {
  try {
    const normalizedText = stripCodeFences(text);
    const jsonStart = normalizedText.indexOf('{');
    const jsonEnd = normalizedText.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1) throw new Error('No JSON found');

    const candidate = normalizedText.substring(jsonStart, jsonEnd + 1);
    try {
      return parseJsonCandidate(candidate);
    } catch (e) {
      let depth = 0;
      let start = -1;
      for (let i = 0; i < normalizedText.length; i++) {
        if (normalizedText[i] === '{') {
          if (depth === 0) start = i;
          depth++;
        } else if (normalizedText[i] === '}') {
          depth--;
          if (depth === 0 && start !== -1) {
            return parseJsonCandidate(normalizedText.substring(start, i + 1));
          }
        }
      }
      throw e;
    }
  } catch (err) {
    console.error('JSON Extraction Failed:', err, '\nRaw Text:', text);
    throw new Error('API returned an invalid JSON payload.');
  }
};

const retryOperation = async (operation, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (err) {
      if (
        i < retries - 1 &&
        (err.message.includes('Overloaded') || err.message.includes('503') || err.message.includes('quota'))
      ) {
        console.warn(`API Overloaded. Retrying in ${(i + 1) * 2}s...`);
        await sleep((i + 1) * 2000);
        continue;
      }
      throw err;
    }
  }
};

/**
 * PHASE 1: Fast Visual Concept
 * Returns just Name and Appearance prompt to kick off image gen ASAP.
 */
export const generateFastVisualConcept = async (inputs) => {
  return retryOperation(async () => {
    console.log('Phase 1 Inputs:', inputs);

    const prompt = `你正在为 JOJO 风格作品设计一个全新的替身概念。

用户信息：
- 音乐引用：${inputs.song}
- 主色调：${inputs.color}
- 性格/执念：${inputs.personality}

要求：
1. 生成一个有辨识度、带有 JOJO 气质的替身概念。
2. 替身名应参考音乐引用，符合 JOJO 式命名感觉。
3. 替身不局限于人形，也可以是群体、器物、穿戴型、生物、现象或载具。
4. appearance 字段将直接用于后续生图，请用简洁中文描述外观。
5. appearance 控制在 45 到 80 个中文字符，突出轮廓、材质、配色和1到2个关键特征，不要写成长段说明。

只返回 JSON：
{
  "reasoning": "一句中文设计思路，20字内",
  "name": "替身名",
  "appearance": "简洁中文外观描述"
}`;

    const apiKey = getApiKey();
    const baseUrl = getBaseUrl();
    const modelId = import.meta.env.VITE_GEMINI_MODEL || 'gemini-3-flash-preview';
    const useProxy = import.meta.env.PROD || !apiKey;

    let response;

    if (useProxy) {
      const proxyBody = { prompt };
      if (import.meta.env.VITE_GEMINI_MODEL) proxyBody.model = modelId;
      response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proxyBody)
      });
    } else {
      const isGemini = modelId.toLowerCase().includes('gemini');
      let directUrl;
      let headers;
      let body;

      if (isGemini) {
        directUrl = `${joinUrl(baseUrl, `/v1beta/models/${modelId}:generateContent`)}?key=${apiKey}`;
        headers = { 'Content-Type': 'application/json' };
        body = { contents: [{ parts: [{ text: prompt }] }] };
      } else {
        directUrl = joinUrl(baseUrl, '/v1/chat/completions');
        headers = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        };
        body = {
          model: modelId,
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' }
        };
      }

      const proxiedUrl = getProxyUrl(directUrl, '/__text_api');
      console.log('[Phase 1] Direct Call to:', proxiedUrl.replace(apiKey, '***'));
      response = await fetch(proxiedUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Phase 1] API Error Details:', response.status, errorText);
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(errorJson.error || 'Fast Visual Concept Failed');
      } catch (e) {
        if (e.message.includes('Fast Visual Concept')) throw e;
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }
    }

    const data = await response.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text && data.choices?.[0]?.message?.content) {
      text = data.choices[0].message.content;
    }
    if (!text) throw new Error('API response is empty');

    const result = extractJSON(text);
    console.log('[Phase 1] JSON Result:', result);
    return result;
  });
};

const _generateStandProfile = async (inputs, premadeConcept = null) => {
  const apiKey = getApiKey();

  if (!import.meta.env.PROD && !apiKey) {
    throw new Error('Please configure VITE_GEMINI_API_KEY in your .env file.');
  }

  const baseUrl = getBaseUrl();
  const modelId = import.meta.env.VITE_GEMINI_MODEL || 'gemini-3-flash-preview';

  try {
    let response;
    const useProxy = import.meta.env.PROD || !apiKey;

    if (useProxy) {
      if (import.meta.env.VITE_GEMINI_MODEL) {
        response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'profile',
            textModel: modelId,
            payload: { ...inputs, userName: inputs.userName || 'Unknown', referenceImage: inputs.referenceImage }
          })
        });
      } else {
        response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'profile',
            payload: { ...inputs, userName: inputs.userName || 'Unknown', referenceImage: inputs.referenceImage }
          })
        });
      }
    } else {
      const systemPrompt = `你是 JOJO 风格替身档案撰写器。使用简洁、清晰、偏百科的中文口吻，返回合法 JSON。`;

      const userPromptText = `
请基于以下信息生成一个 JOJO 风格替身档案：

[输入信息]
- 替身使者：${inputs.userName || 'Unknown'}
- 命名来源：${inputs.song}
- 主色调：${inputs.color}
- 性格/执念：${inputs.personality}
${premadeConcept ? `- 已确认概念：替身名“${premadeConcept.name}”，外观“${premadeConcept.appearance}”。请在此基础上完善。` : ''}
${inputs.referenceImage ? '- 用户上传了参考图，请把能识别出的轮廓、气质或局部特征融入外观描述。' : ''}

输出要求：
1. 所有字段都用中文输出。
2. 文案要短，不要写成长段。
3. desc 控制在 18 到 30 个字。
4. long_desc 控制在 60 到 100 个字。
5. mechanics 只保留 2 条，每条 content 控制在 35 到 60 个字。
6. limitations 只保留 2 条，每条尽量一句话。
7. appearance 使用简洁中文，控制在 45 到 80 个字，便于后续生图。
8. 不要输出 Markdown，不要加解释。

返回 JSON 结构：
{
  "name": "替身名",
  "type": "替身类型",
  "panel": {
    "abilityName": "能力名",
    "desc": "一句话能力摘要",
    "long_desc": "简洁的外观与能力说明",
    "mechanics": [
      {
        "title": "核心能力：xx",
        "content": "简洁说明"
      },
      {
        "title": "衍生应用：xx",
        "content": "简洁说明"
      }
    ],
    "limitations": [
      "限制一",
      "限制二"
    ],
    "battleCry": "短战吼",
    "quote": "短台词"
  },
  "stats": {
    "power": "A/B/C/D/E/None",
    "speed": "A/B/C/D/E/None",
    "range": "A/B/C/D/E/None",
    "durability": "A/B/C/D/E/None",
    "precision": "A/B/C/D/E/None",
    "potential": "A/B/C/D/E/None"
  },
  "appearance": "简洁中文外观描述"
}`;

      const isGemini = modelId.toLowerCase().includes('gemini');
      let requestUrl;
      let headers;
      let body;

      if (isGemini) {
        requestUrl = `${joinUrl(baseUrl, `/v1beta/models/${modelId}:generateContent`)}?key=${apiKey}`;
        headers = { 'Content-Type': 'application/json' };

        const parts = [{ text: userPromptText }];
        if (inputs.referenceImage) {
          const base64Data = inputs.referenceImage.split(',')[1];
          const mimeType = inputs.referenceImage.split(';')[0].split(':')[1];
          parts.push({
            inlineData: {
              mimeType,
              data: base64Data
            }
          });
        }

        body = { contents: [{ parts }] };
      } else {
        requestUrl = joinUrl(baseUrl, '/v1/chat/completions');
        headers = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        };

        const userContentVector = [{ type: 'text', text: userPromptText }];
        if (inputs.referenceImage) {
          userContentVector.push({
            type: 'image_url',
            image_url: { url: inputs.referenceImage }
          });
        }

        body = {
          model: modelId,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userContentVector }
          ],
          response_format: { type: 'json_object' }
        };
      }

      const proxiedUrl = getProxyUrl(requestUrl, '/__text_api');
      console.log('Using Direct Client-Side Call for Text');
      console.log('Current Model ID:', modelId);
      console.log('Request URL (masked):', proxiedUrl.replace(apiKey, '***'));
      response = await fetch(proxiedUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });
    }

    if (!response.ok) {
      const errorRaw = await response.text();
      let errorMsg = `Status ${response.status} `;
      try {
        const errorJson = JSON.parse(errorRaw);
        const detail = errorJson.error?.message || '';
        if (detail.includes('quota exhausted') || detail.includes('RemainQuota')) {
          throw new Error('API quota exhausted. Please check your remaining balance.');
        }
        errorMsg = JSON.stringify(errorJson, null, 2);
      } catch (e) {
        if (e.message.startsWith('API quota')) throw e;
        errorMsg = errorRaw;
      }
      throw new Error(`Gemini API Error: ${errorMsg}`);
    }

    const data = await response.json();
    console.log('--- RAW API RESPONSE (DEBUG) ---');
    console.log(data);

    let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text && data.choices?.[0]?.message?.content) {
      console.log('Detected OpenAI-style response format');
      text = data.choices[0].message.content;
    }

    if (!text) throw new Error('API response is empty or has unrecognized format. Check console logs.');
    return extractJSON(text);
  } catch (err) {
    console.error('Stand Generation Failed:', err);
    throw err;
  }
};

export const generateStandImage = async ({
  appearance,
  standName,
  userName,
  song,
  color,
  personality,
  referenceImage
}) => {
  console.log('Phase 2 Appearance Input:', appearance);
  const apiKey = getApiKey();
  const imageModel = import.meta.env.VITE_IMAGE_MODEL || 'gpt-image-2';
  const imageSize = import.meta.env.VITE_IMAGE_SIZE || '1536x1024';
  const imageQuality = import.meta.env.VITE_IMAGE_QUALITY || 'medium';

  console.log('Generating Image Model:', imageModel);

  const prompt = buildEyecatchPrompt({
    appearance,
    standName,
    userName,
    song,
    color,
    personality,
    referenceImage
  });

  console.log('[Phase 2] FINAL IMAGE PROMPT:\n', prompt);

  const isGemini = imageModel.toLowerCase().includes('gemini');
  const isGptImage = imageModel.toLowerCase().includes('gpt-image');

  const imgApiKey = import.meta.env.VITE_IMAGE_API_KEY || apiKey;
  const imgBaseUrl = import.meta.env.VITE_IMAGE_BASE_URL || 'https://api.bltcy.ai/';

  let url;
  let body;
  let headers;

  if (!isGemini) {
    url = joinUrl(imgBaseUrl, '/v1/images/generations');
    headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${imgApiKey}`
    };
    body = {
      model: imageModel,
      prompt,
      n: 1,
      size: imageSize,
      response_format: 'b64_json'
    };

    if (isGptImage) {
      body.quality = imageQuality;
      body.size = imageSize;
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000);

  try {
    let response;
    const useProxy = import.meta.env.PROD || !imgApiKey;

    if (useProxy) {
      const proxyBody = {
        action: 'image',
        payload: { appearance, standName, userName, song, color, personality, referenceImage }
      };

      if (import.meta.env.VITE_IMAGE_MODEL) {
        proxyBody.imageModel = imageModel;
      }
      proxyBody.imageSize = imageSize;
      proxyBody.imageQuality = imageQuality;

      response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proxyBody),
        signal: controller.signal
      });
    } else if (isGemini) {
      const geminiUrl = joinUrl(imgBaseUrl, `/v1beta/models/${imageModel}:generateContent`);
      const proxiedGeminiUrl = getProxyUrl(geminiUrl, '/__image_api');
      console.log('Using Direct Gemini Image Call (Dev Mode):', proxiedGeminiUrl);
      response = await fetch(proxiedGeminiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': imgApiKey
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
          ]
        }),
        signal: controller.signal
      });
    } else {
      const proxiedImageUrl = getProxyUrl(url, '/__image_api');
      console.log('Using Direct Client-Side Call for Image (Dev Mode)');
      console.log('Image Endpoint:', proxiedImageUrl);
      response = await fetch(proxiedImageUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: controller.signal
      });

      if (!response.ok && body.response_format) {
        const retryText = await response.clone().text();
        if (shouldRetryWithoutImageResponseFormat(response, retryText)) {
          console.warn('Image API does not support response_format=b64_json; retrying without it.');
          const retryBody = { ...body };
          delete retryBody.response_format;
          response = await fetch(proxiedImageUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(retryBody),
            signal: controller.signal
          });
        }
      }
    }

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      console.warn('Image Generation Failed:', response.status, errText);
      return null;
    }

    const data = await parseJsonResponse(response, 'Image API');
    console.log('--- IMAGE RESPONSE ---', JSON.stringify(data, null, 2));

    if (useProxy) {
      return data.imageData || null;
    }

    if (isGemini) {
      const candidate = data.candidates?.[0];
      if (candidate?.finishReason) {
        console.log('Gemini Finish Reason:', candidate.finishReason);
      }

      const parts = candidate?.content?.parts || [];
      console.log('Response Parts Count:', parts.length);

      const imagePart = parts.find((p) => (p.inline_data && p.inline_data.data) || (p.inlineData && p.inlineData.data));
      if (imagePart) {
        const dataObj = imagePart.inline_data || imagePart.inlineData;
        const mimeType = dataObj.mime_type || dataObj.mimeType || 'image/jpeg';
        console.log('Found Image in parts (Base64)');
        return toImageDataUrl(dataObj.data, mimeType);
      }

      const textParts = parts.filter((p) => p.text).map((p) => p.text).join('\n');
      if (textParts) {
        const urlMatch = textParts.match(/https?:\/\/[^\s)]+(?:\.png|\.jpg|\.jpeg|\.webp)|https?:\/\/oaidalleapiprodscus[^\s)]+/);
        if (urlMatch) {
          console.log('Found Image URL in text:', urlMatch[0]);
          return urlMatch[0];
        }
        console.warn('Gemini returned text but no image found:', textParts);
      }

      return null;
    }

    const item = data.data?.[0];
    if (item?.b64_json) {
      return toImageDataUrl(item.b64_json, 'image/png');
    }
    return item?.url;
  } catch (err) {
    console.error('Image Generation Error:', err);
    return null;
  }
};

const CACHE_PREFIX = 'jojo_stand_cache_';
const CACHE_DURATION = 55 * 60 * 1000;

const serializeReferenceImage = (referenceImage) => {
  if (!referenceImage) return null;
  return `img:${referenceImage.length}:${referenceImage.slice(0, 32)}:${referenceImage.slice(-32)}`;
};

const getCacheKey = (inputs) => {
  const normalizedInputs = {
    userName: inputs.userName || '',
    song: inputs.song || '',
    color: inputs.color || '',
    personality: inputs.personality || '',
    referenceImage: serializeReferenceImage(inputs.referenceImage)
  };
  return CACHE_PREFIX + JSON.stringify(normalizedInputs);
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

    console.log('Using cached stand data for:', inputs);
    return record.data;
  } catch (e) {
    console.error('Cache read error:', e);
    return null;
  }
};

export const saveCachedStand = (inputs, data) => {
  try {
    if (data?.imageUrl?.startsWith('data:image/')) {
      console.log('Skipping localStorage cache for inline image data.');
      return;
    }

    const key = getCacheKey(inputs);
    const record = {
      timestamp: Date.now(),
      data
    };
    localStorage.setItem(key, JSON.stringify(record));
    console.log('Saved stand to cache:', inputs);
  } catch (e) {
    console.error('Cache write error:', e);
  }
};
