import React, { useEffect } from 'react';
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

  useEffect(() => {
    // Apply cleaner JOJO background and hide overflow to prevent scroll jumping
    document.body.classList.add('clean-jojo-body');
    return () => {
      document.body.classList.remove('clean-jojo-body');
    };
  }, []);
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

      {/* WHITESNAKE PREMIUM IMMERSIVE HUB - Hand-Held V3.1 (Fixed Conflict) */}
      <div className="whitesnake-handheld-root">
        {/* CHARACTER BASE (Empty Hand for Interactive Placement) */}
        <div className="whitesnake-hand-character">
          <img src="/assets/whitesnake_empty_hand_premium-removebg-preview.png" alt="Whitesnake" />

          <div className="interactive-hand-zone">
            {/* Visual Disc (Memory) */}
            {standData.imageUrl && (
              <div className="hand-slot slot-memory">
                <button
                  className="disc-trigger-btn"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.download = `JOJO_ART_${mainName.replace(/\s+/g, '_')}.png`;
                    link.href = standData.imageUrl;
                    link.click();
                  }}
                >
                  <div className="flat-metallic-disc">
                    <div className="disc-art-layer" style={{ backgroundImage: `url(${standData.imageUrl})` }}></div>
                    <div className="disc-spindle"></div>
                    <div className="disc-glint"></div>
                  </div>
                </button>
                <div className="slot-action-label">
                  <span className="icon">📸</span>
                  <div className="text">
                    <span className="label-cn">提取影像</span>
                    <span className="label-en">MEMORY DISC</span>
                  </div>
                </div>
              </div>
            )}

            {/* Data Disc (Stand) */}
            <div className="hand-slot slot-stand">
              <button className="disc-trigger-btn" onClick={handleSaveImage}>
                <div className="flat-metallic-disc">
                  <div className="disc-art-layer" style={{ backgroundImage: `url(${standData.imageUrl})` }}></div>
                  <div className="disc-spindle"></div>
                  <div className="disc-glint"></div>
                </div>
              </button>
              <div className="slot-action-label">
                <span className="icon">💽</span>
                <div className="text">
                  <span className="label-cn">导出磁碟</span>
                  <span className="label-en">STAND DISC</span>
                </div>
              </div>
            </div>
          </div>
        </div>

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
            /* Loading State (Tech HUD Style) */
            <div className="tech-loading-overlay">
              <div className="scanner-line"></div>
              <div className="tech-grid-bg"></div>
              <div className="loading-text-group">
                <span className="tech-text">INITIALIZING VISUALS...</span>
                <span className="tech-sub">SYNCING SOUL DATA</span>
              </div>
            </div>
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
          {standData.panel ? (
            /* --- NEW STRUCTURED UI (Tech HUD) --- */
            <div className="tech-hud-container">

              {/* 1. HUD Header: Type & Summary */}
              <div className="hud-header">
                <div className="hud-top-row">
                  <h3 className="hud-title">『 {abilityName || standData.panel?.abilityName || '能力解析'} 』</h3>
                  <span className="type-badge">{standData.type || '未知类型'}</span>
                </div>
                <div className="hud-desc-box">
                  <p className="hud-summary">{standData.panel.long_desc || standData.panel.desc}</p>
                  {standData.panel.battleCry && (
                    <div className="battle-cry-sticker">{standData.panel.battleCry}</div>
                  )}
                </div>
              </div>

              {/* 2. Mechanics Grid */}
              <div className="mechanics-grid">
                {standData.panel.mechanics.map((mech, i) => (
                  <div key={i} className="mech-card">
                    <div className="mech-card-title">{mech.title}</div>
                    <div className="mech-card-body">{mech.content}</div>
                  </div>
                ))}
              </div>

              {/* 3. Limitations (Warning System) */}
              {standData.panel.limitations && standData.panel.limitations.length > 0 && (
                <div className="warning-system">
                  <div className="warning-label">⚠ SYSTEM RESTRICTIONS / 射程与代价</div>
                  <ul className="warning-list">
                    {standData.panel.limitations.map((limit, i) => (
                      <li key={i}>{limit}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 4. Quote Footer */}
              {standData.panel.quote && (
                <div className="quote-footer">
                  "{standData.panel.quote}"
                </div>
              )}
            </div>
          ) : (
            /* --- LEGACY MARKDOWN FALLBACK --- */
            <div className="ability-content">
              <h3>『 {abilityName || '能力'} 』</h3>
              <div className="markdown-ability">
                <ReactMarkdown>{ability}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>

      </div >

      {/* RETURN BUTTON (Bottom Action) */}
      < div className="return-container" >
        <button onClick={onReset} className="action-return-btn">
          <span>觉醒下一个替身</span>
          <small>AWAKEN NEXT STAND</small>
        </button>
      </div >

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


        /* --- BOTTOM ABILITY AREA: DARK MODE STAND PROFILE (V5.5) --- */
        .info-area {
            background: #0d0316; /* Deep Midnight Ebony */
            position: relative;
            /* Premium Metallic Gold Border */
            border: 4px solid #ffd700;
            outline: 1px solid #000;
            outline-offset: -8px;
            border-top-right-radius: 40px;
            border-bottom-left-radius: 40px;
            padding: 40px;
            margin-top: 20px;
            box-shadow: 20px 20px 0 rgba(0,0,0,0.8);
            /* CRITICAL: Allow cards to pop out */
            overflow: visible; 
            color: #fff;
        }

        /* Subtle Dark Screentone Accents */
        .info-area::before {
            content: '';
            position: absolute;
            inset: 0;
            background-image: 
                radial-gradient(rgba(255, 215, 0, 0.05) 1px, transparent 1px);
            background-size: 12px 12px;
            pointer-events: none;
            opacity: 0.8;
        }

        .tech-hud-container {
            position: relative;
            z-index: 2;
        }

        /* High-Contrast Header */
        .hud-header {
            border-bottom: 2px solid rgba(255, 215, 0, 0.3);
            padding-bottom: 20px;
            margin-bottom: 30px;
        }

        .hud-top-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }

        .hud-title {
            color: #ffd700;
            font-size: 2.2rem;
            margin: 0;
            line-height: 1;
            transform: skewX(-12deg);
            text-shadow: 0 0 15px rgba(255, 215, 0, 0.4);
            font-family: 'Noto Serif SC', serif;
            font-weight: 900;
            letter-spacing: 2px;
        }

        .type-badge {
            background: #ffd700;
            color: #000;
            padding: 4px 15px;
            font-family: 'Anton', sans-serif;
            font-size: 1rem;
            transform: skewX(-10deg);
            font-weight: bold;
        }

        .hud-summary {
            color: #eee;
            font-size: 1.25rem;
            line-height: 1.7;
            font-family: 'Noto Serif SC', serif;
            font-weight: 500;
        }

        .mech-card {
            background: rgba(255, 255, 255, 0.05);
            border-left: 5px solid #ffd700;
            padding: 20px;
            box-shadow: 4px 4px 10px rgba(0,0,0,0.5);
            transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
            position: relative;
            z-index: 1;
            cursor: pointer;
            overflow: hidden; /* For scan line */
            border-radius: 0 10px 10px 0;
        }

        /* --- Option D: SPW Deep Scan Effects --- */
        
        /* Data Background Overlay */
        .mech-card::before {
            content: '01011010 11001010 10101111 00110011';
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            font-family: 'Courier New', monospace;
            font-size: 0.8rem;
            color: rgba(255, 215, 0, 0.03);
            white-space: pre-wrap;
            word-break: break-all;
            padding: 10px;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.3s;
            z-index: 0;
        }

        /* Scanning Line */
        .mech-card::after {
            content: '';
            position: absolute;
            top: -100%; left: 0;
            width: 100%; height: 2px;
            background: linear-gradient(90deg, transparent, #d500f9, transparent);
            box-shadow: 0 0 15px #d500f9;
            z-index: 2;
            opacity: 0;
            pointer-events: none;
        }

        .mech-card:hover {
            transform: scale(1.04) translateY(-5px);
            /* Slightly lighter background for better legibility contrast */
            background: rgba(71, 250, 35, 1);
            box-shadow: 0 15px 35px rgba(0,0,0,0.8), 0 0 15px rgba(255, 215, 0, 0.15);
            z-index: 10;
        }

        .mech-card:hover::before {
            opacity: 0.6; /* Softer data texture */
        }

        .mech-card:hover::after {
            opacity: 1;
            /* Brighter cyan/white scan line for high visibility */
            background: linear-gradient(90deg, transparent, #00f2ff, #fff, #00f2ff, transparent);
            animation: spwScan 1.2s infinite linear;
        }

        @keyframes spwScan {
            0% { top: -10%; }
            100% { top: 110%; }
        }

        .mech-card-title {
            color: #ffd700;
            font-weight: 900;
            font-size: 1.3rem;
            margin-bottom: 10px;
            text-transform: uppercase;
            font-family: 'Noto Serif SC', serif;
        }

        .mech-card-body {
            color: #ccc;
            font-size: 1.1rem;
            line-height: 1.5;
            font-family: 'Noto Serif SC', serif;
        }

        /* Warning System: High Contrast Red/Gold */
        .warning-system {
            background: rgba(211, 47, 47, 0.1);
            border: 2px solid #d32f2f;
            padding: 20px;
            margin-top: 30px;
            box-shadow: 0 0 20px rgba(211, 47, 47, 0.2);
        }

        .warning-label {
            color: #ff5252;
            font-family: 'Anton', sans-serif;
            font-weight: bold;
            font-size: 1rem;
            letter-spacing: 2px;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .warning-list li {
            color: #ff9e9e;
            font-family: 'Noto Serif SC', serif;
            font-weight: bold;
            margin-bottom: 8px;
            list-style: none;
            position: relative;
        }

        .ability-content p, .markdown-ability p {
            font-family: 'Noto Serif SC', serif;
            font-size: 1.2rem;
            line-height: 1.7;
            color: #111;
            font-weight: bold;
            margin-bottom: 1.2rem;
            /* Readability: No Skew */
            transform: none !important;
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
            margin-top: 50px;
            display: flex;
            justify-content: center;
            align-items: center;
            padding-bottom: 80px;
            width: 100%;
        }

        /* === BOTTOM ACTION BUTTON (V5.0 Premium) === */
        .action-return-btn {
            background: #ffd700;
            color: #000;
            border: 4px solid #000;
            padding: 15px 60px;
            font-family: 'Anton', sans-serif;
            font-size: 1.8rem;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            line-height: 1.0;
            box-shadow: 10px 10px 0 rgba(0,0,0,1);
            transform: skewX(-12deg);
            text-transform: uppercase;
            font-weight: 900;
        }
        .action-return-btn:hover {
            background: #fff;
            color: #d500f9;
            transform: skewX(-12deg) translateY(-5px) scale(1.05);
            box-shadow: 15px 15px 0 #000;
            border-color: #d500f9;
        }
        .action-return-btn span { font-size: 2rem; display: block; }
        .action-return-btn small { font-size: 0.9rem; letter-spacing: 5px; opacity: 0.8; margin-top: 5px; }
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

        /* ========================================= */
        /* === TECH HUD STYLES (STRUCTURED AI) === */
        /* ========================================= */
        
        .tech-hud-container {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        /* --- HEADER & TYPE --- */
        .hud-header {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .hud-top-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 2px solid #000;
            padding-bottom: 5px;
            margin-bottom: 5px;
        }

        .hud-title {
            margin: 0;
            background: #000;
            color: #fff;
            padding: 5px 20px;
            font-size: 1.5rem;
            transform: skewX(-15deg);
            box-shadow: 4px 4px 0 rgba(0,0,0,0.3);
        }

        .type-badge {
            font-family: 'Anton', sans-serif;
            background: #fff;
            color: #000;
            border: 2px solid #000;
            padding: 2px 10px;
            font-size: 0.9rem;
            letter-spacing: 1px;
            text-transform: uppercase;
            box-shadow: 2px 2px 0 #000;
        }

        .hud-desc-box {
            position: relative;
            background: rgba(0,0,0,0.05); /* Very light grey */
            border-left: 4px solid #6a1b9a; /* Purple accent */
            padding: 10px 15px;
            font-family: 'Noto Serif SC', serif;
            font-weight: bold;
            font-size: 1.1rem;
            line-height: 1.5;
            color: #333;
        }
        
        .battle-cry-sticker {
            position: absolute;
            top: -15px;
            right: 0px;
            background: #d500f9;
            color: #fff;
            font-family: 'Bangers', cursive;
            font-size: 1.2rem;
            padding: 2px 10px;
            transform: rotate(3deg);
            box-shadow: 2px 2px 0 #000;
            z-index: 10;
        }

        /* --- MECHANICS GRID --- */
        .mechanics-grid {
            display: grid;
            grid-template-columns: 1fr 1fr; /* 2 Columns */
            gap: 15px;
        }
        
        @media (max-width: 600px) {
            .mechanics-grid { grid-template-columns: 1fr; }
        }

        .mech-card {
            border: 2px solid #000;
            background: #fff;
            box-shadow: 4px 4px 0 rgba(0,0,0,0.1);
            transition: transform 0.2s;
        }
        .mech-card:hover {
            transform: translateY(-2px);
            box-shadow: 6px 6px 0 rgba(0,0,0,0.2);
        }

        .mech-card-title {
            background: #000;
            color: #ffd700;
            font-family: 'Anton', sans-serif;
            font-size: 1rem;
            padding: 5px 10px;
            letter-spacing: 1px;
        }

        .mech-card-body {
            padding: 10px;
            font-family: 'Noto Serif SC', serif;
            font-size: 0.95rem;
            line-height: 1.4;
            color: #444;
            font-weight: 600;
        }

        /* --- WARNING SYSTEM --- */
        .warning-system {
            margin-top: 5px;
            border: 2px solid #d32f2f;
            background: rgba(211, 47, 47, 0.05);
            position: relative;
            padding: 15px;
        }
        
        .warning-label {
            position: absolute;
            top: -12px;
            left: 10px;
            background: #d32f2f;
            color: #fff;
            font-family: 'Anton', sans-serif;
            font-size: 0.8rem;
            padding: 2px 8px;
            letter-spacing: 1px;
        }

        .warning-list {
            margin: 0;
            padding-left: 20px;
            list-style-type: none; 
        }

        .warning-list li {
            position: relative;
            font-family: 'Noto Serif SC', serif;
            font-size: 0.95rem;
            color: #b71c1c; /* Dark Red */
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .warning-list li::before {
            content: '!';
            position: absolute;
            left: -20px;
            font-weight: 900;
            color: #d32f2f;
        }

        /* --- QUOTE FOOTER --- */
        .quote-footer {
            text-align: center;
            font-family: 'Noto Serif SC', serif;
            font-size: 1.2rem;
            font-style: italic;
            color: #666;
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px dashed #ccc;
        }

        /* --- WHITESNAKE PREMIUM HANDHELD HUB (V3) --- */
        .stand-card-container {
            margin-left: 400px !important;
            transition: all 0.5s ease;
            position: relative;
            padding: 60px 40px;
            width: calc(100vw - 400px);
            min-height: 100vh;
        }

        /* --- WHITESNAKE POLISHED SIDEBAR (V4.8) --- */
        .whitesnake-handheld-root {
            position: fixed;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 380px;
            height: 550px;
            z-index: 200;
            pointer-events: none;
            opacity: 1;
        }

        .whitesnake-hand-character {
            position: relative;
            width: 100%;
            height: 100%;
            animation: characterHover 8s ease-in-out infinite;
        }

        /* ANIME-ACCURATE WISPY AURA (Silhouette Masking) */
        .whitesnake-hand-character::after {
            content: '';
            position: absolute;
            inset: -30px; 
            background: #a300ff;
            -webkit-mask-image: url('/assets/whitesnake_empty_hand_premium-removebg-preview.png');
            mask-image: url('/assets/whitesnake_empty_hand_premium-removebg-preview.png');
            -webkit-mask-size: contain;
            mask-size: contain;
            -webkit-mask-repeat: no-repeat;
            mask-repeat: no-repeat;
            -webkit-mask-position: bottom center;
            mask-position: bottom center;
            filter: blur(40px);
            opacity: 0.5;
            z-index: -1;
            animation: auraPulse 4s ease-in-out infinite alternate;
        }

        @keyframes auraPulse {
            from { opacity: 0.3; filter: blur(30px); transform: scale(0.95); }
            to { opacity: 0.7; filter: blur(50px); transform: scale(1.05); }
        }

        @keyframes characterHover {
            0%, 100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-15px) scale(1.01); }
        }

        .whitesnake-hand-character img {
            width: 100%; height: 100%; object-fit: contain;
            object-position: bottom center;
            position: relative;
            z-index: 2;
            filter: drop-shadow(0 0 10px rgba(163, 0, 255, 0.5));
        }

        .interactive-hand-zone {
            position: absolute;
            inset: 0;
            pointer-events: none;
        }

        .hand-slot {
            position: absolute;
            display: flex;
            flex-direction: column;
            align-items: center;
            pointer-events: auto;
            z-index: 60;
            transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);
        }

        /* Sidebar Disc Layout: Side-by-side on the lower palm (Anti-overlap) */
        .slot-memory {
            left: 15%;
            top: 68%;
            transform: rotate(-3deg);
        }
        .slot-stand {
            left: 52%;
            top: 68%;
            transform: rotate(3deg);
        }

        .hand-slot:hover {
            transform: scale(1.15) translateY(-20px) rotate(0deg);
            z-index: 100;
        }

        .disc-trigger-btn {
            background: none; border: none; padding: 0; cursor: pointer;
            width: 65px; /* Miniature scale for palm nesting */
            height: 65px;
            position: relative;
        }

        .flat-metallic-disc {
            width: 100%; height: 100%;
            border-radius: 50%;
            background: linear-gradient(135deg, #ddd 0%, #fff 40%, #bbb 100%);
            position: relative;
            overflow: hidden;
            border: 3px solid #000;
            box-shadow: 0 10px 25px rgba(0,0,0,0.8);
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .hand-slot:hover .flat-metallic-disc {
            transform: rotate(5deg);
            box-shadow: 0 0 30px rgba(163, 0, 255, 0.6);
        }

        .disc-art-layer {
            position: absolute; inset: 0;
            background-size: cover; background-position: center;
            mix-blend-mode: hard-light;
            opacity: 0.6;
            mask-image: radial-gradient(circle, black 35%, transparent 90%);
        }

        .disc-spindle {
            position: absolute; top: 50%; left: 50%;
            width: 14px; height: 14px; border-radius: 50%;
            background: #000; border: 3px solid #777;
            transform: translate(-50%, -50%);
            z-index: 10;
        }

        .disc-glint {
            position: absolute; inset: 0;
            background: conic-gradient(from 0deg, transparent, rgba(255,255,255,0.5), transparent 30%);
            animation: discReflect 3s linear infinite;
            mix-blend-mode: overlay;
        }
        @keyframes discReflect { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .slot-action-label {
            margin-top: 10px;
            background: rgba(13, 3, 22, 0.95);
            border: 1px solid #ffd700;
            padding: 5px 12px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.6);
            opacity: 0.8;
            transform: skewX(-10deg);
            transition: all 0.3s;
            white-space: nowrap;
        }
        .hand-slot:hover .slot-action-label {
            opacity: 1;
            background: #25093a;
            transform: skewX(-10deg) translateY(-3px) scale(1.02);
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.4);
        }

        .slot-action-label .icon { font-size: 1rem; }
        .slot-action-label .label-cn { display: block; font-family: 'Noto Serif SC', serif; font-size: 0.8rem; color: #fff; line-height: 1; font-weight: 900; }
        .slot-action-label .label-en { display: block; font-family: 'Anton', sans-serif; font-size: 0.6rem; color: #ffd700; letter-spacing: 1px; margin-top: 2px; }

        /* --- TECH LOADING OVERLAY --- */
        .tech-loading-overlay {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            z-index: 20;
            background: #000;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            overflow: hidden;
        }
        
        .tech-grid-bg {
            position: absolute; inset: 0;
            background-image: 
                linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px);
            background-size: 40px 40px;
            opacity: 0.3;
        }
        
        .scanner-line {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 5px;
            background: #00ffff;
            box-shadow: 0 0 15px #00ffff;
            animation: scanDown 2s linear infinite;
            z-index: 5;
        }
        @keyframes scanDown { 0% { top: -10%; } 100% { top: 110%; } }
        
        .loading-text-group {
            z-index: 10;
            text-align: center;
            border: 2px solid #00ffff;
            padding: 20px 40px;
            background: rgba(0,0,0,0.8);
            box-shadow: 0 0 20px rgba(0, 255, 255, 0.2);
        }
        
        .tech-text {
            display: block;
            font-family: 'Courier New', monospace;
            font-size: 1.5rem;
            color: #00ffff;
            font-weight: bold;
            letter-spacing: 2px;
            animation: blinkText 1s infinite alternate;
        }
        .tech-sub {
            display: block;
            font-family: 'Anton', sans-serif;
            font-size: 0.9rem;
            color: #fff;
            margin-top: 5px;
            opacity: 0.7;
            letter-spacing: 4px;
        }
        @keyframes blinkText { from { opacity: 0.6; } to { opacity: 1; } }
      `}</style>
    </div >
  );
};

export default StandCard;
