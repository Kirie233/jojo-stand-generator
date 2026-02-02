import React from 'react';
import CustomRadar from './CustomRadar';
import '../styles/variables.css';
import html2canvas from 'html2canvas';
import ReactMarkdown from 'react-markdown';

const StandCard = ({ standData, onReset }) => {
  if (!standData) return null;

  const { name, abilityName, ability, stats } = standData;

  // Helper: Parse Name (English vs Chinese)
  const parseName = (rawName) => {
    if (!rawName) return { main: 'UNKNOWN', sub: '' };

    // Try "Name (Translation)" format
    const match = rawName.match(/^(.*?)\s*[(（](.*?)[)）]/);
    if (match) {
      return { main: match[1], sub: match[2] };
    }

    // Fallback: If no brackets
    return { main: rawName, sub: '' };
  };

  const { main: mainName, sub: subName } = parseName(name);

  const translatedLabels = {
    power: '破坏力',
    speed: '速度',
    range: '射程距离',
    durability: '持续力',
    precision: '精密动作性',
    potential: '成长性'
  };

  const handleSaveImage = async () => {
    const element = document.querySelector('.stand-card');
    if (!element) return;
    try {
      const canvas = await html2canvas(element, {
        useCORS: true, allowTaint: true, backgroundColor: null, scale: 2, logging: false
      });
      const link = document.createElement('a');
      link.download = `JOJO_${mainName.replace(/\s+/g, '_')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      alert("保存失败: " + err.message);
    }
  };

  return (
    <div className="stand-card-container">
      {/* GLOBAL RETURN BUTTON (Matches InputForm) */}
      <button onClick={onReset} className="return-btn" title="Return to Title">
        <svg className="return-arrow" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20,11 L7.83,11 L13.42,5.41 L12,4 L4,12 L12,20 L13.41,18.59 L7.83,13 L20,13 Z" />
        </svg>
        <span className="return-text">RETURN</span>
      </button>

      <div style={{ textAlign: 'right', marginBottom: 10 }}>
        <button onClick={handleSaveImage} className="save-btn">💾 保存卡片</button>
      </div>

      <div className="stand-card">

        {/* === TOP VISUAL AREA (Fixed Height) === */}
        <div className="visual-area">
          {/* Background: Blurred Clone */}
          <div
            className="card-bg"
            style={standData.imageUrl ? { backgroundImage: `url(${standData.imageUrl})` } : {}}
          ></div>

          {/* Scrim Overlay */}
          <div className="texture-overlay"></div>

          {/* STAND IMAGE (Main Visual) */}
          {standData.imageUrl ? (
            <div
              className="stand-full-bg"
              style={{ backgroundImage: `url(${standData.imageUrl})` }}
            ></div>
          ) : (
            /* Loading State (Only if no image yet) */
            <div className="loading-overlay">GENERATING...</div>
          )}

          {/* Layout Container for Separation */}
          <div className="visual-layout">

            {/* RADAR (Floating in the center-left area) */}
            <div className="radar-container">
              <CustomRadar stats={stats} labels={translatedLabels} />
            </div>

            {/* TOP RIGHT: CATALYST (Floating) */}
            {standData.referenceImage && (
              <div className="catalyst-box-floating">
                <img src={standData.referenceImage} alt="Ref" />
              </div>
            )}

            {/* CORNER INFO: BOTTOM LEFT (MASTER) */}
            <div className="corner-info master">
              <div className="label-line">
                <span className="en">[STAND MASTER]</span>
                <span className="cn">「替身使者」</span>
              </div>
              <h1 className="display-name">{standData.userName || 'YOU'}</h1>
            </div>

            {/* CORNER INFO: BOTTOM RIGHT (STAND) */}
            <div className="corner-info stand">
              <div className="label-line">
                <span className="cn">「替身名字」</span>
                <span className="en">[STAND NAME]</span>
              </div>
              <h1 className="display-name">{mainName}</h1>
              {subName && <h2 className="display-sub-name">{subName}</h2>}
            </div>

          </div>
        </div>


        {/* === BOTTOM INFO AREA (Auto Height) === */}
        <div className="info-area">
          <div className="ability-content">
            <h3>『 {abilityName || '能力'} 』</h3>
            <div className="markdown-ability">
              <ReactMarkdown>{ability}</ReactMarkdown>
            </div>
          </div>
        </div>

      </div>

      {/* RETURN BUTTON (Bottom Action) */}
      <div className="return-container">
        <button onClick={onReset} className="action-return-btn">
          <span>觉醒下一个替身</span>
          <small>AWAKEN NEXT STAND</small>
        </button>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Noto+Serif+SC:wght@700;900&family=Bangers&display=swap');

        .stand-card-container {
            margin: 40px auto;
            max-width: 900px;
            font-family: 'Cinzel', serif;
            position: relative;
            /* 恢复中心对称 */
            transition: all 0.5s ease;
        }

        .stand-card {
            width: 100%;
            border: 6px solid #000;
            background: #fff;
            display: flex;
            flex-direction: column;
            box-shadow: 15px 15px 0px #222; /* Manga Heavy Shadow */
            position: relative;
            overflow: hidden;
            border-radius: 30px; /* GOLDEN WIND ROUNDING */
        }

        /* --- BACKGROUND: CINEMATIC AI --- */
        .visual-area {
            position: relative;
            width: 100%;
            height: 600px; 
            overflow: hidden;
            border-bottom: 6px solid #000;
            background-color: #000; 
        }

        /* 1. Base Layer: Blurred Clone (Fills gaps if aspect ratio differs) */
        .card-bg {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            z-index: 1;
            background-size: cover;
            background-position: center;
            filter: blur(20px) brightness(0.5);
            transform: scale(1.1); /* Remove white edges from blur */
        }

        /* 2. Main Visual Layer: The Generated Image */
        .stand-full-bg {
            position: absolute;
            top: 0; left: 0;
            width: 100%; height: 100%;
            background-size: cover;
            background-position: center;
            z-index: 10;
            /* No Mask - Show full environment */
            mix-blend-mode: normal;
        }

        /* 3. Text Protection Layer (The Scrim) */
        .texture-overlay {
            position: absolute;
            z-index: 15; /* Above Image, Below Text */
            width: 100%; height: 100%;
            background: linear-gradient(
                to bottom,
                rgba(0,0,0,0.9) 0%,     /* Top Darkness for Title */
                rgba(0,0,0,0.4) 20%,
                rgba(0,0,0,0.0) 40%,    /* Clear Center for Stand */
                rgba(0,0,0,0.0) 60%,
                rgba(0,0,0,0.6) 80%,
                rgba(0,0,0,0.95) 100%   /* Bottom Darkness for User/Stats */
            );
            pointer-events: none;
            mix-blend-mode: normal; /* Normal overlay */
            opacity: 1;
        }

        /* Vignette specifically for corners */
        .texture-overlay::after {
            content: '';
            position: absolute;
            top:0; left:0; width:100%; height:100%;
            background: radial-gradient(circle at center, transparent 50%, rgba(0,0,0,0.6) 100%);
            mix-blend-mode: multiply;
        }
        .card-bg::after {
            display: none;
        }

        /* --- VISUAL LAYOUT CONTAINER --- */
        .visual-layout {
            position: absolute;
            top: 0; left: 0;
            width: 100%; height: 100%;
            z-index: 50;
            display: flex;
            flex-direction: column;
            justify-content: flex-end; /* Push content to bottom corners */
            pointer-events: none;
        }

        /* --- RADAR POSITIONING (Bottom Left) --- */
        .radar-container {
            position: absolute;
            bottom: 30px;
            left: 30px;
            /* Removed center-left transform */
            transform: rotate(-3deg);
            pointer-events: auto;
            z-index: 60;
            filter: drop-shadow(0 0 15px rgba(0,0,0,0.5));
        }

        /* --- CORNER INFO BLOCKS --- */
        .corner-info {
            position: absolute;
            z-index: 100;
            pointer-events: auto;
            display: flex;
            flex-direction: column;
        }

        /* TOP LEFT: MASTER */
        .corner-info.master {
            top: 40px;
            left: 40px;
            text-align: left;
        }

        /* BOTTOM RIGHT: STAND NAME */
        .corner-info.stand {
            bottom: 40px;
            right: 40px;
            text-align: right;
            align-items: flex-end;
        }

        /* Label Row styling */
        .label-line {
            display: flex;
            gap: 4px;
            margin-bottom: 5px;
            font-family: 'Noto Serif SC', serif;
            font-size: 1.2rem;
            font-weight: 900;
            color: rgba(255,255,255,0.9);
            text-shadow: 2px 2px 0 #000;
            /* Anime Skew */
            transform: skewX(-10deg);
        }
        
        .label-line .en { color: #ffffffff; } /* Highlight Master/Name tags */
        .label-line .cn { opacity: 0.9; }

        /* Main Display Names */
        .display-name {
            font-family: 'Noto Serif SC', serif;
            font-weight: 900;
            font-size: 4rem; /* Larger */
            line-height: 1;
            color: #fff;
            margin: 0;
            /* Heavy Jojo Outline */
            -webkit-text-stroke: 2px #000;
            paint-order: stroke fill;
            text-shadow: 
                4px 4px 0px #000,
                0 0 20px rgba(255, 215, 0, 0.6);
            /* Dynamic Anime Transform */
            transform: skewX(-10deg) scale(1, 1.05); 
        }

        .display-sub-name {
            font-family: 'Noto Serif SC', serif;
            font-size: 2rem;
            color: #ffd700;
            font-weight: 900;
            margin-top: 5px;
            /* Fix: Ensure stroke sits behind fill */
            -webkit-text-stroke: 4px #000;
            paint-order: stroke fill;
            text-shadow: 2px 2px 0 #000;
            letter-spacing: 2px;
            transform: skewX(-10deg);
        }

        /* --- CATALYST (Top Right Floating Jewel) --- */
        .catalyst-box-floating {
            position: absolute;
            top: 25px; 
            right: 25px;
            width: 100px; height: 100px;
            background: #000;
            border: 4px solid var(--accent-color);
            border-radius: 50%;
            box-shadow: 0 0 20px var(--accent-color), 5px 5px 0 #000;
            overflow: hidden;
            z-index: 120;
            pointer-events: auto;
            display: flex;
            align-items: center; justify-content: center;
        }

        .catalyst-box-floating img {
            width: 100%; height: 100%;
            object-fit: cover;
        }


        /* --- BOTTOM ABILITY AREA --- */
        .info-area {
            background: #fff;
            position: relative;
            /* Rounded Top Right Corner Integration */
            border-top: 6px solid #000;
            border-top-right-radius: 60px;
            padding: 30px;
            margin-top: -2px; /* Connect lines */
        }
        
        .ability-content {
            background: transparent;
            padding: 10px;
            border: none;
            clip-path: none;
        }

        /* Stylized Ability Header: Arrow Shape */
        .ability-content h3 {
            position: relative;
            background: #000;
            color: #fff;
            padding: 8px 30px;
            display: inline-block;
            margin-bottom: 15px;
            font-size: 1.6rem;
            box-shadow: 5px 5px 0 rgba(0,0,0,0.3);
            text-transform: uppercase;
            /* Skewed Tech Label */
            transform: skewX(-15deg);
            clip-path: none;
            border-radius: 4px;
        }

        .ability-content p, .markdown-ability p {
            font-family: 'Noto Serif SC', serif;
            font-size: 1.2rem;
            line-height: 1.6;
            color: #333;
            font-weight: bold;
            margin-bottom: 1rem;
        }

        .markdown-ability strong {
            color: #000;
            background: linear-gradient(180deg, transparent 60%, rgba(213, 0, 249, 0.2) 60%);
            padding: 0 2px;
        }

        .markdown-ability ul, .markdown-ability ol {
            margin-bottom: 1.5rem;
            padding-left: 20px;
        }

        .markdown-ability li {
            font-family: 'Noto Serif SC', serif;
            font-size: 1.1rem;
            line-height: 1.6;
            color: #444;
            font-weight: bold;
            margin-bottom: 0.5rem;
            position: relative;
        }

        .markdown-ability ul li::before {
            content: '◆';
            position: absolute;
            left: -20px;
            color: #d500f9;
            font-size: 0.8rem;
        }
        
        /* Save Button */
        .save-btn {
            background: #6a1b9a; color: #fff; border: 3px solid #000;
            font-weight: 900; box-shadow: 4px 4px 0 #000;
            padding: 8px 24px; font-size: 1.1rem;
            cursor: pointer;
            transition: all 0.2s;
        }
        .save-btn:hover { background: #8e24aa; transform: translate(-2px,-2px); box-shadow: 6px 6px 0 #000; }

        /* Return Button */
        .return-container {
            margin-top: 30px;
            text-align: center;
            padding-bottom: 40px;
        }

        /* === BOTTOM ACTION BUTTON === */
        .action-return-btn {
            background: #000;
            color: #ffd700;
            border: 2px solid #ffd700;
            padding: 10px 30px;
            font-family: 'Anton', sans-serif;
            font-size: 1.2rem;
            cursor: pointer;
            transition: all 0.3s;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            line-height: 1.1;
            box-shadow: 4px 4px 0 rgba(0,0,0,0.5);
            transform: skewX(-10deg);
        }
        .action-return-btn:hover {
            background: #ffd700;
            color: #000;
            transform: skewX(-10deg) translateY(-2px);
            box-shadow: 6px 6px 0 rgba(0,0,0,0.6);
        }
        .action-return-btn small {
            display: block;
            font-size: 0.7rem;
            letter-spacing: 2px;
            color: #999;
            margin-top: 2px;
        }
        .action-return-btn:hover small { color: #000; }

        /* === GLOBAL RETURN BUTTON (Matched InputForm) === */
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

        /* Responsive Fix for Return Button */
        @media (max-width: 1100px) {
           .return-btn {
              top: 10px; left: 10px;
           }
        }

        /* === RESPONSIVE === */
        @media (max-width: 768px) {
             .visual-area { height: auto; min-height: 700px; }
             .visual-layout { flex-direction: column-reverse; }
             .zone-left, .zone-right { width: 100%; }
             .header-group { text-align: center; margin-top: 20px; }
             .radar-group { margin: 0 auto; margin-top: 200px; /* Push down to clear image */ }
             .user-info-right { bottom: auto; top: 400px; right: 10px; } 
             /* This is complex on mobile; simplified stack is better */
        }
      `}</style>
    </div >
  );
};

export default StandCard;
