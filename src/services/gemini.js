const normalizeBaseUrl = (url) => url.replace(/\/+$/, '');
const joinUrl = (baseUrl, path) => `${normalizeBaseUrl(baseUrl)}${path.startsWith('/') ? path : `/${path}`}`;
const getApiKey = () => import.meta.env.VITE_TEXT_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
const getBaseUrl = () => import.meta.env.VITE_TEXT_BASE_URL || import.meta.env.VITE_GEMINI_BASE_URL || 'https://api.bltcy.ai/';
const getTextModel = () => import.meta.env.VITE_TEXT_MODEL || import.meta.env.VITE_GEMINI_MODEL || 'gemini-3-flash-preview';
const isBrowser = () => typeof window !== 'undefined';
const shouldUseGeminiNativeText = (modelId, baseUrl) => {
  const requestedFormat = (import.meta.env.VITE_TEXT_API_FORMAT || import.meta.env.VITE_GEMINI_API_FORMAT || '').toLowerCase();
  if (requestedFormat === 'openai') return false;
  if (/api\.bltcy\.ai/i.test(baseUrl)) return false;
  return modelId.toLowerCase().includes('gemini');
};

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

const toImageDataUrl = (value, mimeType = 'image/png') => {
  if (!value) return null;
  if (/^data:image\/[a-zA-Z0-9.+-]+;base64,/.test(value)) {
    return value;
  }
  return `data:${mimeType};base64,${value}`;
};

