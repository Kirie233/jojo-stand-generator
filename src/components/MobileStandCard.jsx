import React from 'react';
import CustomRadar from './CustomRadar';
import ReactMarkdown from 'react-markdown';
import '../styles/variables.css';
import { downloadUrl, parseStandName, STAND_STAT_LABELS } from '../utils/stand';

const MobileStandCard = ({ standData, onReset, imageOnlyMode = false, onToggleImageOnly }) => {
  if (!standData) return null;
  const { name, abilityName, ability, stats } = standData;

  // Helper: Parse Name
  /*
  const parseName = (rawName) => {
    if (!rawName) return { main: 'UNKNOWN', sub: '' };
    const match = rawName.match(/^(.*?)\s*[(（](.*?)[)）]/);
    if (match) return { main: match[1], sub: match[2] };
    return { main: rawName, sub: '' };
  };
  */
  const hasDownloadableImage = Boolean(standData.imageUrl && standData.imageUrl !== 'FAILED');

  const handleDownloadImage = () => {
    if (!hasDownloadableImage) return;
    downloadUrl(standData.imageUrl, `JOJO_${mainName.replace(/\s+/g, '_')}.png`);
  };
  const { main: mainName, sub: subName } = parseStandName(name);
  const handleToggleImageOnly = onToggleImageOnly || (() => {});

  if (imageOnlyMode) {
    return (
      <div className="mobile-image-only-root">
        <button className="mobile-image-toggle restore" type="button" onClick={handleToggleImageOnly}>
          显示UI
        </button>
        {hasDownloadableImage ? (
          <img src={standData.imageUrl} alt="Stand Visual" className="mobile-image-only-img" />
        ) : (
          <div className="mobile-image-only-placeholder">IMAGE LOADING</div>
        )}
        <style>{`
          .mobile-image-only-root {
            position: fixed;
            inset: 0;
            z-index: 10000;
            background: #000;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .mobile-image-only-img {
            width: 100vw;
            height: 100vh;
            object-fit: contain;
            background: #000;
          }
          .mobile-image-only-placeholder {
            color: #ffd700;
            font-family: 'Anton', sans-serif;
            letter-spacing: 3px;
          }
          .mobile-image-toggle {
            position: fixed;
            top: 14px;
            right: 14px;
            z-index: 10001;
            background: rgba(0,0,0,0.78);
            border: 2px solid #ffd700;
            border-radius: 4px;
            color: #ffd700;
            padding: 8px 12px;
            font-family: 'Anton', sans-serif;
            letter-spacing: 1px;
          }
        `}</style>
      </div>
    );
  }

  /*
  const translatedLabels = {
    power: '破坏力',
    speed: '速度',
    range: '射程距离',
    durability: '持续力',
    precision: '精密动作性',
    potential: '成长性'
  };

  */
  return (
    <div className="mobile-stand-root">
      {/* 1. TOP NAV BAR */}
      <div className="mobile-header">
        <button onClick={onReset} className="mobile-back-btn">
          <span className="arrow">◀</span> RETURN
        </button>
        <button
          onClick={handleToggleImageOnly}
          className="mobile-image-toggle"
          type="button"
          disabled={!hasDownloadableImage}
        >
          只看图
        </button>
        <div className="mobile-title">STAND PROFILE</div>
      </div>

      {/* 2. MAIN VISUAL (Standard IMG Block) */}
      <div className="mobile-visual">
        {standData.imageUrl && standData.imageUrl !== 'FAILED' ? (
          <img
            src={standData.imageUrl}
            alt="Stand Visual"
            className="mobile-main-img"
          />
        ) : standData.imageUrl === 'FAILED' ? (
          <div className="mobile-loading-placeholder failed">
            <span className="error-text">VISUALIZATION FAILED</span>
            <small>精神力暂时无法维持形态 (AI Image Failed)</small>
          </div>
        ) : (
          <div className="mobile-loading-placeholder">
            <span>L O A D I N G . . .</span>
          </div>
        )}

        {/* Floating Name Badge */}
        <div className="mobile-name-badge">
          <div className="badge-row">
            <span className="badge-label-en">STAND NAME</span>
            <span className="badge-label-cn">替身名</span>
          </div>
          <h1 className="name-main">{mainName}</h1>
          {subName && <h2 className="name-sub">{subName}</h2>}

          <div className="badge-row spaced-top">
            <span className="badge-label-en">STAND MASTER</span>
            <span className="badge-label-cn">本体</span>
          </div>
          <div className="user-name">{standData.userName || 'Unknown User'}</div>
        </div>
      </div>

      {/* 3. RADAR CHART (Centered) */}
      <div className="mobile-radar-section">
        <CustomRadar stats={stats} labels={STAND_STAT_LABELS} />
      </div>

      {/* 4. ABILITY INFO (Vertical Flow) */}
      <div className="mobile-info-section">
        {/* Ability Header */}
        <div className="mobile-section-title">
          <span className="icon">⚡</span>
          {abilityName || standData.panel?.abilityName || '能力解析'}
        </div>

        {standData.panel ? (
          /* Structured Panel */
          <div className="mobile-panel-content">
            <div className="desc-box">
              {standData.panel.long_desc || standData.panel.desc}
            </div>

            {/* Mechanics */}
            <div className="mobile-mech-list">
              {standData.panel.mechanics && standData.panel.mechanics.map((mech, i) => (
                <div key={i} className="mobile-mech-item">
                  <div className="mech-title">{mech.title}</div>
                  <div className="mech-body">{mech.content}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Markdown Fallback */
          <div className="mobile-markdown-content">
            {ability ? <ReactMarkdown>{ability}</ReactMarkdown> : <p style={{ opacity: 0.5, fontStyle: 'italic' }}>正在从星尘中解读替身能力... (Parsing Bio)</p>}
          </div>
        )}
      </div>

      {/* 5. WHITESNAKE ACTION BAR (Fixed Bottom) */}
      <div className="mobile-action-bar">
        <button className="action-fab" type="button" onClick={handleDownloadImage} disabled={!hasDownloadableImage}>
          <span className="icon">📸</span>
          <span className="label">保存图片</span>
        </button>

        <button className="action-fab primary" type="button" onClick={onReset}>
          <span className="icon">♻</span>
          <span className="label">下一替身</span>
        </button>
      </div>

      {/* CSS IN JS FOR MOBILE ISOLATION */}
      <style>{`
                .mobile-stand-root {
                    width: 100%;
                    min-height: 100vh;
                    background: #000;
                    color: #fff;
                    padding-bottom: 100px; /* Space for Action Bar */
                    font-family: 'Noto Serif SC', serif;
                    overflow-x: hidden;
                    position: absolute;
                    top: 0; left: 0;
                    z-index: 9999; /* Force Top */
                }

                .mobile-header {
                    position: sticky; top: 0; z-index: 1000;
                    background: rgba(0,0,0,0.8);
                    backdrop-filter: blur(10px);
                    padding: 10px 15px;
                    display: flex; justify-content: space-between; align-items: center;
                    border-bottom: 1px solid #333;
                }

                .mobile-back-btn {
                    background: none; border: 1px solid #ffd700;
                    color: #ffd700; padding: 5px 12px;
                    border-radius: 20px; font-family: 'Anton';
                    font-size: 0.9rem;
                }

                .mobile-image-toggle {
                    background: rgba(255,215,0,0.1);
                    border: 1px solid #ffd700;
                    color: #ffd700;
                    padding: 5px 10px;
                    border-radius: 20px;
                    font-family: 'Anton';
                    font-size: 0.85rem;
                    letter-spacing: 1px;
                }

                .mobile-image-toggle:disabled {
                    opacity: 0.45;
                }

                .mobile-title {
                    font-family: 'Anton'; color: #666; letter-spacing: 2px;
                }

                .mobile-visual {
                    position: relative;
                    width: 100%;
                    background: #111;
                    /* Min height to prevent collapse */
                    min-height: 300px; 
                }

                .mobile-main-img {
                    width: 100%;
                    height: auto;
                    display: block;
                    /* Ensure visibility */
                    object-fit: contain;
                    max-height: 60vh;
                }

                .mobile-loading-placeholder {
                    height: 300px; display: flex; flex-direction: column; align-items: center; justify-content: center;
                    color: #00ffff; font-family: 'Courier New'; gap: 10px;
                }
                .mobile-loading-placeholder.failed {
                    background: radial-gradient(circle at center, #2a0505 0%, #000 100%);
                    color: #ff3d00; border-bottom: 2px solid #ff0000;
                }
                .error-text {
                    font-weight: bold; font-size: 1.2rem; text-shadow: 0 0 10px rgba(255, 61, 0, 0.5);
                }

                .mobile-name-badge {
                    background: linear-gradient(to top, #000 10%, rgba(0,0,0,0.8) 50%, transparent 100%);
                    padding: 60px 20px 20px 20px;
                    position: absolute; bottom: 0; left: 0; right: 0;
                    text-align: left;
                }

                .badge-row {
                    display: flex; align-items: baseline; gap: 8px;
                    margin-bottom: 2px;
                }
                .badge-row.spaced-top { margin-top: 15px; }

                .badge-label-en {
                    font-family: 'Anton'; color: #ffd700; font-size: 0.8rem; letter-spacing: 1px;
                }
                .badge-label-cn {
                    font-family: 'Noto Serif SC'; color: #ccc; font-size: 0.8rem; font-weight: bold;
                }

                .name-main {
                    font-family: 'Anton'; font-weight: 400; /* Anton is bold by default */
                    font-size: 3rem; color: #fff; margin: 0;
                    text-shadow: 3px 3px 0 #6a1b9a; /* Purple Shadow */
                    line-height: 1;
                    text-transform: uppercase;
                }
                .name-sub {
                    font-family: 'Noto Serif SC'; font-size: 1.1rem;
                    color: #fff; margin: 2px 0 0 0;
                    opacity: 0.9;
                }
                .user-name {
                    font-family: 'Anton'; color: #fff; margin-top: 2px; font-size: 1.5rem;
                    text-shadow: 2px 2px 0 #333;
                }

                .mobile-radar-section {
                    display: flex; justify-content: center;
                    padding: 20px 0;
                    background: radial-gradient(circle, #222 0%, #000 70%);
                    border-bottom: 4px solid #ffd700;
                }

                .mobile-info-section {
                    padding: 20px;
                    background: #1a0b2e;
                }

                .mobile-section-title {
                    font-family: 'ZCOOL KuaiLe', cursive;
                    font-size: 1.8rem; color: #ffd700;
                    margin-bottom: 15px;
                    border-left: 5px solid #d500f9;
                    padding-left: 10px;
                    display: flex; align-items: center; gap: 10px;
                }

                .desc-box {
                    font-size: 1rem; line-height: 1.6; color: #ddd;
                    margin-bottom: 20px;
                    background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px;
                }

                .mobile-mech-item {
                    margin-bottom: 15px;
                    border: 1px solid #444; background: rgba(255,255,255,0.05);
                    border-radius: 8px; overflow: hidden;
                }
                .mech-title {
                    background: #000; color: #ffd700; padding: 8px 15px;
                    font-family: 'Anton'; letter-spacing: 1px;
                }
                .mech-body {
                    padding: 12px 15px; font-size: 0.95rem; color: #ccc;
                }

                .mobile-markdown-content p {
                    margin-bottom: 10px; font-size: 1rem; line-height: 1.5;
                }

                .mobile-action-bar {
                    position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
                    background: #222;
                    border: 2px solid #ffd700;
                    border-radius: 50px;
                    padding: 10px 20px;
                    display: flex; gap: 30px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.8);
                    z-index: 2000;
                    width: max-content;
                }

                .action-fab {
                    background: none; border: none;
                    display: flex; flex-direction: column; align-items: center;
                    color: #fff; font-size: 0.7rem; gap: 5px; cursor: pointer;
                }
                .action-fab:disabled {
                    opacity: 0.45;
                    cursor: not-allowed;
                }
                .action-fab .icon { font-size: 1.5rem; }
                .action-fab.primary { color: #ffd700; }
            `}</style>
    </div>
  );
};

export default MobileStandCard;
