import React, { useState, useEffect, useRef } from 'react';
import '../styles/variables.css';
import standArrowImg from '../assets/stand_arrow.png';

const EXAMPLES_SONG = ["Killer Queen", "Last Train Home", "Roundabout", "Walk Like an Egyptian", "Sono Chi no Sadame"];
const EXAMPLES_NAME = ["Jotaro Kujo", "Giorno Giovanna", "Joseph Joestar", "Dio Brando", "Rohan Kishibe"];
const COLORS = [
  { name: "Star Platinum Purple", value: "#7B1FA2" },
  { name: "Magician's Red", value: "#D50000" },
  { name: "Hierophant Green", value: "#00C853" },
  { name: "Silver Chariot", value: "#B0BEC5" },
  { name: "The World Gold", value: "#FFD700" },
  { name: "Killer Queen Pink", value: "#FF4081" },
  { name: "Sticky Fingers Blue", value: "#2962FF" },
  { name: "Black Sabbath", value: "#000000" }
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
    sub: "THE FOOL - 0",
    plain: "请输入你的姓名或昵称",
    placeholder: "空条承太郎 / Jotaro Kujo",
    random: EXAMPLES_NAME
  },
  {
    id: 'SONG',
    question: "灵魂的旋律？",
    sub: "THE LOVERS - VI",
    plain: "输入一首你喜欢的歌曲名或歌手",
    placeholder: "Killer Queen / Michael Jackson",
    random: EXAMPLES_SONG
  },
  {
    id: 'COLOR',
    question: "精神的波纹色？",
    sub: "THE MAGICIAN - I",
    plain: "选择代表你精神能量的颜色",
    type: 'color'
  },
  {
    id: 'PERSONALITY',
    question: "你的欲望与执念？",
    sub: "THE DEVIL - XV",
    plain: "选择或输入你内心最深处的渴望",
    type: 'tags'
  },
  {
    id: 'PHOTO',
    question: "灵魂投影 (念写)",
    sub: "HERMIT PURPLE - IX",
    plain: "上传一张照片作为替身外形的参考",
    type: 'upload'
  },
  {
    id: 'RITUAL',
    question: "接受试炼",
    sub: "THE WORLD - XXI",
    plain: "觉醒时刻已到",
    type: 'final'
  }
];