const buildEyecatchPrompt = ({
  standName,
  userName,
  song,
  color,
  personality,
  referenceImage,
  visualConcept
}) => {
  const resolvedSong = song || 'an unspecified musical reference';
  const resolvedColor = color || 'bold contrasting palette';
  const resolvedPersonality = personality || 'mysterious psychic tension';
  const resolvedUserName = userName || 'Unknown User';
  const resolvedStandName = standName || 'Unknown Stand';
  const conceptLines = visualConcept ? [
    'Confirmed visual concept from the first design pass:',
    visualConcept.formType ? `- Form type: ${visualConcept.formType}` : null,
    visualConcept.appearance ? `- Appearance: ${visualConcept.appearance}` : null,
    visualConcept.reasoning ? `- Design reason: ${visualConcept.reasoning}` : null,
    'Use this confirmed concept as the main Stand design. Do not replace it with an unrelated character.'
  ].filter(Boolean).join('\n') : null;

  return [
    'An authentic Japanese TV anime Stand eyecatch screenshot, bizarre and stylish action manga aesthetic, classic cel-shading, 16:9 landscape.',
    `User form inputs: Stand user "${resolvedUserName}", Stand name "${resolvedStandName}", music reference "${resolvedSong}", color direction "${resolvedColor}", personality or obsession "${resolvedPersonality}", reference photo: ${referenceImage ? 'yes' : 'no'}. Use these inputs as design DNA, not as visible text.`,
    conceptLines,
    `Background: a flat graphic anime eyecatch backdrop built from ${resolvedColor}, checkerboards, radial bursts, floral or geometric patterns, manga speed lines, halftone dots, and motifs inspired by the music reference and personality.`,
    'Character (one side): design an original psychic guardian Stand directly from the inputs. It may be humanoid, colony-like, wearable, object-bound, creature-like, phenomenon-like, or vehicle/building-bound. Give it a clear silhouette, one or two memorable motifs, a dramatic cropped pose, varied line weight, hard-edge anime shadows, glossy highlights, and a unique color palette.',
    'Layout: place the Stand on one side or diagonally across one side, occupying about 40% to 55% of the frame. Keep the opposite side flatter and cleaner for app overlays.',
    'Overlay-safe zones: leave a clear circular area on the opposite side for a radar chart, plus readable corners for NAME and MASTER text that the app will add later.',
    'Do not draw any text, letters, numbers, subtitles, logos, watermarks, captions, speech bubbles, radar charts, stat wheels, UI borders, buttons, or interface elements. Avoid photorealism, generic fantasy armor, centered portraits, full-body character sheets, vertical compositions, and cluttered item piles.',
    'Vibe: retro TV broadcast quality, high contrast, visually striking composition.'
  ].join('\n\n');
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

const normalizeStandProfile = (profile) => {
  if (!profile || typeof profile !== 'object') return profile;

  if (profile.panel) {
    profile.panel.limitations = [];
  }

  const stats = profile.stats;
  if (!stats || typeof stats !== 'object') return profile;

  const conceptText = [
    profile.type,
    profile.appearance,
    profile.panel?.long_desc,
    profile.panel?.desc
  ].filter(Boolean).join(' ');

  const isHumanoid = /人形| humanoid/i.test(conceptText);
  const isCloseRange = /近距离|近距|近戰|近战|close[-\s]?range/i.test(conceptText);
  const isRemoteOrAutomatic = /远隔|远距离|自动|追踪|群体|现象|领域|绑定|载具|建筑|remote|automatic|colony|phenomenon/i.test(conceptText);

  if (stats.range === 'A' && isCloseRange) {
    stats.range = 'C';
  } else if (stats.range === 'A' && isHumanoid && !isRemoteOrAutomatic) {
    stats.range = 'B';
  }

  return profile;
};

const retryOperation = async (operation, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (err) {
      const message = String(err.message || err);
      if (
        i < retries - 1 &&
        (
          message.includes('Overloaded') ||
          message.includes('503') ||
          message.includes('quota')
        )
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

    const prompt = `你正在为 JOJO 风格作品设计一个全新的替身概念。重点是生成一个可画、具体、有辨识度的替身外观，而不是泛泛的 AI 形容词。

用户输入：
- 替身使者：${inputs.userName || 'Unknown'}
- 音乐/命名来源：${inputs.song || '未指定'}
- 主色调：${inputs.color || '未指定'}
- 性格、欲望或执念：${inputs.personality || '未指定'}
- 是否提供参考图：${inputs.referenceImage ? '是。外观描述应保留参考图带来的轮廓、气质或局部风格暗示，但不要写“参考图”三个字。' : '否'}

设计要求：
1. 替身名应参考音乐/命名来源，符合 JOJO 式命名感。
2. 外观必须结合替身特性：从性格/执念推导能力气质，再选择合适形态。
3. 替身不一定是人形。请在以下形态中选择最适合的一种，不要默认肌肉人型：
   - 人形近距离型：雕像感、面具、异色皮肤、几何纹样、夸张关节。
   - 群体/小型型：多个小型个体、玩偶感、昆虫感、符号化编号。
   - 穿戴/附着型：盔甲、面具、手套、外骨骼、寄生纹路。
   - 器物/道具型：枪、唱片、镜子、锁、车轮、乐器、机械装置等。
   - 生物/怪异型：爬虫、鸟、鱼、植物、骨骼、眼睛、触手等奇妙混合。
   - 现象/领域型：雾、影子、液体、声音波纹、时间裂缝、重力环、光斑。
   - 载具/建筑绑定型：列车、船、房间、门、街灯、舞台等本体即替身。
4. appearance 要像给画师的设计稿摘要，必须包含：形态类别、轮廓、材质、主色、1 到 2 个关键视觉锚点。
5. 避免空泛词：不要只写“神秘、强大、华丽、充满压迫感”。必须写可见物件和可见结构。
6. 不要把齿轮、钟表、眼睛、翅膀等元素无意义堆满；选择少量强视觉符号。
7. appearance 控制在 55 到 90 个中文字符，简洁、具体、便于后续生图。

只返回合法 JSON：
{
  "reasoning": "一句中文设计思路，说明为什么选择这种形态，30字以内",
  "formType": "人形/群体/穿戴/器物/生物/现象/绑定",
  "name": "替身名",
  "appearance": "具体可画的中文外观描述"
}`;

    const apiKey = getApiKey();
    const baseUrl = getBaseUrl();
    const modelId = getTextModel();
    const useProxy = import.meta.env.PROD || !apiKey;

    let response;

    if (useProxy) {
      const proxyBody = { prompt };
      if (import.meta.env.VITE_TEXT_MODEL || import.meta.env.VITE_GEMINI_MODEL) proxyBody.model = modelId;
      response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proxyBody)
      });
    } else {
      const isGemini = shouldUseGeminiNativeText(modelId, baseUrl);
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
      let errorMsg = `API Error ${response.status}: ${errorText}`;
      try {
        const errorJson = JSON.parse(errorText);
        const errorDetail = typeof errorJson.error === 'string'
          ? errorJson.error
          : errorJson.error?.message || JSON.stringify(errorJson.error || errorJson);
        errorMsg = errorJson.code ? `${errorJson.code}: ${errorDetail}` : errorDetail;
      } catch {
        // Keep the raw response text for non-JSON API errors.
      }
      throw new Error(errorMsg);
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
    throw new Error('Please configure VITE_TEXT_API_KEY in your .env file.');
  }

  const baseUrl = getBaseUrl();
  const modelId = getTextModel();

  try {
    let response;
    const useProxy = import.meta.env.PROD || !apiKey;

    if (useProxy) {
      if (import.meta.env.VITE_TEXT_MODEL || import.meta.env.VITE_GEMINI_MODEL) {
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
2. 文案要有规则感和画面感，但不要写成散文或长篇故事。
3. desc 控制在 28 到 45 个字，说明核心能力的本质和效果。
4. long_desc 控制在 120 到 180 个字，包含外观、能力作用机制、主要效果、战斗中的使用方式和危险气质。
5. mechanics 固定保留 4 条，每条 content 控制在 65 到 100 个字。四条标题必须分别是：核心能力、作用机制、战术应用、特殊运用。
6. 每条 mechanics 只写正向能力描述、运作规则和使用方式。
7. limitations 固定返回空数组 []。
8. 能力设计要像 JOJO 替身：规则明确、画面鲜明、可以被聪明利用，不要只是“操控元素/提升力量/瞬间秒杀”。
9. appearance 使用简洁中文，控制在 45 到 80 个字，便于档案展示。
10. stats 必须有取舍，不要全 A。每项只能使用 A、B、C、D、E、?、∞、None。? 表示能力机制导致无法测定；∞ 表示规则层面没有上限或可无限成长/延伸；None 表示该维度不适用。特殊值最多使用 2 项，不要滥用。近距离人形/力量型替身的 range 通常为 C 或 D；普通人形替身 range 不要给 A。只有远隔、自动追踪、群体、现象、领域或绑定型替身才可以给 range A 或 ∞。
11. 不要输出 Markdown，不要加解释。

返回 JSON 结构：
{
  "name": "替身名",
  "type": "替身类型",
  "panel": {
    "abilityName": "能力名",
    "desc": "一句话能力摘要，点明核心规则",
    "long_desc": "较完整的外观、触发方式、效果和危险气质说明",
    "mechanics": [
      {
        "title": "核心能力：xx",
        "content": "写清替身最根本的能力规则、影响对象和直接效果"
      },
      {
        "title": "作用机制：xx",
        "content": "写清能力如何展开、依靠什么媒介或状态运作，以及效果如何持续"
      },
      {
        "title": "战术应用：xx",
        "content": "写清战斗中如何用于控制、突袭、追踪、牵制、防御或改变局面"
      },
      {
        "title": "特殊运用：xx",
        "content": "写清更有 JOJO 感的高阶用法，例如连锁效果、心理压迫、环境利用或伪装"
      }
    ],
    "limitations": [],
    "battleCry": "短战吼",
    "quote": "短台词"
  },
  "stats": {
    "power": "A/B/C/D/E/?/∞/None",
    "speed": "A/B/C/D/E/?/∞/None",
    "range": "A/B/C/D/E/?/∞/None",
    "durability": "A/B/C/D/E/?/∞/None",
    "precision": "A/B/C/D/E/?/∞/None",
    "potential": "A/B/C/D/E/?/∞/None"
  },
  "appearance": "简洁中文外观描述"
}`;

      const isGemini = shouldUseGeminiNativeText(modelId, baseUrl);
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
    return normalizeStandProfile(extractJSON(text));
  } catch (err) {
    console.error('Stand Generation Failed:', err);
    throw err;
  }
};

export const generateStandImage = async ({
  standName,
  userName,
  song,
  color,
  personality,
  referenceImage,
  visualConcept
}) => {
  const apiKey = getApiKey();
  const imageModel = import.meta.env.VITE_IMAGE_MODEL || 'gpt-image-2';
  const imageSize = '1536x1024';
  const imageQuality = 'medium';

  console.log('Generating Image Model:', imageModel);

  const prompt = buildEyecatchPrompt({
    standName,
    userName,
    song,
    color,
    personality,
    referenceImage,
    visualConcept
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
      size: imageSize
    };

    if (isGptImage) {
      body.quality = imageQuality;
      body.size = imageSize;
    }

  }

  try {
    let response;
    const useProxy = import.meta.env.PROD || !imgApiKey;

    if (useProxy) {
      const proxyBody = {
        action: 'image',
        payload: { standName, userName, song, color, personality, referenceImage, visualConcept }
      };

      if (import.meta.env.VITE_IMAGE_MODEL) {
        proxyBody.imageModel = imageModel;
      }

      response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proxyBody)
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
        })
      });
    } else {
      const proxiedImageUrl = getProxyUrl(url, '/__image_api');
      console.log('Using Direct Client-Side Call for Image (Dev Mode)');
      console.log('Image Endpoint:', proxiedImageUrl);
      response = await fetch(proxiedImageUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

    }

    if (!response.ok) {
      const errText = await response.text();
      console.warn('Image Generation Failed:', response.status, errText);
      throw new Error(`Image API Error ${response.status}: ${errText}`);
    }

    const data = await parseJsonResponse(response, 'Image API');
    console.log('--- IMAGE RESPONSE ---', JSON.stringify(data, null, 2));

    if (useProxy) {
      if (data.error) {
        const detail = typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
        throw new Error(`Image API Error: ${detail}`);
      }
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

      throw new Error('Gemini image response did not include image data.');
    }

    const item = data.data?.[0];
    if (item?.b64_json) {
      return toImageDataUrl(item.b64_json, 'image/png');
    }
    if (item?.url) {
      return item.url;
    }
    throw new Error('Image API response did not include an image URL or base64 image.');
  } catch (err) {
    console.error('Image Generation Error:', err);
    throw err;
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
