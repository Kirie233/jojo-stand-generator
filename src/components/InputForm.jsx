import React, { useState, useEffect, useRef } from 'react';
import '../styles/variables.css';

const EXAMPLES_SONG = [
  "白金之星 (Star Platinum)", "世界 (The World)", "杀手皇后 (Killer Queen)", "绯红之王 (King Crimson)", "黄金体验 (Gold Experience)",
  "石之自由 (Stone Free)", "肮脏肮脏的低价把戏 (D4C)", "透龙 (Wonder of U)", "天堂制造 (Made in Heaven)",
  "牙 (Tusk)", "软又湿 (Soft & Wet)", "疯狂钻石 (Crazy Diamond)", "钢链手指 (Sticky Fingers)", "银色战车 (Silver Chariot)",
  "回音 (Echoes)", "天堂之门 (Heaven's Door)", "天气预报 (Weather Report)", "碎球 (Ball Breaker)", "骇人恶兽 (Scary Monsters)",
  "Roundabout", "Walk Like an Egyptian", "Last Train Home", "Freak'n You",
  "Great Days", "Bloody Stream", "Sono Chi no Sadame", "Fighting Gold", "Modern Crusaders"
];
const EXAMPLES_NAME = [
  "乔纳森·乔斯达", "迪奥·布兰度", "乔瑟夫·乔斯达", "西撒·谢皮利", "空条承太郎",
  "花京院典明", "简·皮埃尔·波鲁纳雷夫", "东方仗助", "吉良吉影",
  "岸边露伴", "乔鲁诺·乔巴纳", "布鲁诺·布加拉提", "迪亚波罗", "盖多·米斯达",
  "空条徐伦", "恩里克·普奇", "乔尼·乔斯达", "杰洛·谢皮利", "法尼·瓦伦泰",
  "迪亚哥·布兰度", "透龙", "广濑康穗", "东方定助"
];
const COLORS = [
  { name: "Star Platinum Purple (白金之星紫)", value: "#7B1FA2" },
  { name: "Magician's Red (魔术师之红)", value: "#D50000" },
  { name: "The World Gold (世界·金)", value: "#FFD700" },
  { name: "Hierophant Green (法皇之绿)", value: "#00C853" },
  { name: "Sticky Fingers Blue (钢链手指蓝)", value: "#2962FF" },
  { name: "Killer Queen Pink (杀手皇后粉)", value: "#FF4081" },
  { name: "Silver Chariot (银色战车)", value: "#B0BEC5" },
  { name: "Gold Experience (黄金体验)", value: "#FFEA00" },
  { name: "Stone Free (石之自由)", value: "#00B0FF" },
  { name: "Crazy Diamond (疯狂钻石)", value: "#F48FB1" },
  { name: "Purple Haze (紫烟)", value: "#AB47BC" },
  { name: "Black Sabbath (黑色安息日)", value: "#000000" }
];
const PERSONALITY_TAGS = [
  "想要平静的生活", "想要守护某人", "想要成为流氓巨星",
  "想要消除时间", "追求究极生物", "相信引力",
  "想要修正世界", "拒绝放弃", "黄金精神",
  "恐惧被人背叛", "追求绝对的力量", "想要回到过去",
  "守护家乡的街道", "单纯的破坏欲", "对未知的探求",
  "想要治愈他人", "追求艺术的极致", "想要被惩罚"
];

const STEPS = [
  {
    id: 'NAME',
    question: "你的真名是？",
    sub: "THE FOOL (愚者) - 0",
    plain: "请输入你的姓名或昵称",
    placeholder: "空条承太郎 / Jotaro Kujo",
    random: EXAMPLES_NAME
  },
  {
    id: 'SONG',
    question: "灵魂的旋律？",
    sub: "THE LOVERS (恋人) - VI",
    plain: "输入一首你喜欢的歌曲名或歌手",
    placeholder: "Killer Queen / Michael Jackson",
    random: EXAMPLES_SONG
  },
  {
    id: 'COLOR',
    question: "精神的波纹色？",
    sub: "THE MAGICIAN (魔术师) - I",
    plain: "选择代表你精神能量的颜色",
    type: 'color',
    random: COLORS
  },
  {
    id: 'PERSONALITY',
    question: "你的欲望与执念？",
    sub: "THE DEVIL (恶魔) - XV",
    plain: "选择或输入你内心最深处的渴望",
    type: 'tags'
  },
  {
    id: 'PHOTO',
    question: "灵魂投影 (念写)",
    sub: "HERMIT PURPLE (隐者之紫) - IX",
    plain: "上传一张照片作为替身外形的参考 (可选/Optional)",
    type: 'upload'
  },
  {
    id: 'RITUAL',
    question: "接受试炼",
    sub: "THE WORLD (世界) - XXI",
    plain: "觉醒时刻已到",
    type: 'final'
  }
];

