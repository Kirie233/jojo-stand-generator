const getApiKey = () => import.meta.env.VITE_GEMINI_API_KEY;
const getBaseUrl = () => import.meta.env.VITE_GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com';

export const generateStandProfile = async (inputs, premadeConcept = null) => {
  return retryOperation(() => _generateStandProfile(inputs, premadeConcept));
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const extractJSON = (text) => {
  try {
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1) throw new Error("No JSON found");

    // Attempt simple extract first
    const candidate = text.substring(jsonStart, jsonEnd + 1);
    try {
      return JSON.parse(candidate);
    } catch (e) {
      // If simple fails, try to find the first complete object
      // (Handles cases where there's junk AFTER the main JSON)
      let depth = 0;
      let start = -1;
      for (let i = 0; i < text.length; i++) {
        if (text[i] === '{') {
          if (depth === 0) start = i;
          depth++;
        } else if (text[i] === '}') {
          depth--;
          if (depth === 0 && start !== -1) {
            return JSON.parse(text.substring(start, i + 1));
          }
        }
      }
      throw e; // Re-throw if loop fails
    }
  } catch (err) {
    console.error("JSON Extraction Failed:", err, "\nRaw Text:", text);
    throw new Error("API 返回了无法解析的格式 (JSON Error)");
  }
};

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

/**
 * PHASE 1: Fast Visual Concept
 * Returns just Name and Appearance prompt to kick off image gen ASAP.
 */
export const generateFastVisualConcept = async (inputs) => {
  return retryOperation(async () => {
    console.log("🚀 [Phase 1] Inputs:", inputs);

    // HYBRID STRATEGY: 
    // PROD: Always use Serverless Proxy (Secure)
    // DEV: Prefer Direct Client-Side Call if Key exists (Fast Debugging)
    let apiKey = '';
    let baseUrl = '';
    let modelId = 'gemini-2.0-flash';
    let useDirectCall = false;

    if (import.meta.env.DEV) {
      apiKey = getApiKey();
      baseUrl = getBaseUrl();
      // Default to flash for speed in Phase 1
      modelId = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash';
      useDirectCall = !!apiKey;
    }

    // --- PROMPT CONSTRUCTION (Shared Logic) ---
    const prompt = `你是一位高效的替身设计助手。请基于以下用户特征，用**最简洁**的语言总结出替身的“名字”和“详细外貌描述”。
    
    用户特征:
    1. 引用: "${inputs.song}"(可能暗示了外形，如Aerosmith->飞机)
    2. 色调: "${inputs.color}"
    3. 特质: "${inputs.personality}"(贪婪->群体型? 暴力->力量型? 阴险->远距离型?)

    **核心任务：请先分析【特质】与【歌曲暗示】，智能决定最匹配的替身形态（不局限于人形！）。**
    - 如果特质是“守护/复仇”，可能是**铠甲/穿戴型**。
    - 如果特质是“收集/扩散”，可能是**群体型/现象型**。
    - 如果特质是“精准/暗杀”，可能是**器物/机械型**。
    - 如果输入包含“载具/建筑/巨大”概念，务必设计为**凭依型/巨物型 (Bound Type)** (如一艘船、一辆车、一座塔)。
    - 只有当特质是“直接战斗/压倒性力量”时，才设计为**强壮的人形**。

    要求：
    1. 名字 must comply with JOJO style.
    2. 外貌描述要包含比例、材质、基于'${inputs.color}'制定的装饰，直接描述视觉特征，不要描述文字或符号。
    3. **头部设计特别指令**：
       - **仅当**判定为[强壮人形]时，头部设计应多样化：可参考**古典雕塑(希腊像)**、**机械面具(无机质)**、或**抽象几何(面部有条纹/拉链/网格)**。重要的是**荒木线(Araki Lines)**的阴影刻画，而非模仿特定角色。
       - **如果是[群体型/小器物]**，头部必须参考《性感手枪》或《收成者》，设计为**卡通/吉祥物**风格，严禁写实人脸！
    4. **创新性**：如果特质非常独特，请大胆设计非人型（如一本书、一艘船、一团烟雾）。

    只需返回以下 JSON (严禁 Markdown 代码块):
    {
      "reasoning": "简短分析思路...",
      "name": "替身名 (中英文)",
      "appearance": "[TYPE: 请在此处大写填入类型] 详细且具体的绘画提示描述..."
    }`;

    if (!useDirectCall) {
      // --- PRODUCTION: Use Serverless Proxy (Secure) ---
      const url = '/api/gemini';
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt, // ✅ FIX: Now sending the FULL prompt, not just inputs.song
          // ⚠️ FIX: Do NOT send modelId if we are in Prod and it's just a default.
          // Let the Backend use its own GEMINI_MODEL env var.
          model: useDirectCall ? modelId : undefined
        })
      });

      const isGemini = modelId.toLowerCase().includes('gemini');
      let requestUrl, headers, body;

      if (isGemini) {
        requestUrl = `${baseUrl}/v1beta/models/${modelId}:generateContent?key=${apiKey}`;
        headers = { 'Content-Type': 'application/json' };
        body = {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            response_mime_type: "application/json"
          }
        };
      } else {
        requestUrl = `${baseUrl}/v1/chat/completions`;
        headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        };
        body = {
          model: modelId,
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" }
        };
      }

      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Direct API Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || data.choices?.[0]?.message?.content;
      if (!text) throw new Error("API response is empty");

      const result = extractJSON(text);
      console.log("📝 [Phase 1] JSON Result:", result);
      return result;
    }
  });
};