const InputForm = ({ onSubmit, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    userName: '',
    song: '',
    color: '',
    personality: '',
    referenceImage: null
  });
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState('next');

  const handleNext = () => {
    const fieldMap = ['userName', 'song', 'color', 'personality', 'referenceImage'];
    const currentFieldValue = formData[fieldMap[currentStep]];
    const stepType = STEPS[currentStep].type;

    // Allow empty for optional? No, let's easier for now.
    // Ritual step doesn't need input.
    if (stepType === 'final') {
      onSubmit(formData);
      return;
    }

    if (currentFieldValue || stepType === 'upload') {
      setIsAnimating(true);
      setDirection('next');
      setTimeout(() => {
        setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
        setIsAnimating(false);
      }, 600); // Wait for burn animation
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setDirection('prev');
      setTimeout(() => {
        setCurrentStep(prev => prev - 1);
        setIsAnimating(false);
      }, 600);
    }
  };

  const handleChange = (key, val) => {
    setFormData({ ...formData, [key]: val });
  };

  const handleRandom = () => {
    const step = STEPS[currentStep];
    if (step.random) {
      const rand = step.random[Math.floor(Math.random() * step.random.length)];
      handleChange(getFieldKey(), rand);
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
    <div className="tarot-container">
      {/* RUN AWAY BUTTON (Nigerundayo!) */}
      {onCancel && (
        <button className="nigerundayo-btn" onClick={onCancel} title="Tactical Retreat!">
          <div className="run-icon">
            <img src="/assets/nigerundayo.png" alt="Run!" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
          </div>
          <span className="run-text">尼给路达哟!</span>
        </button>
      )}

      {/* TBC Progress Arrow */}
      <div className="tbc-progress-container">
        <div className="tbc-arrow-bg">
          <div className="tbc-arrow-fill" style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}></div>
        </div>
        <span className="tbc-text">TO BE CONTINUED</span>
      </div>

      <div className={`tarot-card-frame ${isAnimating ? (direction === 'next' ? 'burning' : 'restoring') : ''}`}>

        {/* Watermark */}
        <div className="tarot-watermark">{step.sub.split(' - ')[0]}</div>

        <div className="card-header">
          <span className="card-sub">{step.sub}</span>
          <h2 className="card-question">{step.question}</h2>
          <p className="card-plain">{step.plain}</p>
        </div>

        <div className="card-body">
          {step.type === 'color' ? (
            <div className="color-grid">
              {COLORS.map(c => (
                <div
                  key={c.value}
                  className={`color-swatch ${currentVal === c.value ? 'selected' : ''}`}
                  style={{ background: c.value }}
                  onClick={() => handleChange('color', c.value)}
                  title={c.name}
                />
              ))}
              <div className="color-label">{COLORS.find(c => c.value === currentVal)?.name || "自定义颜色 (Custom)"}</div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px', width: '90%', margin: '15px auto' }}>
                <input
                  type="color"
                  value={currentVal.startsWith('#') ? currentVal : '#000000'}
                  onChange={(e) => handleChange('color', e.target.value)}
                  style={{ width: '50px', height: '54px', border: '2px solid #000', borderRadius: '8px', cursor: 'pointer', padding: '0' }}
                />
                <input
                  className="tarot-input-custom"
                  placeholder="#HEX 或 颜色名称..."
                  value={currentVal}
                  onChange={(e) => handleChange('color', e.target.value)}
                  onKeyDown={handleKeyDown}
                  style={{ flex: 1, margin: 0 }}
                />
              </div>
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
                  <img src={formData.referenceImage} className="preview-image" alt="Spirit" />
                ) : (
                  <div className="void-placeholder">
                    <img src="/assets/hermit_purple_smashed_camera_full_color.png" className="upload-art-full" alt="Spirit Camera" />
                    <div className="hover-overlay-simple">
                      <span className="reveal-text">注入念力</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="polaroid-footer-text">
                <span className="polaroid-label">念写 / 隐者之紫</span>
              </div>
            </div>
          ) : step.type === 'final' ? (
            <div className="arrow-ritual-container">
              <div className="sunburst-bg"></div>
              <img src="/assets/arrow_gold.png" className="floating-arrow-lg" alt="Stand Arrow" />
              <button className="awakening-btn" onClick={() => onSubmit(formData)}>
                <span className="menacing-char">ゴ</span>
                觉醒替身 (AWAKEN)
                <span className="menacing-char">ゴ</span>
              </button>
            </div>
          ) : (
            <div className="input-group">
              {/* Ink Splatter Decoration */}
              <div className="ink-splatter splatter-1"></div>
              <div className="ink-splatter splatter-2"></div>

              <div className="speech-bubble-wrapper">
                <input
                  className="speech-bubble-input"
                  placeholder={step.placeholder}
                  value={currentVal}
                  onChange={(e) => handleChange(getFieldKey(), e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                />
              </div>



              {step.random && (
                <div style={{ textAlign: 'right', marginTop: '-15px', position: 'relative', zIndex: 10 }}>
                  <button className="random-btn-styled" onClick={handleRandom} title="Destiny">
                    🎲 命运 (Random)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="card-footer">
          <button className="nav-btn prev" onClick={handlePrev} disabled={currentStep === 0}>
            ◀ PREV
          </button>
          <span className="page-indicator">{currentStep + 1} / {STEPS.length}</span>
          {step.type !== 'final' && (
            <button className="nav-btn next" onClick={handleNext}>
              NEXT ▶
            </button>
          )}
        </div>
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
        }

        /* NIGERUNDAYO BUTTON */
        .nigerundayo-btn {
          position: absolute;
          top: 0; left: 0;
          background: transparent;
          border: none;
          cursor: pointer;
          z-index: 2000;
          display: flex;
          align-items: center;
          gap: 5px;
          opacity: 0.7;
          transition: all 0.2s;
        }
        .nigerundayo-btn:hover {
          opacity: 1;
          transform: translateX(-5px);
        }
        .run-icon { font-size: 2rem; }
        .run-text {
          font-family: 'ZCOOL KuaiLe', cursive;
          color: #fff;
          background: #000;
          padding: 2px 5px;
          font-size: 1rem;
          border: 1px solid #fff;
          display: none; /* Show on hover */
        }
        .nigerundayo-btn:hover .run-text { display: block; }

        .tbc-progress-container {
          position: absolute;
          bottom: 10px; left: 50px;
          display: flex;
          align-items: center;
          gap: 10px;
          opacity: 0.8;
        }
        
        .tbc-arrow-bg {
          width: 300px; height: 40px;
          background: rgba(0,0,0,0.5);
          clip-path: polygon(0% 20%, 90% 20%, 100% 50%, 90% 80%, 0% 80%);
          border: 2px solid #fff;
          position: relative;
        }
        
        .tbc-arrow-fill {
           height: 100%;
           background: #d500f9;
           transition: width 0.5s ease-out;
           clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
        }

        .tbc-text {
            font-family: 'Anton', sans-serif;
            font-size: 1.5rem;
            color: #d500f9;
            text-shadow: 2px 2px #000;
            transform: skewX(-10deg);
        }

        .tarot-card-frame {
            position: relative;
            width: 400px;
            background: #fff;
            border: 4px solid #000;
            box-shadow: 15px 15px 0 #000;
            padding: 30px;
            text-align: center;
            transition: all 0.5s;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            gap: 20px;
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
            animation: burnCard 0.6s forwards;
        }
        .tarot-card-frame.restoring {
            animation: restoreCard 0.6s forwards;
        }

        .card-header { position: relative; z-index: 2; flex-shrink: 0; }
        .card-body { 
            position: relative; z-index: 2; width: 100%; 
            display: flex; flex-direction: column; gap: 10px; /* Reduced gap */
            /* Removed max-height and overflow to disable scrollbar */
            padding-right: 5px; 
            padding-bottom: 5px;
        }

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
            font-size: 1.2rem; /* Smaller */
            margin: 0;
            color: #000;
            text-align: left; /* Move to top-left */
            padding-left: 20px;
            border-left: 5px solid #d500f9;
            padding-bottom: 5px;
            width: fit-content;
        }
        .card-plain {
            font-family: 'Noto Serif SC', serif;
            font-size: 0.9rem;
            color: #888;
            margin: 0;
            font-style: italic;
        }

        /* INPUTS */
        /* SPEECH BUBBLE INPUT */
        .speech-bubble-wrapper {
            position: relative;
            padding: 30px;
            filter: drop-shadow(4px 4px 0 #000);
            transform: rotate(-1deg);
        }
        .speech-bubble-input {
            width: 100%;
            background: #fff;
            border: 4px solid #000;
            border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px; /* Irregular */
            padding: 20px 30px;
            font-family: 'Bangers', cursive;
            font-size: 2.5rem; /* HUGE TEXT */
            text-align: center;
            color: #000;
            outline: none;
            clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 80% 100%, 75% 115%, 70% 100%, 0% 100%);
            margin-bottom: 20px; /* Space for the tail */
        }
        .speech-bubble-input::placeholder { color: #ddd; font-family: 'Courier New'; font-size: 1rem; }

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
            background: transparent;
            border: none;
            border-bottom: 2px solid #000;
            padding: 5px;
            font-family: 'Courier New', monospace;
            text-align: center;
            outline: none;
            margin-top: 10px;
            color: #000;
        }

        .tarot-input-custom {
            width: 90%; /* Center alignment fix */
            background: #f5f5f5; /* Light Gray for Contrast */
            border: 2px dashed #000;
            border-radius: 8px;
            padding: 15px;
            font-family: 'Noto Serif SC', serif;
            font-size: 1.1rem;
            text-align: center;
            outline: none;
            margin: 20px auto; /* Center horizontally */
            color: #000; /* Black Text */
            transition: all 0.3s;
            display: block; /* Ensure margin auto works */
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

        /* COLORS - DIAMONDS */
        .color-grid { display: flex; flex-wrap: wrap; gap: 20px; justify-content: center; padding: 20px; }
        .color-swatch {
            width: 50px; height: 50px; 
            border: 2px solid #000; 
            cursor: pointer; 
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            transform: rotate(45deg); /* Diamond Shape */
            margin: 10px;
            box-shadow: 3px 3px 0 rgba(0,0,0,0.2);
        }
        .color-swatch:hover { 
            transform: rotate(45deg) scale(1.2); 
            z-index: 10;
        }
        .color-swatch.selected { 
            border: 3px solid #fff; 
            transform: rotate(45deg) scale(1.3); 
            box-shadow: 0 0 20px currentColor, 0 0 40px currentColor; /* Glowing Explosion */
            z-index: 20;
        }
        .color-label { grid-column: span 4; font-family: 'Cinzel'; font-size: 0.9rem; margin-top: 5px; color: #000; font-weight: bold; }

        /* TAGS - TORN PAPER */
        .tags-grid { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; padding: 5px; }
        .tag-chip {
            padding: 6px 12px; /* Compact padding */ 
            background: #fff; 
            color: #000;
            border: 1px solid #000; 
            cursor: pointer; 
            font-family: 'Noto Serif SC', serif;
            font-weight: bold;
            font-size: 0.9rem;
            transition: all 0.2s;
            box-shadow: 2px 2px 0 #000;
            /* Torn Paper Effect */
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

        /* UPLOAD - POLAROID/FILM */
        /* UPLOAD - POLAROID/FILM REDESIGN */
        .spirit-photo-box {
            width: 300px;
            height: 380px;
            background: #fff;
            padding: 15px 15px 50px 15px;
            box-shadow: 5px 5px 15px rgba(0,0,0,0.2);
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
        
        .tape-decoration {
            position: absolute;
            top: -15px; right: -25px;
            width: 100px; height: 40px;
            background: url('/assets/tape.png') no-repeat center/contain;
            transform: rotate(45deg);
            z-index: 10;
            opacity: 0.9;
            pointer-events: none;
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
        .polaroid-label {
            font-family: 'ZCOOL KuaiLe', cursive;
            font-size: 1rem;
            color: #7B1FA2;
            letter-spacing: 2px;
            font-weight: bold;
        }
        .preview-image { width: 100%; height: 100%; object-fit: cover; }
        
        #upload-hidden { display: none; }

        /* ARROW RITUAL */
        .arrow-ritual-container { position: relative; display: flex; flex-direction: column; align-items: center; gap: 30px; margin-top: 20px; }
        .sunburst-bg {
            position: absolute; top: 50%; left: 50%;
            width: 400px; height: 400px;
            background: repeating-conic-gradient(from 0deg, rgba(255, 215, 0, 0.2) 0deg 10deg, transparent 10deg 20deg);
            transform: translate(-50%, -50%);
            animation: spin 10s linear infinite;
            z-index: -1;
            border-radius: 50%;
            pointer-events: none;
        }
        @keyframes spin { from { transform: translate(-50%, -50%) rotate(0deg); } to { transform: translate(-50%, -50%) rotate(360deg); } }

        .floating-arrow-lg {
            width: 180px;
            filter: drop-shadow(0 0 15px rgba(255, 215, 0, 0.8));
            animation: float 3s ease-in-out infinite;
        }
        .awakening-btn {
            background: #000; color: #FFD700;
            border: 4px solid #FFD700;
            padding: 20px 50px;
            font-family: 'Bangers', cursive;
            font-size: 2rem;
            cursor: pointer;
            display: flex; align-items: center; gap: 15px;
            transition: all 0.1s;
            box-shadow: 10px 10px 0 #d500f9;
            text-transform: uppercase;
            position: relative;
            overflow: hidden;
        }
        .awakening-btn:hover {
            transform: translate(-2px, -2px);
            box-shadow: 12px 12px 0 #d500f9;
            text-shadow: 0 0 10px #FFD700;
            animation: shake 0.5s infinite;
        }

        /* FOOTER */
        .card-footer {
            display: flex; justify-content: space-between; align-items: center;
            border-top: 1px solid #eee; padding-top: 20px;
        }
        .nav-btn {
            background: none; border: none; font-family: 'Anton'; font-size: 1.2rem; cursor: pointer;
            color: #000; transition: color 0.2s;
        }
        .nav-btn:disabled { color: #ddd; cursor: not-allowed; }
        .nav-btn:hover:not(:disabled) { color: #d500f9; }
        .page-indicator { font-family: 'Courier New'; font-weight: bold; }

        @keyframes burnCard {
            0% { transform: rotate(0deg); opacity: 1; filter: contrast(1); }
            50% { transform: rotate(5deg) scale(0.9); opacity: 0.5; filter: contrast(2) sepia(1); }
            100% { transform: rotate(10deg) scale(0.8); opacity: 0; filter: contrast(5) brightness(0.5); }
        }
        @keyframes restoreCard {
            0% { transform: rotate(-10deg) scale(0.8); opacity: 0; }
            100% { transform: rotate(0deg) scale(1); opacity: 1; }
        }
        @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
        }
      `}</style>
    </div >
  );
};

export default InputForm;
