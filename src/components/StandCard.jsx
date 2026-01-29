import React from 'react';
import CustomRadar from './CustomRadar';
import '../styles/variables.css';
import html2canvas from 'html2canvas';

const StandCard = ({ standData }) => {
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
    range: '射程',
    durability: '持续力',
    precision: '精密性',
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
      <div style={{ textAlign: 'right', marginBottom: 10 }}>
        <button onClick={handleSaveImage} className="save-btn">💾 保存卡片</button>
      </div>

      <div className="stand-card">

        {/* === TOP VISUAL AREA (Fixed Height) === */}
        <div className="visual-area">
          {/* Background */}
          <div className="card-bg"></div>
          <div className="texture-overlay"></div>

          {/* STAND IMAGE (Full Width Background Layer) */}
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

            {/* LEFT ZONE (Text & Radar) */}
            <div className="zone-left">
              <div className="header-group">
                <div className="label-row">
                  <span className="label-bracket">[STAND NAME]</span>
                  <span className="label-cn">[替身名]</span>
                </div>
                <h1 className="main-name">{mainName}</h1>
                {subName && <h2 className="sub-name">{subName}</h2>}
              </div>

              <div className="radar-group">
                <div className="radar-label">STATISTICS</div>
                <CustomRadar stats={stats} labels={translatedLabels} />
              </div>
            </div>

            {/* Reference Image (Catalyst) - Top Right Absolute */}
            {standData.referenceImage && (
              <div className="catalyst-box-floating">
                <div className="catalyst-header">
                  <span>[CATALYST]</span>
                  <span>[触媒]</span>
                </div>
                <img src={standData.referenceImage} alt="Ref" />
              </div>
            )}

            {/* RIGHT ZONE (Master Name Only) */}
            <div className="zone-right">
              {/* Stand Master (Moved to Bottom Right of Right Zone) */}
              <div className="user-info-right">
                <div className="label-row-sm" style={{ justifyContent: 'flex-end' }}>
                  <span className="label-cn-sm">[替身使者]</span>
                  <span className="label-bracket-sm">[STAND MASTER]</span>
                </div>
                <h2 className="user-name-right">{standData.userName || 'YOU'}</h2>
              </div>
            </div>
          </div>
        </div>


        {/* === BOTTOM INFO AREA (Auto Height) === */}
        <div className="info-area">
          <div className="ability-content">
            <h3>『 {abilityName || '能力'} 』</h3>
            <p>{ability}</p>
          </div>
        </div>

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Noto+Serif+SC:wght@700;900&family=Bangers&display=swap');

        .stand-card-container {
            margin: 40px auto;
            max-width: 900px;
            font-family: 'Cinzel', serif;
            position: relative;
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

        /* --- BACKGROUND: JOJO STYLE --- */
        .visual-area {
            position: relative;
            width: 100%;
            height: 600px; 
            overflow: hidden;
            border-bottom: 6px solid #000;
            background-color: #2b003e; /* Deep Purple Base */
        }

        .card-bg {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            z-index: 1;
            /* Iconic JoJo Gradient: Purple -> Pink -> Gold */
            background: linear-gradient(135deg, #4a148c 0%, #d500f9 60%, #ffd700 100%);
            opacity: 0.9;
        }

        /* Triangle Pattern Overlay */
        .texture-overlay {
            position: absolute;
            z-index: 2;
            width: 100%; height: 100%;
            /* CSS Triangle Pattern */
            background-image: 
                linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000),
                linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000);
            background-position: 0 0, 10px 10px;
            background-size: 20px 20px;
            opacity: 0.1; /* Subtle texture blending */
            mix-blend-mode: overlay;
        }

        /* --- VISUAL LAYOUT --- */
        .visual-layout {
            position: relative;
            z-index: 20; /* Above BG */
            display: flex;
            width: 100%; height: 100%;
        }

        /* --- STAND IMAGE (Background Layer) --- */
        .stand-full-bg {
            position: absolute;
            top: 0; left: 0;
            width: 100%; height: 100%;
            background-size: cover;
            background-position: top center;
            mix-blend-mode: normal; /* True Colors */
            z-index: 10;
            /* Fade bottom slightly for text area integration */
            mask-image: linear-gradient(to bottom, black 85%, transparent 100%);
        }
        
        /* Remove the spotlight fix since we are in normal mode now */
        .card-bg::after {
            display: none;
        }

        /* --- LEFT ZONE: NAME & RADAR --- */
        .zone-left {
            width: 45%;
            padding: 30px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            pointer-events: none; /* Click through */
        }
        
        /* STAND NAME header */
        .header-group {
            pointer-events: auto;
            text-align: left;
            margin-bottom: 20px;
            position: relative;
            z-index: 50;
            padding: 10px;
            /* Gradient fade for readability */
            background: linear-gradient(90deg, rgba(0,0,0,0.6) 0%, transparent 100%);
            border-left: 5px solid var(--accent-color); /* Anime Title Marker */
        }

        .label-row {
            display: none; /* Hide standard label, use integrated */
        }

        .main-name {
            font-family: 'Noto Serif SC', serif; /* ANIME SERIF */
            font-weight: 900;
            font-size: 4rem;
            line-height: 1;
            color: #fff;
            margin: 5px 0;
            /* ANIME GLOW STYLE: Used in Part 3/4/5 Titles */
            text-shadow: 
                0 0 5px #d500f9,
                0 0 10px #d500f9,
                0 0 20px #d500f9,
                2px 2px 0 #2b003e; /* Hard Shadow */
            transform: scale(1, 1.1); /* Slight vertical stretch */
        }

        .sub-name {
            font-family: 'Noto Serif SC', serif;
            font-size: 2rem;
            color: #ffd700; /* Gold */
            font-weight: 700;
            text-shadow: 2px 2px 0 #000;
            margin-top: 5px;
            letter-spacing: 2px;
        }

        /* RADAR: Floating HUD / Coin Style */
        .radar-group {
            position: relative;
            width: 300px; 
            margin-top: auto; 
            margin-left: 0;
            /* Remove Paper Styling */
            background: transparent;
            border: none;
            box-shadow: none;
            transform: rotate(-2deg); 
            pointer-events: auto;
            /* Ensure it sits above image */
            z-index: 50; 
            filter: drop-shadow(5px 5px 5px rgba(0,0,0,0.5));
        }

        /* Remove old paper texture */
        .radar-group::before { display: none; }
        
        .radar-label {
            display: none; /* Embedded in chart now or removed for anime accuracy */
        }


        /* --- RIGHT ZONE: MASTER & CATALYST --- */
        .zone-right {
            width: 55%;
            position: relative;
            pointer-events: none;
        }

        .user-info-right {
           position: absolute;
           bottom: 40px;
           right: 20px;
           text-align: right;
           pointer-events: auto;
           z-index: 50;
           /* Text Visibility Backdrop */
           padding: 10px;
           background: radial-gradient(ellipse at center, rgba(0,0,0,0.4) 0%, transparent 70%);
        }
        
        .user-name-right {
            font-family: 'Noto Serif SC', serif; /* Match Master to Stand */
            font-size: 3rem;
            font-weight: 900;
            color: #fff;
            line-height: 1;
            text-shadow: 
                0 0 5px #00e5ff,
                0 0 10px #00e5ff,
                2px 2px 0 #000;
        }
        
        .label-bracket-sm {
            background: #000; color: #ffd700; padding: 2px 6px; font-weight: bold; 
            border: 1px solid #fff; margin-bottom: 5px; display: inline-block;
        }

        /* CATALYST IMAGE "Photo" Style */
        .catalyst-box-floating {
            position: absolute;
            top: 25px; right: 25px;
            width: 110px; height: 110px;
            background: #000;
            /* JEWEL STYLE */
            border: 4px solid var(--accent-color); /* Gold Border */
            border-radius: 50%; /* Circle */
            box-shadow: 0 0 15px var(--accent-color), 4px 4px 0 #000;
            overflow: hidden;
            z-index: 60;
            display: flex;
            align-items: center; justify-content: center;
        }
        .catalyst-box-floating img {
            width: 100%; height: 100%;
            object-fit: cover;
            border: none;
        }
        .catalyst-header {
            display: none; /* Clean Look */
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

        .ability-content p {
            font-family: 'Noto Serif SC', serif;
            font-size: 1.2rem;
            line-height: 1.6;
            color: #333;
            font-weight: bold;
        }
        
        /* Save Button */
        .save-btn {
            background: #6a1b9a; color: #fff; border: 3px solid #000;
            font-weight: 900; box-shadow: 4px 4px 0 #000;
            padding: 8px 24px; font-size: 1.1rem;
        }
        .save-btn:hover { background: #8e24aa; transform: translate(-2px,-2px); box-shadow: 6px 6px 0 #000; }

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