const _generateStandProfile = async (inputs, premadeConcept = null) => {
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

  ⚠️ 命名规则（智能转化）：
  - 如果用户输入的是【专辑名】或【歌曲名】，请直接使用或微调作为替身名。
  - **重要：如果用户输入的是【歌手/乐队名】（如 Michael Jackson, 周杰伦），请不要直接用人名！请从该歌手的作品中，挑选一首最符合用户设定色彩"${color}"和特质"${personality}"的【歌曲】或【专辑】作为替身名。**
  - 替身名必须符合 JOJO 的摇滚/流行音乐引用风格。

    请返回一个合法的 JSON 对象(不要使用 Markdown 代码块)，包含以下字段:
  {
    "name": "替身名 (基于音乐引用的日文片假名或英文，并附带帅气的中文译名。例如输入'Michael Jackson'且特质为'危险'，可命名为 'Smooth Criminal (犯罪高手)' 或 'Dangerous (危险之旅)')",
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

      const systemPrompt = `你是一位严谨的《JOJO的奇妙冒险》替身数据录入员，正在为“JOJO百科 (JoJo Wiki)”撰写词条。
你的任务是基于用户提供的关键词，生成一份**专业、客观且详实**的替身档案。

核心写作风格严格参照【白金之星】的百科词条：
1. **百科全书口吻**：使用第三人称。语气客观、冷静，避免过多的主观修饰（如“太强了”、“无敌”），而是通过**具体的表现描写**来体现强大。例如：“能够徒手接住近距离发射的子弹”、“视力足以在照片中分辨出苍蝇”。
2. **精确的术语**：在描述属性时，使用标准的JOJO术语（如：破坏力、速度、射程距离、持续力、精密动作性、成长性）。
3. **能力深度解析**：不要只写“控制火”，要写出**机制**（例如：“能够随意控制热能的流动，将接触物体的温度瞬间提升至燃点”）。
4. **结构化描述**：将能力拆解为【基本能力】和【衍生应用】，条理清晰。`;


      const userPromptText = `
  请基于以下数据，生成一份标准的【JOJO百科替身词条】：

  【档案元数据】
  1. 替身使者 (User): "${inputs.userName || 'Unknown'}"
  2. 命名来源 (Name Origin): "${inputs.song}" (由此决定替身名)
  3. 视觉色调 (Color): "${inputs.color}"
  4. 核心欲望 (Core Desire): "${inputs.personality}" (由此推导能力机制)
  ${premadeConcept ? `5. 已确认概念: 替身名为"${premadeConcept.name}", 基础外观为"${premadeConcept.appearance}"。请在此基础上进行深度百科创作并扩充外貌细节。` : ""}
  ${inputs.referenceImage ? "6. [视觉参考] 请参考附图特征进行外貌描写。" : ""}

  ⚠️ 严格指令：
  1. **能力强度随机化 (Gacha System)**：**严禁将所有替身都设计得很强！** 请模拟“抽卡”体验，替身强度必须在【S级 (时间/因果律)】到【E级 (几乎无用/仅仅是啦啦队)】之间大幅波动。允许生成像“幸存者 (Survivor)”这种对他人都没用甚至对自己有害的弱替身，或者像“嘿呀 (Hey Ya!)”这种只能给人加油的替身。**弱替身也是JOJO世界的重要组成部分。**
  2. **形态多样性**：不要局限于人型！JOJO 的魅力在于不可预测。请根据“宿命特质”自由构筑形态。它可以是：
     - **传统的【人型】** (如白金之星)
     - **【器物/装备型】** (如手枪、飞机、书本)
     - **【穿戴一体型】** (像铠甲或紧身衣一样穿在本体身上，如白色相簿)
     - **【同化型】** (附着在现实物体如船、车、电塔上，如Strength)
     - **【微观群落/群体型】** (由无数小体组成，如收成者)
     - **【现象/空间型】** (如天气、影子、镜中世界)
     **请务必打破常规，创造出令人意想不到的独特存在形式。**
  3. **独立意志与异质性**：请大胆设计具有【自主意识】的替身（如“性感手枪”会对话、有情绪），或是【自动律法型】（如“奇迹与你”代表灾厄本身），甚至【脱离控制型】（如“银色战车镇魂曲”）。替身不一定完全听命于使者，它可能是宿主深层欲望的独立具象化。
  4. **色彩描述禁令**：在描述颜色时，请直接使用具体的色彩名称。**绝对禁止在返回的文本中包含任何十六进制颜色代码 (如 #7B1FA2) 或 RGB 代码。** 保持百科词条的浸入感。
  5. **格式清洗**：返回的 JSON 字段值中**绝对禁止**包含如“【替身简介】”、“【基本能力】”等带方括号的指示性标题，直接输出内容即可。

  请返回一个严格符合 JSON 格式的对象（不要使用 Markdown 代码块）：
  {
    "name": "替身名 (英文名 + 官方译名风格的中文名，如 'Star Platinum (白金之星)')",
    "type": "替身类型 (如：近距离力量型、远距离自动操纵型、群体型、现象型、器物/装备型、规则概念型、无意识暴走型、穿戴/一体化型、同化型(附着于物体)、陷阱/自动触发型、寄生型)",
    "panel": {
      "abilityName": "能力名 (四字熟语或简洁短语，如 '时间暂停'、'黄金体验')",
      "desc": "【能力摘要】一句话概括核心功能，类似百科的顶部简介。",
      "long_desc": "【替身简介】一段详实的百科式描述。包含替身的外观特征（基于色调）、出现方式以及能力的整体概述。请用说明文的口吻，描述其独特的压迫感或神圣感。",
      "mechanics": [
        {
          "title": "基本能力：[机制名称]",
          "content": "详细解释该能力的工作原理。例如：描述由于速度极快，在普通人眼中如同瞬间移动一般。或者：该能力并非简单的破坏，而是从分子层面重组物质。（约80-100字）"
        },
        {
          "title": "衍生技：[技能名称]",
          "content": "基于基本能力的进阶应用。描述在战斗中如何灵活运用此能力，或者该能力的某项特殊性质（如：射程虽短但威力足以粉碎钻石）。（约80-100字）"
        }
      ],
      "limitations": [
        "限制条件 1 (精确描述能力的边界，如：射程距离只有2米)",
        "弱点/代价 2 (例如：持续发动会消耗大量精神力)"
      ],
      "battleCry": "战吼 (如：欧拉欧拉 (ORA ORA)、木大木大 (MUDA MUDA))",
      "quote": "名台词 (一句展现替身使者觉悟或性格的经典发言)"
    },
    "stats": { 
      "power": "评级 (A/B/C/D/E/None/∞/?)。⚠️注意：JOJO中不存在'S'级面板，最高为'A'或'∞'！请严格遵守标准六维。", 
      "speed": "评级", 
      "range": "评级", 
      "durability": "评级 (A=硬度极高, E=脆弱)", 
      "precision": "评级 (A=机械般精密, E=盲目)", 
      "potential": "成长性 (A=潜力无穷, E=完成体)" 
    },
    "appearance": "【外观描写】基于'${inputs.color}'色调的详细外貌描述。使用百科词条的笔触（如：该替身呈现为人型，全身覆盖着...，头部装饰有...）。"
  }
  ⚠️ 严格指令：返回的 JSON 字段值中**绝对禁止**包含如“【替身简介】”、“【基本能力】”等带方括号的指示性标题，直接输出内容即可。
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

    return extractJSON(text);
  } catch (err) {
    console.error("Stand Generation Failed:", err);
    throw err;
  }
};

export const generateStandImage = async (appearance) => {
  console.log("🎨 [Phase 2] Appearance Input:", appearance);
  const apiKey = getApiKey();
  const baseUrl = getBaseUrl();
  const imageModel = import.meta.env.VITE_IMAGE_MODEL || 'dall-e-3';

  console.log("Generating Image Model:", imageModel);

  const prompt = `**ART STYLE: JAPANESE ANIME / MANGA (JoJo's Bizarre Adventure Style)**
  
  Create a high-quality **2D Anime Illustration** of a 'Stand' in the signature style of **Hirohiko Araki**.
  
  The Stand's appearance features: ${appearance}.

  **DESIGN GUIDANCE (JOJO STYLE):**
  - **IF HUMANOID**: Use these archetypes as **inspiration** (mix and match allowed):
    1. **Noble Statue**: Heroic, sharp features (Star Platinum).
    2. **Distorted/Stylized**: Expressive but inhuman (King Crimson, Gold Experience).
    3. **Mask/Visor**: Mechanical or covered (Hierophant Green).
    4. **Pattern-Integrated**: Face split by zippers, hearts, or geometric patterns (Sticky Fingers, Crazy Diamond).
    5. **Monstrous/Skeletal**: Skull-like or void-faced (Cream, Justice).
    6. **Surreal/Abstract**: No face, just a shape, a shadow, or an eye in a weird place (Grateful Dead, Black Sabbath).
    **Key**: **Surprise the user.** Do not feel limited by this list. The goal is "Biological Surrealism".
  - **IF COLONY/TINY (Mascot Type)**:
    - **REFERENCES**: Sex Pistols (Mista), Harvest (Shigechi).
    - **STYLE**: Use **"Anime Mascot" aesthetics**. They should look like stylized characters, not realistic humans.
    - **BODY SHAPE**: **STRICTLY NO MUSCLES**. Use "Potato-shaped", "Pear-shaped", or "Round" bodies with thin noodle limbs.
    - **PROPORTIONS**: Huge head (1/2 total height), tiny body. Think "Chibi" or "Funko Pop" style.
    - **NO PHOTOREALISM**: Do not draw realistic mini-men. Keep it 2D, expressive, and exaggerated.
  - **IF OBJECT/NON-HUMAN**: Focus on "Artifact Quality". If it's a gun/tool, make it ornate (Emperor).
    - **LIVING PARTS RULE**: If the object has living bullets/missiles (like Sex Pistols), their faces MUST be **"Ugly-Cute Mascots"**.
    - **STRICT BAN**: Do NOT put "Noble Statue" or "Handsome Human" faces on small objects. They should look like cartoons or emojis.
  - **IF PHENOMENON (Natural Force)**:
    - **NO ELEMENTAL GOLEMS**: Do not draw a "Man made of Fire". Draw the element itself satisfyingly (e.g., A swirl of living slime, a floating sun, a claw made of water).
    - **VIBE**: Abstract, terrifying, formless.
  - **IF BOUND (Vehicle/Building)**:
    - **NO SEPARATE GHOST**: The object (Store, Ship, Car) **IS** the Stand. Do NOT draw a character standing next to it.
    - **INTEGRATION**: The stand features (eyes, mouths, patterns) should be subtly embedded into the object's surface (like a face in the hull), not pasted on top.
  - **AVOID CLUTTER & STACKING**: **STRICTLY PROHIBITED** to stack unrelated items.
    - **NO GEAR-STACKING**: For Industrial types, do NOT draw a mess of gears. Use **clean hydraulic pistons**, smooth metal plating, or a single large turbine.
    - **NO CLOCK-STACKING**: For Time types, do NOT cover the body in clocks. Use **one abstract dial**, digital distortion effects, or a starry void skin.
    - **LESS IS MORE**: Avoid visual noise. The design should be readable and elegant, not a pile of junk.
  - **INNOVATION CLAUSE**: If the Stand's concept is unique, **INVENT A NEW FORM**. Do not be afraid to draw a Stand that is made of liquid, smoke, digital glitches, or floating geometric scraps. **Break the silhouette.**
  - **TEXTURE**: Emphasize unnatural materials—gold plating, stitched leather, rubber, slime, or stone.

  Please interpret this design with a focus on bizarre, surreal, and high-fashion aesthetics. The form should adapt to the stand's concept—it can be a humanoid figure, a robotic entity, a creature, or an inorganic object. There is no fixed rule for the body type; choose the form that best fits the description provided.

  Use thick, expressive ink linework and heavy dramatic cross-hatching typical of manga art. The coloring should be vibrant and bold, with slight color shifts (JoJo palettes). 
  
  **COMPOSITION & AURA:**
  - **SPIRIT AURA**: Stands must emit a **"Stand Aura" (Spirit Energy)**. Surround the figure with flame-like, undulating energy outlines (Pink, Blue, or Gold). This is CRITICAL for the "Jojo" look. 
  - **POSE**: Dynamic, twisted, "Jojo Pose".
  - **BACKGROUND**: Surreal, psychedelic void or speed lines (Manga effect).

  Constraints: Ensure the image is clean with NO text, NO speech bubbles, and NO interface elements. Avoid generic bodybuilding physiques unless specified.`;

  console.log("🖌️ [Phase 2] FINAL IMAGE PROMPT:\n", prompt);

  // 1. Determine API Strategy based on Model Name
  const isGemini = imageModel.toLowerCase().includes('gemini');

  // Support independent Image Provider
  const imgApiKey = import.meta.env.VITE_IMAGE_API_KEY || apiKey;
  const imgBaseUrl = import.meta.env.VITE_IMAGE_BASE_URL || baseUrl;

  let url, body, headers;

  if (isGemini) {
    // --- STRATEGY A: Google Gemini ---
    // ⚠️ CRITICAL FIX: Distinguish between Proxy Path and Direct API Path
    if (!imgApiKey) {
      // Case 1: No Local Key -> Must use Proxy (Prod or Dev without key)
      url = '/api/gemini';
    } else {
      // Case 2: Has Local Key -> Use Direct Google API
      url = `${imgBaseUrl}/v1beta/models/${imageModel}:generateContent?key=${imgApiKey}`;
    }

    headers = { 'Content-Type': 'application/json' };

    // Construct Body for Google API
    body = {
      contents: [{
        role: "user",
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        responseModalities: ["IMAGE"], // Force Image Mode
        numberOfGeneratedImages: 1
      }
    };

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
    // 1. If we have a local Key (and we are in DEV), use Client-Side Call.
    // 2. If no local Key, use Backend Proxy (Secure).
    const useDirectCall = !!imgApiKey && import.meta.env.DEV;

    if (!useDirectCall) {
      // --- PRODUCTION: Use Serverless Proxy (Secure) ---
      // Note: We use the specific '/api/generate' handler for images which is optimized
      console.log("Using Backend Proxy for Image (Secure)");
      response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'image',
          payload: { appearance: prompt } // Re-using prompt as appearance description
        }),
        signal: controller.signal
      });
    } else {
      // --- DIRECT CLIENT-SIDE CALL (Dev Only) ---
      console.log("Using Direct Client-Side Call for Image (Bypassing Proxy Timeout)");
      // Ensure we are hitting the correct URL (Google API if Gemini, or OpenAI compatible)
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
