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

          {/* Layout Container for Separation */}
          <div className="visual-layout">

            {/* LEFT ZONE (40%): Text & Radar */}
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
                <CustomRadar stats={stats} labels={translatedLabels} />
              </div>
            </div>

            {/* RIGHT ZONE (60%): Image Only */}
            <div className="zone-right">
              {standData.imageUrl ? (
                <img src={standData.imageUrl} alt={name} className="stand-image" crossOrigin="anonymous" />
              ) : (
                <div className="loading">GENERATING...</div>
              )}

              {/* User Name Floating in Right Zone */}
              <div className="user-floating">
                <div className="user-label-group">
                  <div className="label-cn" style={{ textAlign: 'right', display: 'inline-block' }}>[替身使者]</div>
                  <div className="label-bracket" style={{ fontSize: '1rem', textAlign: 'right', display: 'block' }}>[STAND MASTER]</div>
                </div>
                <h1 className="user-name">{standData.userName || 'YOU'}</h1>
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
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Noto+Serif+SC:wght@700;900&display=swap');

        .stand-card-container {
            margin: 20px auto;
            max-width: 900px;
            font-family: 'Cinzel', serif;
        }

        .stand-card {
            width: 100%;
            border: 8px solid #d7ccc8;
            outline: 3px solid #000;
            background: #2e003e;
            display: flex;
            flex-direction: column;
        }

        /* --- TOP VISUAL AREA --- */
        .visual-area {
            position: relative;
            width: 100%;
            height: 500px; /* Fixed height for image area */
            overflow: hidden;
            border-bottom: 4px solid #3e2723;
        }

        .card-bg {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            z-index: 1;
            background: 
                radial-gradient(circle at 30% 30%, rgba(255, 0, 150, 0.5) 0%, transparent 60%),
                radial-gradient(circle at 70% 70%, rgba(255, 140, 0, 0.4) 0%, transparent 60%),
                linear-gradient(135deg, #4a148c 0%, #1a0033 100%);
            filter: blur(2px) contrast(1.1); 
            transform: scale(1.05);
        }

        .texture-overlay {
            position: absolute;
            z-index: 2;
            width: 100%; height: 100%;
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.15'/%3E%3C/svg%3E");
            opacity: 0.4;
            mix-blend-mode: overlay;
        }

        /* --- VISUAL LAYOUT (Split) --- */
        .visual-layout {
            position: relative;
            z-index: 10;
            display: flex;
            width: 100%;
            height: 100%;
        }

        /* LEFT ZONE */
        .zone-left {
            width: 40%;
            height: 100%;
            position: relative;
            padding: 30px 0 30px 40px;
            display: flex;
            flex-direction: column;
            /* Removed justify-content: space-between; becuz Radar is now absolute */
        }

        .header-group {
            text-align: left;
            z-index: 20;
            /* Prevents overlap with header */
            max-height: 220px; 
            overflow: hidden;
        }

        .label-row {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 5px;
        }

        /* ... (labels styles unchanged) ... */

        .radar-group {
            position: absolute;
            bottom: 10px;
            left: 30px;
            /* Scale down and anchor to bottom-left */
            transform: scale(0.85); 
            transform-origin: bottom left;
            z-index: 25; 
            pointer-events: none; /* Let clicks pass through if needed */
        }

        .label-bracket {
            color: #ffd700; 
            font-weight: bold; 
            letter-spacing: 1px;
            font-size: 1.2rem; 
            text-shadow: 2px 2px 0 #000;
            font-family: 'Cinzel', serif;
        }
        
        .label-cn {
            color: #fff;
            font-family: "Noto Serif SC", serif;
            font-weight: 900;
            font-size: 1.1rem;
            text-shadow: 1px 1px 0 #000;
            background: rgba(0,0,0,0.5);
            padding: 0 5px;
        }

        .main-name {
            font-size: 3.2rem; /* Reduced from 3.8rem */
            line-height: 0.95; 
            margin: 0; 
            color: #fff;
            font-family: 'Cinzel', serif; 
            font-weight: 900;
            -webkit-text-stroke: 2px #000; 
            paint-order: stroke fill;
            filter: drop-shadow(4px 4px 0 rgba(0,0,0,0.8));
            word-break: break-word;
        }
        .sub-name {
            font-family: 'Noto Serif SC', serif; 
            font-size: 1.8rem; 
            color: #fff;
            font-weight: 900; 
            margin-top: 10px; 
            letter-spacing: 2px;
            text-shadow: 2px 2px 0 #000; 
            -webkit-text-stroke: 0.5px #000;
        }
        
        /* Radar Group (Absolute Positioned now) */
        /* .radar-group styles moved up */

        /* RIGHT ZONE */
        .zone-right {
            width: 60%;
            height: 100%;
            position: relative;
            display: flex;
            align-items: flex-end; 
            justify-content: flex-end;
        }

        .stand-image {
            mix-blend-mode: multiply; 
            width: 100%;
            height: 105%;
            object-fit: contain;
            object-position: bottom right;
            /* 
               Fix: Remove drop-shadow (it created a box). 
               Add brightness to force background to pure white. 
            */
            filter: brightness(1.05) contrast(1.1) saturate(1.2); 
            
            /* Radial mask to fade ALL edges softly */
            mask-image: radial-gradient(circle at 70% 60%, black 50%, transparent 100%);
            transform: translateX(20px);
        }

        .user-floating {
            position: absolute;
            bottom: 30px;
            right: 40px;
            text-align: right;
            z-index: 25;
            pointer-events: none;
        }
        
        .user-label-group {
             margin-bottom: 0px;
        }
        
        .user-name {
            font-size: 2.8rem; 
            color: #fff; 
            -webkit-text-stroke: 1.5px #000;
            text-shadow: 3px 3px 0 #000; 
            margin: 0; 
            font-family: 'Cinzel', serif;
            line-height: 1;
        }


        /* --- BOTTOM INFO AREA --- */
        .info-area {
            background: #fdf5e6;
            color: #3e2723;
            padding: 30px 40px;
            /* Inner Grain */
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E");
            box-shadow: inset 0 10px 20px rgba(0,0,0,0.1);
        }

        .ability-content h3 {
            margin: 0 0 15px 0;
            color: #bf360c;
            font-family: 'Cinzel', serif;
            font-size: 1.8rem;
            border-bottom: 2px solid #bf360c;
            display: inline-block; padding-bottom: 5px;
        }

        .ability-content p {
            margin: 0;
            font-family: 'Noto Serif SC', serif;
            font-weight: bold;
            font-size: 1.25rem;
            line-height: 1.8;
        }

        .save-btn {
            background: #3e2723; color: #fff; padding: 10px 20px;
            cursor: pointer; border: none; font-family: sans-serif;
        }
        .save-btn:hover { background: #5d4037; }

      `}</style>
    </div>
  );
};

export default StandCard;