// TBC Progress Logic: Linear 0-100% based on steps
// Now that image is cropped tightly, we can use simple math.
const InputForm = ({ onSubmit, onCancel, onStepChange }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false); // 3D Flip State
  const [formData, setFormData] = useState({
    userName: '',
    song: '',
    color: '',
    personality: '',
    referenceImage: null
  });
  const [invalidField, setInvalidField] = useState(null); // Which field failed validation
  const [showHint, setShowHint] = useState(false); // Show the floating validation hint

  // Report progress to parent
  useEffect(() => {
    if (onStepChange) {
      onStepChange({
        current: currentStep,
        total: STEPS.length
      });
    }
  }, [currentStep, onStepChange]);


  const handleNext = () => {
    const fieldMap = ['userName', 'song', 'color', 'personality', 'referenceImage'];
    const currentFieldValue = formData[fieldMap[currentStep]];
    const stepType = STEPS[currentStep].type;

    if (stepType === 'final') {
      onSubmit(formData);
      return;
    }

    // Validation Check
    if (!currentFieldValue && stepType !== 'upload') {
      setInvalidField(fieldMap[currentStep]);
      setShowHint(true);
      // Clear hint after animation
      setTimeout(() => {
        setInvalidField(null);
        setShowHint(false);
      }, 2000);
      return;
    }

    triggerTransition(() => setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1)));
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      triggerTransition(() => setCurrentStep(prev => prev - 1));
    }
  };

  // ... triggerTransition ...

  // ... handleChange ...

  // 3D FLIP TRANSITION LOGIC
  const triggerTransition = (stepUpdateFn) => {
    setIsFlipping(true); // Phase 1: Flip Out (0 -> 90deg)
    setTimeout(() => {
      stepUpdateFn(); // Update Content at invisible midpoint
      setIsFlipping(false);

      // Phase 2: Add flip-in class to restore opacity and rotate back (via CSS)
      const card = document.querySelector('.tarot-card-frame');
      if (card) {
        card.classList.remove('flip-out');
        card.classList.add('flip-in');
        setTimeout(() => card.classList.remove('flip-in'), 300);
      }
    }, 300); // Wait for half-flip (300ms)
  };

  const handleChange = (key, val) => {
    setFormData({ ...formData, [key]: val });
  };

  const handleRandom = () => {
    const step = STEPS[currentStep];
    if (step.random) {
      const currentKey = getFieldKey();
      const currentVal = formData[currentKey];

      // Handle both primitive strings (Name/Song) and Objects (Colors)
      const getRandomValue = (item) => (typeof item === 'object' && item.value) ? item.value : item;

      // Filter out candidates where the value matches current
      const candidates = step.random.filter(item => {
        const val = getRandomValue(item);
        return val !== currentVal;
      });

      if (candidates.length > 0) {
        const randItem = candidates[Math.floor(Math.random() * candidates.length)];
        handleChange(currentKey, getRandomValue(randItem));
      } else {
        // Fallback
        const randItem = step.random[Math.floor(Math.random() * step.random.length)];
        handleChange(currentKey, getRandomValue(randItem));
      }
    }
  };

  const getFieldKey = () => {
    const map = { NAME: 'userName', SONG: 'song', COLOR: 'color', PERSONALITY: 'personality' };
    return map[STEPS[currentStep].id];
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange('referenceImage', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleNext();
  };

  const step = STEPS[currentStep];
  const currentVal = formData[getFieldKey()] || '';

  return (
    <>
      {/* REDESIGNED RETURN BUTTON (Borderless, Arrow Only) */}
      {onCancel && (
        <button className="return-btn" onClick={onCancel}>
          <svg className="return-arrow" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20,11 L7.83,11 L13.42,5.41 L12,4 L4,12 L12,20 L13.41,18.59 L7.83,13 L20,13 Z" />
          </svg>
          <span className="return-text">RETURN</span>
        </button>
      )}

      <div className="tarot-container">
        <div className="tarot-card-scene">
          <div className={`tarot-card-frame ${isFlipping ? 'flip-out' : ''}`}>

            {/* Watermark - Hidden on Final Step to keep background clean */}
            <div className="tarot-watermark" style={{ display: step.type === 'final' ? 'none' : 'block' }}>
              {step.sub.split(' - ')[0]}
            </div>

            <div className="card-header">
              <span className="card-sub">{step.sub}</span>
              <h2 className="card-question">{step.question}</h2>
              <p className="card-plain">{step.plain}</p>
            </div>

            <div className="card-body">
              {step.type === 'color' ? (
                <div className="color-grid">
                  <div className="color-swatches-container">
                    {COLORS.map(c => (
                      <div
                        key={c.value}
                        className={`color-swatch ${currentVal === c.value ? 'selected' : ''}`}
                        style={{ background: c.value }}
                        onClick={() => handleChange('color', c.value)}
                        title={c.name}
                      />
                    ))}
                  </div>
                  <div className="color-custom-container" style={{
                    position: 'relative',
                    width: 'fit-content',
                    minWidth: '280px',
                    margin: '20px auto 10px',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}>
                    {/* HIDDEN NATIVE PICKER (Covers entire area) */}
                    <input
                      type="color"
                      value={currentVal.startsWith('#') ? currentVal : '#000000'}
                      onChange={(e) => handleChange('color', e.target.value)}
                      style={{
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                        opacity: 0, zIndex: 10, cursor: 'pointer'
                      }}
                    />

                    {/* INTERACTIVE CARD UI */}
                    <div style={{
                      display: 'flex', alignItems: 'center',
                      background: '#fff',
                      border: '3px solid #000',
                      padding: '10px 20px',
                      boxShadow: '6px 6px 0 rgba(0,0,0,0.8)',
                      transform: 'skewX(-10deg)',
                      transition: 'transform 0.2s',
                    }}>
                      {/* COLOR PREVIEW CIRCLE */}
                      <div style={{
                        width: '40px', height: '40px',
                        background: currentVal,
                        border: '2px solid #000',
                        borderRadius: '50%',
                        marginRight: '15px',
                        flexShrink: 0,
                        transform: 'skewX(10deg)'
                      }} />

                      {/* TEXT INFO */}
                      <div style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        transform: 'skewX(10deg)',
                        marginRight: '15px'
                      }}>
                        <span style={{
                          fontFamily: "'ZCOOL KuaiLe', sans-serif",
                          fontSize: '1.2rem',
                          color: '#000',
                          lineHeight: 1
                        }}>
                          {COLORS.find(c => c.value === currentVal)?.name || "自定义颜色 (Custom)"}
                        </span>
                        <span style={{
                          fontFamily: "'Anton', sans-serif",
                          fontSize: '0.9rem',
                          color: '#666',
                          marginTop: '4px',
                          letterSpacing: '1px'
                        }}>
                          {currentVal.toUpperCase()}
                        </span>
                      </div>

                      {/* EDIT ICON */}
                      <div style={{ transform: 'skewX(10deg)' }}>
                        <svg viewBox="0 0 24 24" style={{ width: '24px', height: '24px', fill: '#000' }}>
                          <path d="M12,3c-4.97,0-9,4.03-9,9s4.03,9,9,9c0.83,0,1.5-0.67,1.5-1.5c0-0.39-0.15-0.74-0.39-1.01c-0.23-0.26-0.38-0.61-0.38-0.99 c0-0.83,0.67-1.5,1.5-1.5H16c2.76,0,5-2.24,5-5C21,5.24,16.97,3,12,3z M6.5,12c-0.83,0-1.5-0.67-1.5-1.5S5.67,9,6.5,9 S8,9.67,8,10.5S7.33,12,6.5,12z M9.5,8C8.67,8,8,7.33,8,6.5S8.67,5,9.5,5S11,5.67,11,6.5S10.33,8,9.5,8z M14.5,8 c-0.83,0-1.5-0.67-1.5-1.5S13.67,5,14.5,5S16,5.67,16,6.5S15.33,8,14.5,8z M17.5,12c-0.83,0-1.5-0.67-1.5-1.5S16.67,9,17.5,9 S19,9.67,19,10.5S18.33,12,17.5,12z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* RANDOM DICE BUTTON FOR COLOR - Centered Below */}
                  <button className="random-dice-btn" onClick={() => handleRandom()} title="Roll Destiny" style={{ height: '50px', transform: 'none', padding: '0 20px', marginTop: '5px' }}>
                    <svg viewBox="0 0 24 24" fill="currentColor" className="dice-icon">
                      <path d="M19,3H5C3.9,3,3,3.9,3,5v14c0,1.1,0.9,2,2,2h14c1.1,0,2-0.9,2-2V5C21,3.9,20.1,3,19,3z M19,19H5V5h14V19z" />
                      <circle cx="8" cy="8" r="1.5" />
                      <circle cx="16" cy="16" r="1.5" />
                      <circle cx="8" cy="16" r="1.5" />
                      <circle cx="16" cy="8" r="1.5" />
                      <circle cx="12" cy="12" r="1.5" />
                    </svg>
                    <span className="random-text" style={{ fontSize: '1rem' }}>命运 (RANDOM)</span>
                  </button>
                </div>
              ) : step.type === 'tags' ? (
                <div className="tags-container">
                  <div className="tags-grid">
                    {PERSONALITY_TAGS.map(tag => (
                      <span
                        key={tag}
                        className={`tag-chip ${currentVal === tag ? 'selected' : ''}`}
                        onClick={() => handleChange('personality', tag)}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <input
                    className="tarot-input-custom"
                    placeholder="或者... 输入你内心独特的执念"
                    value={currentVal}
                    onChange={(e) => handleChange('personality', e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                </div>
              ) : step.type === 'upload' ? (
                <div className={`spirit-photo-box ${formData.referenceImage ? 'has-file' : ''}`}>
                  <input type="file" onChange={handleImageUpload} id="upload-hidden" accept="image/*" />
                  <label htmlFor="upload-hidden" className="upload-touch-zone"></label>

                  <div className="polaroid-inner">
                    {formData.referenceImage ? (
                      <div className="preview-container">
                        <img src={formData.referenceImage} className="preview-image" alt="Spirit" />
                        <button className="remove-photo-btn" onClick={(e) => {
                          e.preventDefault();
                          handleChange('referenceImage', null);
                        }} title="Remove Photo">
                          <svg viewBox="0 0 24 24" fill="white" style={{ width: '20px', height: '20px' }}>
                            <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="void-placeholder">
                        <img src="/assets/hermit_purple_smashed_camera_full_color.png" className="upload-art-full" alt="Spirit Camera" />
                        <div className="hover-overlay-simple">
                          <span className="reveal-text">注入念力</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="polaroid-text-container">
                    <span className="polaroid-marker-text">砸毁相机！(UPLOAD)</span>
                    <svg className="hand-arrow" viewBox="0 0 50 50">
                      <path d="M10,40 Q25,10 40,20 L35,25 M40,20 L38,15" fill="none" stroke="#2b1d2b" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>
              ) : step.type === 'final' ? (
                <div className="arrow-ritual-container">

                  {/* Floating 'Go' text VFX */}
                  <div className="gogogo-container">
                    <span className="go-text go-1">ゴ</span>
                    <span className="go-text go-2">ゴ</span>
                    <span className="go-text go-3">ゴ</span>
                  </div>

                  {/* Electricity VFX */}
                  <div className="sparks-container">
                    <div className="spark s1"></div>
                    <div className="spark s2"></div>
                    <div className="spark s3"></div>
                    <div className="spark s4"></div>
                  </div>

                  {/* SYNCED VISUAL WRAPPER: Aura + Arrow move together */}
                  <div className="arrow-visual-wrapper">
                    {/* Back Glow - ADVANCED GOLDEN AURA */}
                    <div className="arrow-aura-advanced">
                      <div className="aura-rays"></div>
                      <div className="aura-wave wave-1"></div>
                      <div className="aura-wave wave-2"></div>
                      <div className="aura-wave wave-3"></div>
                      <div className="aura-core"></div>
                    </div>

                    {/* Arrow Image */}
                    <div className="ritual-circle-new">
                      <img src="/assets/stand_arrow.png" className="ritual-arrow-multiply" alt="Stand Arrow" />
                    </div>
                  </div>

                  <button className="awakening-btn-final" onClick={handleNext}>
                    <span className="kana skew-fix">ゴ</span>
                    <div className="btn-text-group skew-fix">
                      <span className="text-cn">觉醒替身</span>
                      <span className="text-en">AWAKEN</span>
                    </div>
                    <span className="kana skew-fix">ゴ</span>
                  </button>
                </div>
              ) : (
                <div className="input-group">
                  {/* Ink Splatter Decoration */}
                  <div className="ink-splatter splatter-1"></div>
                  <div className="ink-splatter splatter-2"></div>

                  {/* INPUT AREA (Minimalist Underline) */}
                  <div className="speech-bubble-wrapper">
                    <input
                      type="text"
                      className={`speech-bubble-input ${invalidField === getFieldKey() ? 'shake' : ''}`}
                      placeholder={step.placeholder}
                      value={formData[getFieldKey()] || ''}
                      onChange={(e) => handleChange(getFieldKey(), e.target.value)}
                      autoFocus
                    />

                    {/* RANDOM DICE BUTTON (Visible Button) */}
                    {step.random && (
                      <button className="random-dice-btn" onClick={() => handleRandom()} title="Roll Destiny">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="dice-icon">
                          <path d="M19,3H5C3.9,3,3,3.9,3,5v14c0,1.1,0.9,2,2,2h14c1.1,0,2-0.9,2-2V5C21,3.9,20.1,3,19,3z M19,19H5V5h14V19z" />
                          <circle cx="8" cy="8" r="1.5" />
                          <circle cx="16" cy="16" r="1.5" />
                          <circle cx="8" cy="16" r="1.5" />
                          <circle cx="16" cy="8" r="1.5" />
                          <circle cx="12" cy="12" r="1.5" />
                        </svg>
                        <span className="random-text">命运 (RANDOM)</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="card-footer">
              {currentStep > 0 && (
                <button className="nav-btn prev-btn" onClick={handlePrev}>
                  <span className="btn-inner">◀ PREV</span>
                </button>
              )}

              <div className="nav-center">
                <span className="page-indicator">{currentStep + 1} / {STEPS.length}</span>
                {showHint && (
                  <div className="validation-hint">
                    命运尚未开启 (INPUT REQUIRED)
                  </div>
                )}
              </div>

              {step.type !== 'final' && (
                <button className="nav-btn next-btn" onClick={handleNext}>
                  <span className="btn-inner">
                    {step.type === 'upload' && !formData.referenceImage ? 'SKIP ▶' : 'NEXT ▶'}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* QUICK NAVIGATION / CHAPTER SELECT */}
        <div className="chapter-nav">
          {STEPS.map((s, index) => (
            <div
              key={s.id}
              className={`nav-item ${index === currentStep ? 'active' : ''}`}
              onClick={() => {
                if (index === currentStep) return;
                triggerTransition(() => setCurrentStep(index));
              }}
              title={s.question}
            >
              <span className="nav-num">{['I', 'II', 'III', 'IV', 'V', 'VI'][index]}</span>
            </div>
          ))}
        </div>

        <style>{`
        .tarot-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 60vh;
            position: relative;
            padding-bottom: 50px;
            /* 恢复对称居中 */
            transition: all 0.5s ease;
        }

        .tarot-card-scene {
            perspective: 1500px;
            z-index: 50;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        /* RETURN BUTTON - Minimalist */
        .return-btn {
          position: fixed;
          top: 30px; left: 30px;
          background: transparent; /* No background */
          border: none; /* No border */
          color: #fff;
          cursor: pointer;
          z-index: 2000;
          display: flex; align-items: center; gap: 8px;
          transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
        }
        .return-btn:hover {
          transform: translateX(-8px); /* Left Move Animation */
          color: gold;
        }
        .return-arrow { width: 32px; height: 32px; }
        .return-text { 
           font-family: 'Anton', sans-serif; 
           font-size: 1.2rem; 
           letter-spacing: 1px;
           text-shadow: 2px 2px 0 #000;
        }

        .tarot-card-frame {
            position: relative;
            width: 540px; /* 拉宽卡片，从 400px 增加到 540px */
            /* FIX: Fixed Height to prevent button jumping */
            height: 600px; 
            
            /* BEAUTIFICATION: Manga/Tarot Paper Style */
            background-color: #fffdf0; /* Cream Paper */
            /* Halftone Dot Pattern */
            background-image: radial-gradient(#e0e0e0 1px, transparent 1px);
            background-size: 10px 10px;

            /* DOUBLE BORDER EFFECT (Black -> White -> Black) */
            border: 3px solid #000;
            box-shadow: 
                inset 0 0 0 3px #fffdf0, /* Gap */
                inset 0 0 0 5px #000,    /* Inner Line */
                12px 12px 0 #2a0845;     /* Deep Purple Hard Shadow */

            z-index: 50; 
            display: flex; 
            flex-direction: column;
            padding: 30px 25px 15px; /* Increased top, reduced bottom */
            box-sizing: border-box;
            overflow: hidden; /* CRITICAL: Prevent anything leaking out */
            
            /* 3D TRANSFORM PROPS */
            transform-style: preserve-3d;
            backface-visibility: hidden; /* Hide back if we had one, irrelevant here but good practice */
            /* Initial State */
            transform: rotateY(0deg);
        }
        
        /* 3D ANIMATION CLASSES */
        .flip-out {
            animation: flipOutY 0.3s cubic-bezier(0.455, 0.03, 0.515, 0.955) forwards;
        }
        .flip-in {
            animation: flipInY 0.3s cubic-bezier(0.455, 0.03, 0.515, 0.955) forwards;
        }

        @keyframes flipOutY {
            0% { transform: rotateY(0deg); opacity: 1; }
            100% { transform: rotateY(90deg); opacity: 0; }
        }
        
        @keyframes flipInY {
            0% { transform: rotateY(-90deg); opacity: 0; }
            100% { transform: rotateY(0deg); opacity: 1; }
        }
        
        .tarot-watermark {
            position: absolute;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%) rotate(-30deg);
            font-family: 'Cinzel', serif;
            font-size: 5rem;
            color: rgba(0,0,0,0.05);
            white-space: nowrap;
            pointer-events: none;
            z-index: 0;
        }
        
        .tarot-card-frame.burning {
            animation: burnCard 0.3s forwards;
        }
        .tarot-card-frame.restoring {
            animation: restoreCard 0.3s forwards;
        }

        .card-header { position: relative; z-index: 2; flex-shrink: 0; }
        .card-body { 
            position: relative; z-index: 2; width: 100%; 
            flex: 1; /* CATCH ALL SPACE */
            display: flex; flex-direction: column; gap: 8px; /* Tightened from 10px */
            padding: 5px 0 5px; /* Minimal bottom padding */
            overflow-y: auto; 
            scrollbar-width: none;
            -ms-overflow-style: none;
            /* Mask removed to give more vertical space */
        }
        .card-body::-webkit-scrollbar { display: none; }

        .card-sub {
            display: block;
            font-family: 'Cinzel', serif;
            font-size: 0.8rem;
            letter-spacing: 2px;
            margin-bottom: 5px;
            color: #666;
            border-bottom: 1px solid #000;
            padding-bottom: 5px;
        }
        
        .card-question {
            font-family: 'ZCOOL KuaiLe', cursive;
            font-size: 1.2rem;
            margin: 0;
            color: #000;
            text-align: left;
            padding-left: 20px;
            border-left: 5px solid #d500f9;
            padding-bottom: 5px;
            width: fit-content;
        }
        .card-plain {
            font-family: 'ZCOOL KuaiLe', cursive; /* Thematic Match */
            font-size: 1.2rem; /* Slightly larger for this font */
            color: #444;
            margin: 0;
            letter-spacing: 1px;
        }

        /* INPUTS - CENTERING & WEIGHT REDUCTION */
        .input-group {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            position: relative;
            width: 100%;
        }
        .speech-bubble-wrapper {
            position: relative;
            padding: 20px 0;
            width: 100%;
            display: flex; 
            flex-direction: column;
            align-items: center;
            box-sizing: border-box;
        }
        .speech-bubble-input {
            width: 95%;
            max-width: 480px; /* Increased for wider card (540px) */
            box-sizing: border-box;
            background: transparent; 
            border: none;
            border-bottom: 4px solid #000; 
            border-radius: 0;
            padding: 10px; 
            font-family: 'ZCOOL KuaiLe', 'Bangers', cursive; 
            font-size: 2.2rem;
            text-align: center;
            color: #000;
            outline: none;
            box-shadow: none; 
            letter-spacing: 2px; 
            transition: border-color 0.3s;
        }
        .speech-bubble-input:focus {
            border-bottom-color: #d500f9;
        }
        .speech-bubble-input::placeholder { color: #ccc; font-family: 'Courier New'; font-size: 1.2rem; }

        /* RANDOM DICE BUTTON - POSITIONED RELATIVE TO WRAPPER */
        .random-dice-btn {
            margin-top: 15px; /* Space below input */
            display: flex; align-items: center; gap: 8px;
            background: #000;
            color: #fff;
            border: 2px solid #fff;
            padding: 5px 15px;
            border-radius: 20px;
            cursor: pointer;
            transition: all 0.2s;
            z-index: 5;
            box-shadow: 3px 3px 0 rgba(0,0,0,0.2);
            transform: skewX(-15deg);
        }
        .random-dice-btn:hover {
            background: #fff;
            color: #000;
            border-color: #000;
            transform: translateY(-2px);
            box-shadow: 2px 4px 0 rgba(0,0,0,0.2);
        }
        .dice-icon { width: 18px; height: 18px; }
        .random-text { font-family: 'ZCOOL KuaiLe', cursive; font-size: 0.9rem; white-space: nowrap; }

        /* OLD INPUT (Backup) */
        .tarot-input { display: none; } 

        .ink-splatter {
            position: absolute;
            background: #000;
            border-radius: 50%;
            opacity: 0.1;
            pointer-events: none;
            z-index: 1;
        }
        .splatter-1 { top: -20px; left: -20px; width: 60px; height: 50px; transform: rotate(45deg); filter: blur(1px); }
        .splatter-2 { bottom: 10px; right: -10px; width: 40px; height: 60px; transform: rotate(-30deg); border-radius: 30% 70% 70% 30%; }
        
        .tarot-input-small {
            width: 100%;
            box-sizing: border-box; /* CRITICAL: Include padding in width */
            background: transparent;
            border: none;
            border-bottom: 2px solid #000;
            padding: 5px;
            font-family: 'ZCOOL KuaiLe', monospace; /* Consistent Font */
            text-align: center;
            outline: none;
            margin-top: 10px;
            color: #000;
        }

        .tarot-input-custom {
            width: 92%; /* Dynamic width */
            box-sizing: border-box; /* CRITICAL: Include padding in width */
            background: #f5f5f5; 
            border: 2px dashed #000;
            border-radius: 8px;
            padding: 15px;
            font-family: 'Noto Serif SC', serif;
            font-size: 1.1rem;
            text-align: center;
            outline: none;
            margin: 20px auto; /* Horizontal centering */
            color: #000;
            transition: all 0.3s;
            display: block; 
        }
        .tarot-input-custom:focus {
            border-color: var(--primary-color);
            background: rgba(255,255,255,0.2);
            box-shadow: 0 0 15px rgba(213, 0, 249, 0.3);
        }

        .random-btn-styled {
            background: #000; color: #fff;
            border: 2px solid #fff;
            padding: 5px 15px;
            font-family: 'ZCOOL KuaiLe';
            cursor: pointer;
            box-shadow: 3px 3px 0 #d500f9;
            transform: rotate(-3deg);
            transition: all 0.2s;
        }
        .random-btn-styled:hover { transform: rotate(0deg) scale(1.1); box-shadow: 5px 5px 0 #d500f9; }

        /* COLORS - DIAMONDS - COMPRESSED & POSITIONED */
        .color-grid { 
            flex: 1; /* FILL SPACE */
            display: flex; flex-direction: column; align-items: center; 
            padding: 5px 10px 15px; 
            z-index: 5;
            width: 100%;
        }
        .color-swatches-container {
            display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; width: 100%;
            margin-top: 20px; /* Increased margin for wider layout */
        }
        .color-swatch {
            width: 45px; height: 45px; /* Slightly larger swatches for wider card */
            border: 2px solid #000; 
            cursor: pointer; 
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            transform: rotate(45deg); 
            margin: 10px; 
            box-shadow: 2px 2px 0 rgba(0,0,0,0.2);
        }
        .color-label { font-family: 'Cinzel'; font-size: 0.8rem; margin: 8px 0; color: #000; font-weight: bold; text-align: center; }
        
        .color-custom-row {
            margin-top: auto; /* PUSH TO BOTTOM */
            display: flex; gap: 10px; width: 95%; margin: auto auto 5px; /* Center horizontally */
            box-sizing: border-box;
        }
        .color-picker-input {
            width: 50px; height: 50px; border: 2px solid #000; border-radius: 8px; cursor: pointer; padding: 0; flex-shrink: 0;
        }
        .color-hex-input {
            flex: 1; margin: 0 !important; height: 50px; padding: 5px 15px !important; font-size: 0.95rem !important;
        }

        /* TAGS - COMPRESSED */
        .tags-container {
            flex: 1; display: flex; flex-direction: column;
            padding-bottom: 10px;
        }
        .tags-grid { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; padding: 10px 15px; }
        .tag-chip {
            padding: 6px 14px; /* Increased padding for wider card */
            background: #fff; 
            color: #000;
            border: 1px solid #000; 
            cursor: pointer; 
            font-family: 'Noto Serif SC', serif;
            font-weight: bold;
            font-size: 0.9rem; /* Back to original comfortable size */
            clip-path: polygon(
                0% 10%, 5% 0%, 15% 5%, 25% 0%, 35% 5%, 45% 0%, 55% 5%, 65% 0%, 75% 5%, 85% 0%, 95% 5%, 100% 0%, 
                100% 90%, 95% 100%, 85% 95%, 75% 100%, 65% 95%, 55% 100%, 45% 95%, 35% 100%, 25% 95%, 15% 100%, 5% 95%, 0% 100%
            );
        }
        .tag-chip:nth-child(even) { transform: rotate(2deg); }
        .tag-chip:nth-child(3n) { transform: rotate(-1deg); }
        .tag-chip:nth-child(5n) { transform: rotate(3deg); }
        
        .tag-chip:hover { transform: scale(1.1) rotate(0deg) !important; background: #ffff00; }
        .tag-chip.selected { 
            background: #000; 
            color: #d500f9; 
            transform: scale(1.1) rotate(0deg) !important; 
            box-shadow: 4px 4px 0 #d500f9;
            border-color: #d500f9;
        }

        .tags-container .tarot-input-custom {
            margin-top: auto; /* PUSH TO BOTTOM */
            width: 95%; 
            margin-left: auto;
            margin-right: auto;
            margin-bottom: 5px;
        }

        /* UPLOAD - POLAROID/FILM */
        /* UPLOAD - COMPRESSED */
        .spirit-photo-box {
            width: 260px; /* Slimmer */
            height: 310px; /* Reduced from 380px */
            background: #fff;
            padding: 10px 10px 35px 10px;
            box-shadow: 4px 4px 12px rgba(0,0,0,0.2);
            display: flex; flex-direction: column;
            position: relative;
            transform: rotate(1deg);
            margin: 0 auto;
            border: none;
            transition: all 0.3s ease;
            cursor: pointer;
        }
        .spirit-photo-box:hover {
            transform: rotate(0deg) scale(1.03);
            box-shadow: 8px 8px 20px rgba(213, 0, 249, 0.3);
        }
        .spirit-photo-box:hover .polaroid-inner {
            border-color: #d500f9;
        }
        .spirit-photo-box.has-file { transform: rotate(0deg); }
        
        .upload-touch-zone {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            z-index: 20;
            cursor: pointer;
        }

        .polaroid-inner {
            width: 100%;
            height: 70%;
            background: #000;
            display: flex; align-items: center; justify-content: center;
            overflow: hidden;
            border: 3px solid #000;
            position: relative;
        }

        .void-placeholder {
            width: 100%; height: 100%;
            position: relative;
        }

        .upload-art-full {
            width: 100%; height: 100%;
            object-fit: cover;
            transition: all 0.3s ease;
        }
        
        /* Simple Hover Effect */
        .spirit-photo-box:hover .upload-art-full {
            transform: scale(1.05);
            filter: brightness(0.6);
        }

        .hover-overlay-simple {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            display: flex; align-items: center; justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
            border: 4px solid rgba(213, 0, 249, 0); /* Invisible border initially */
            pointer-events: none;
        }

        .spirit-photo-box:hover .hover-overlay-simple {
            opacity: 1;
            border-color: #d500f9; /* Purple border on hover */
            box-shadow: inset 0 0 20px rgba(213, 0, 249, 0.5);
        }

        .reveal-text {
            font-family: 'ZCOOL KuaiLe', cursive;
            font-size: 2.2rem;
            color: #fff;
            text-shadow: 0 0 10px #d500f9, 2px 2px 0 #000;
            transform: scale(0.8);
            transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .spirit-photo-box:hover .reveal-text {
            transform: scale(1.1);
        }

        .polaroid-footer-text {
            height: 30%;
            display: flex; align-items: center; justify-content: center;
            padding-top: 10px;
        }
        /* POLAROID MARKER TEXT - COMPRESSED */
        .polaroid-text-container {
            margin-top: 8px; /* Reduced from 15px */
            position: relative;
            width: 100%;
            text-align: center;
        }
        .polaroid-marker-text {
            font-family: 'ZCOOL KuaiLe', cursive; 
            font-size: 1.5rem; /* Reduced from 2.2rem */
            color: #2b1d2b; 
            display: block;
            transform: rotate(-3deg); 
            text-shadow: 1px 1px 0 rgba(0,0,0,0.1); 
            letter-spacing: 1px;
            cursor: pointer;
            transition: transform 0.2s;
        }
        .item-upload-label:hover .polaroid-marker-text {
            transform: rotate(-5deg) scale(1.1);
            color: #d500f9; /* Glow on hover */
        }
        
        .hand-arrow {
            position: absolute;
            top: -10px; right: -30px;
            width: 40px; height: 40px;
            opacity: 0.8;
            transform: rotate(20deg);
        }

        .upload-input { display: none; }
        .polaroid-label {
            font-family: 'ZCOOL KuaiLe', cursive;
            font-size: 1rem;
            color: #7B1FA2;
            letter-spacing: 2px;
            font-weight: bold;
        }
        .preview-container { position: relative; width: 100%; height: 100%; }
        .preview-image { width: 100%; height: 100%; object-fit: cover; }
        
        .remove-photo-btn {
            position: absolute;
            top: 5px; right: 5px;
            width: 30px; height: 30px;
            background: rgba(0,0,0,0.6);
            border: 2px solid #fff;
            border-radius: 50%;
            cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            z-index: 50;
            transition: all 0.2s;
        }
        .remove-photo-btn:hover { background: #ff0000; transform: scale(1.1); }
        
        #upload-hidden { display: none; }

        /* ARROW RITUAL */
        /* RITUAL NEW STYLES */
        .final-step-header {
            width: 100%; display: flex; justify-content: center;
        }
        /* RE-ADDED & STYLED BOTTOM TITLE */
        .tbc-floating-img-new {
            position: fixed; /* Changed to FIXED since it's now root level */
            bottom: 80px; /* Adjusted position */
            left: 30px; /* Match arrow left + padding */
            width: 250px;
            opacity: 0;
            transform: translateY(20px) scale(0.8);
            transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            /* CRITICAL: Cut out black background */
            mix-blend-mode: screen; 
            pointer-events: none;
            z-index: 9999; /* Ensure above everything */
        }
        .tbc-floating-img-new.visible {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
        
        .arrow-ritual-container { 
            position: relative; width: 100%; 
            display: flex; flex-direction: column; align-items: center; 
            gap: 8px; /* Compressed gap */
            margin-top: 5px; 
        }
        
        /* WRAPPER FOR SYNCED FLOATING */
        .arrow-visual-wrapper {
            position: relative;
            display: flex; align-items: center; justify-content: center;
            width: 265px; height: 265px; /* Scaled down from 300px */
            animation: float 3s ease-in-out infinite;
            z-index: 10;
        }

        /* ADVANCED AURA SYSTEM v2 - GOLDEN WIND */
        .arrow-aura-advanced {
            position: absolute;
            top: 50%; left: 50%;
            width: 0; height: 0;
            display: flex; align-items: center; justify-content: center;
            z-index: -1; /* BEHIND ARROW */
            /* Removed translateY offset */
        }
        
        /* 1. The Core Sun - HOLLOWED OUT */
        .aura-core {
            position: absolute;
            width: 160px; height: 160px;
            /* Center is transparent so arrow sits on white card (clean), glow starts further out */
            background: radial-gradient(circle, transparent 30%, rgba(255, 215, 0, 0.4) 50%, rgba(255, 165, 0, 0) 70%);
            border-radius: 50%;
            animation: core-pulse 2s ease-in-out infinite alternate;
            mix-blend-mode: normal;
        }

        /* 2. Rotating Rays - SUNBURST / GOD RAYS effect */
        .aura-rays {
            position: absolute;
            width: 330px; height: 330px; /* Scaled down */
            background: repeating-conic-gradient(
                from 0deg, 
                rgba(255, 215, 0, 0) 0deg, 
                rgba(255, 215, 0, 0) 10deg, 
                rgba(255, 215, 0, 0.4) 12deg, 
                rgba(255, 215, 0, 0) 14deg,
                rgba(255, 215, 0, 0) 20deg
            );
            border-radius: 50%;
            opacity: 0.9; 
            animation: rotate-rays 20s linear infinite;
            mask-image: radial-gradient(circle, transparent 20%, black 40%, black 70%, transparent 100%);
            -webkit-mask-image: radial-gradient(circle, transparent 20%, black 40%, black 70%, transparent 100%);
        }

        /* ... shockwaves removed ... */
        /* 4. Magic Particles (Dust) */
        .aura-particles {
            position: absolute;
            width: 300px; height: 300px;
            animation: rotate-particles 20s linear infinite;
        }

        /* ... */

        .text-cn {
            font-size: 2.4rem; /* Reduced from 2.8rem to prevent wrapping */
            font-weight: 900; 
            color: #fff;
            /* Stronger Shadow + Stroke effect for legibility */
            text-shadow: 2px 2px 0 #000, -1px -1px 0 #4b0082;
            -webkit-text-stroke: 1px #000;
            white-space: nowrap; /* Force single line */
            font-family: 'ZCOOL KuaiLe', 'SimHei', sans-serif; 
            letter-spacing: 2px; /* Slightly tighter spacing */
            margin-bottom: 2px;
        }
        
        @keyframes core-pulse {
            0% { transform: scale(0.95); opacity: 0.8; filter: brightness(1); }
            100% { transform: scale(1.1); opacity: 1; filter: brightness(1.3); }
        }
        @keyframes rotate-rays {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        @keyframes ripple-expand {
            0% { width: 100px; height: 100px; opacity: 0.8; border-width: 4px; }
            100% { width: 350px; height: 350px; opacity: 0; border-width: 0px; }
        }
        @keyframes rotate-particles {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(-360deg); }
        }



        .ritual-circle-new {
            width: 250px; height: 250px; /* Scaled down from 280px */
            display: flex; align-items: center; justify-content: center;
            position: relative;
            z-index: 2; 
            mix-blend-mode: normal;
        }

        .ritual-arrow-multiply {
            width: 100%;
            height: auto;
            /* Removed internal blend mode, handled by parent */
            /* mix-blend-mode: multiply; */
            /* Brightness tweak to counteract multiply darkness */
            filter: contrast(1.1) brightness(1.05);
            /* animation: float 3s ease-in-out infinite; -- REMOVED, handled by wrapper */
        }

        /* GoGoGo VFX */
        .gogogo-container {
            position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; 
            z-index: 20; /* FIX: Raised above visual wrapper (10) so text is visible */
        }
        .go-text {
            position: absolute; font-family: 'Impact', sans-serif; font-size: 2rem; color: #800080; opacity: 0;
            animation: go-float 2s infinite;
        }

        /* ... spark rules ... */

        /* 2. Rotating Rays - SUNBURST / GOD RAYS effect */
        .aura-rays {
            position: absolute;
            width: 330px; height: 330px; /* Scaled down */
            background: repeating-conic-gradient(
                from 0deg, 
                rgba(255, 215, 0, 0) 0deg, 
                rgba(255, 215, 0, 0) 10deg, 
                rgba(255, 215, 0, 0.4) 12deg, 
                rgba(255, 215, 0, 0) 14deg,
                rgba(255, 215, 0, 0) 20deg
            );
            border-radius: 50%;
            opacity: 0.9; 
            animation: rotate-rays 20s linear infinite;
            mask-image: radial-gradient(circle, transparent 20%, black 40%, black 70%, transparent 100%);
            -webkit-mask-image: radial-gradient(circle, transparent 20%, black 40%, black 70%, transparent 100%);
        }
        .go-1 { top: 20px; left: 20px; animation-delay: 0s; font-size: 2.5rem; }
        .go-2 { top: 100px; right: 10px; animation-delay: 0.5s; font-size: 2rem; }
        .go-3 { bottom: 80px; left: 40px; animation-delay: 1s; font-size: 3rem; }

        @keyframes go-float {
            0% { transform: translateY(10px) rotate(-5deg); opacity: 0; }
            50% { opacity: 0.8; }
            100% { transform: translateY(-20px) rotate(5deg); opacity: 0; }
        }

        /* Sparks / Electricity */
        .sparks-container { position: absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:4; }
        .spark {
            position: absolute; background: #00ffff;
            box-shadow: 0 0 10px #00ffff;
            opacity: 0;
        }
        .s1 { top: 40%; left: 10%; width: 40px; height: 2px; transform: rotate(15deg); animation: spark-flash 0.3s infinite 0.1s; }
        .s2 { top: 30%; right: 10%; width: 30px; height: 3px; transform: rotate(-25deg); animation: spark-flash 0.4s infinite 0.2s; }
        .s3 { bottom: 30%; left: 20%; width: 50px; height: 1px; transform: rotate(45deg); animation: spark-flash 0.2s infinite 0s; }
        .s4 { bottom: 40%; right: 15%; width: 40px; height: 2px; transform: rotate(-10deg); animation: spark-flash 0.5s infinite 0.3s; }
        
        @keyframes spark-flash {
            0% { opacity: 0; clip-path: polygon(0 40%, 100% 40%, 100% 60%, 0 60%); }
            50% { opacity: 1; clip-path: polygon(0 45%, 50% 10%, 100% 55%, 0 55%); }
            100% { opacity: 0; }
        }

        /* ULTIMATE BUTTON */
        /* ULTIMATE BUTTON - REDESIGNED */
        .awakening-btn-final {
            width: 90%;
            background: linear-gradient(135deg, #2a0845 0%, #6441A5 100%);
            border: 2px solid #FFD700;
            box-shadow: 0 0 15px rgba(100, 65, 165, 0.8);
            transform: skewX(-15deg);
            padding: 10px 0; /* Reduced padding */
            margin-top: 5px; /* Reduced margin */
            cursor: pointer;
            display: flex; align-items: center; justify-content: center; gap: 20px;
            position: relative;
            overflow: hidden;
            transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        .awakening-btn-final:hover {
            box-shadow: 0 0 30px rgba(255, 215, 0, 0.6), inset 0 0 20px rgba(255, 215, 0, 0.2);
            transform: skewX(-15deg) scale(1.05); /* Maintain skew on hover */
            border-color: #fff;
        }

        .awakening-btn-final:active {
            transform: skewX(-15deg) scale(0.95);
        }

        /* TEXT STYLING */
        .skew-fix {
            transform: skewX(15deg); /* Counter-skew to make text upright */
            display: inline-block;
        }
        
        .btn-text-group {
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            line-height: 1; /* Tighter line height to keep group compact */
        }

        .text-cn {
            font-size: 2.2rem; /* Optimized size for 400px card */
            font-weight: 900; 
            color: #fff;
            text-shadow: 2px 2px 0 #000, -1px -1px 0 #4b0082;
            -webkit-text-stroke: 1px #000;
            font-family: 'ZCOOL KuaiLe', 'SimHei', sans-serif; 
            letter-spacing: 2px;
            margin-bottom: 2px;
            white-space: nowrap;
        }
        
        .text-en {
            font-size: 1.1rem;
            font-weight: bold;
            color: #FFD700;
            font-family: 'Anton', sans-serif;
            letter-spacing: 4px;
            text-transform: uppercase;
            text-shadow: 1px 1px 0 rgba(0,0,0,0.8);
        }

        .kana {
            font-family: 'Sawarabi Mincho', serif;
            font-size: 2rem; 
            color: #FFD700; 
            text-shadow: 0 0 5px #d500f9, 1px 1px 0 #000;
            margin: 0 10px; /* Give some breathing room */
        }

        /* RGB Border Gradient removed as per request for Gold Border */
        /* Preserving pulse bloom for context */
        @keyframes pulse-bloom { 0%, 100% { filter: drop-shadow(0 0 10px #d500f9); } 50% { filter: drop-shadow(0 0 25px #d500f9); } }

        /* Background Pattern on Body - Add this to global or parent in next edit if needed, for now scoped to this file context? No, inputform is scoped. Let's add body style via JS or assume global. */

        /* FOOTER */
        .card-footer {
            margin-top: auto; 
            flex-shrink: 0; 
            display: flex; justify-content: space-between; align-items: center;
            border-top: 1px solid #eee; padding-top: 10px; /* Reduced from 20px */
            height: 45px; /* Tighter footer */
        }

        /* CHAPTER NAVIGATION - FLOW BASED */
        .chapter-nav {
            margin-top: 25px;
            display: flex;
            gap: 12px;
            z-index: 100;
        }

        .nav-item {
            width: 30px; height: 30px;
            background: rgba(0, 0, 0, 0.6);
            border: 1px solid #6441A5;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer;
            transform: skewX(-10deg);
            transition: all 0.3s ease;
        }

        .nav-item:hover {
            background: #6441A5;
            border-color: #FFD700;
            transform: skewX(-10deg) scale(1.1);
        }

        .nav-item.active {
            background: #FFD700;
            border-color: #fff;
            box-shadow: 0 0 10px #FFD700;
        }

        .nav-num {
            font-family: 'Times New Roman', serif;
            font-size: 0.8rem;
            color: #fff;
            font-weight: bold;
            transform: skewX(10deg); /* Counter skew */
        }

        .nav-item.active .nav-num {
            color: #000;
        }

        /* MODERN BLUR-SLIDE TRANSITIONS */
        @keyframes slideBlurOutLeft {
            0% { transform: translateX(0); opacity: 1; filter: blur(0); }
            100% { transform: translateX(-40px); opacity: 0; filter: blur(8px); }
        }
        @keyframes slideBlurInRight {
            0% { transform: translateX(40px); opacity: 0; filter: blur(8px); }
            100% { transform: translateX(0); opacity: 1; filter: blur(0); }
        }
        
        @keyframes slideBlurOutRight {
            0% { transform: translateX(0); opacity: 1; filter: blur(0); }
            100% { transform: translateX(40px); opacity: 0; filter: blur(8px); }
        }
        @keyframes slideBlurInLeft {
            0% { transform: translateX(-40px); opacity: 0; filter: blur(8px); }
            100% { transform: translateX(0); opacity: 1; filter: blur(0); }
        }

        /* Apply to the inner viewport, NOT the card frame */
        /* Apply to the inner viewport, NOT the card frame */
        .card-scroll-viewport {
            width: 100%;
            flex: 1; /* Consume all available space */
            display: flex; flex-direction: column; 
            /* Center vertically for aesthetic balance if content is short */
            justify-content: center; 
            overflow: hidden; 
            position: relative;
        }

        .card-scroll-viewport.out-next { animation: slideBlurOutLeft 0.3s cubic-bezier(0.4, 0.0, 0.2, 1) forwards; }
        .card-scroll-viewport.in-next { animation: slideBlurInRight 0.3s cubic-bezier(0.4, 0.0, 0.2, 1) forwards; }
        
        .card-scroll-viewport.out-prev { animation: slideBlurOutRight 0.3s cubic-bezier(0.4, 0.0, 0.2, 1) forwards; }
        .card-scroll-viewport.in-prev { animation: slideBlurInLeft 0.3s cubic-bezier(0.4, 0.0, 0.2, 1) forwards; }

        @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
        }

        /* NAVIGATION & VALIDATION ENHANCEMENTS */
        .card-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 40px;
            background: rgba(0,0,0,0.05);
            border-top: 1px dashed rgba(0,0,0,0.1);
        }

        .nav-center {
            position: relative;
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .page-indicator {
            font-family: 'Courier New', monospace;
            font-weight: 900;
            color: #000;
            font-size: 1.1rem;
            letter-spacing: 2px;
            opacity: 0.8;
        }

        .validation-hint {
            position: absolute;
            top: -45px;
            left: 50%;
            transform: translateX(-50%);
            background: #d500f9;
            color: #fff;
            padding: 6px 16px;
            border-radius: 4px;
            font-size: 0.85rem;
            font-weight: bold;
            white-space: nowrap;
            box-shadow: 0 4px 15px rgba(213, 0, 249, 0.4);
            animation: hintPop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            z-index: 100;
        }

        @keyframes hintPop {
            from { opacity: 0; transform: translateX(-50%) translateY(10px); }
            to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }

        .nav-btn {
            background: #000;
            color: #fff;
            border: 3px solid #000;
            padding: 0;
            cursor: pointer;
            font-family: 'Anton', sans-serif;
            font-size: 1rem;
            letter-spacing: 1px;
            transition: all 0.2s;
            position: relative;
            overflow: hidden;
            transform: skew(-10deg);
        }

        .btn-inner {
            display: block;
            padding: 8px 18px;
            background: #000;
            border: 1px solid rgba(255,255,255,0.2);
            transition: all 0.2s;
        }

        .nav-btn:hover {
            transform: skew(-10deg) translateY(-2px);
            box-shadow: 5px 5px 0 #d500f9;
        }

        .nav-btn:active {
            transform: skew(-10deg) translateY(0);
            box-shadow: 2px 2px 0 #d500f9;
        }

        .next-btn .btn-inner {
            background: linear-gradient(135deg, #222 0%, #000 100%);
            color: #ffd700;
        }
        
        .next-btn:hover .btn-inner {
            background: #ffd700;
            color: #000;
        }

        .prev-btn .btn-inner {
            background: transparent;
            color: #999;
        }

        .prev-btn:hover .btn-inner {
            color: #fff;
        }

        /* RITUAL CIRCLE ANIMATIONS */
        .ritual-circle-new {
            width: 140px; height: 140px;
            display: flex; align-items: center; justify-content: center;
            animation: float 3s ease-in-out infinite;
            z-index: 20;
        }

        /* === RESPONSIVE INPUT FORM === */
        @media (max-width: 768px) {
            .tarot-card-frame {
                width: 90%;
                max-width: 100%;
                height: 550px; /* Reduced height for mobile */
                padding: 15px;
            }
            
            .card-header { padding-left: 0; text-align: center; }
            .card-question { font-size: 1.5rem; text-align: center; border-left: none; padding-left: 0; width: 100%; } /* Center title */
            .card-plain { font-size: 1rem; text-align: center; }
            
            .speech-bubble-input { font-size: 1.5rem; width: 85%; }
            
            /* Color Grid Adaptation */
            .color-grid { justify-content: center; }
            .color-swatches-container { justify-content: center; gap: 8px; }
            .color-swatch { width: 35px; height: 35px; }
            
            /* Tags Adaptation */
            .tags-grid { gap: 6px; justify-content: center; }
            .tag-chip { padding: 4px 10px; font-size: 0.9rem; }
            
            /* Upload Area */
            .spirit-photo-box { height: 280px; }
            
            /* Footer */
            .card-footer { padding: 15px 20px; }
            .page-indicator { font-size: 1rem; }
            .nav-btn .btn-inner { padding: 8px 12px; font-size: 0.8rem; }
            
            /* Return Button */
             .return-btn { top: 15px; left: 15px; }
             
            /* Ritual Button */
            .text-cn { font-size: 1.6rem; }
            .kana { font-size: 1.5rem; display: none; } /* Hide extra symbols on very small screens */
        }
      `}</style>
      </div>
    </>
  );
};

export default InputForm;
