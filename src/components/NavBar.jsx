import React, { useState } from 'react';
import '../styles/variables.css';

const NavBar = ({ onToggleHistory, onToggleHelp, onToggleDonate, onToggleFAQ, isHistoryOpen }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { en: 'INTRO', cn: '简介', icon: '/assets/icon_tarot_intro.png', action: onToggleHelp },
    { en: 'HISTORY', cn: '历史', icon: '/assets/icon_tarot_history.png', action: onToggleHistory },
    { en: 'DONATE', cn: '赞赏', icon: '/assets/icon_tarot_harvest.png', action: onToggleDonate },
    { en: 'FAQ', cn: '问答', icon: '/assets/icon_tarot_faq.png', action: onToggleFAQ },
  ];

  const handleItemClick = (action) => {
    if (!action) return;
    action();
    setIsOpen(false);
  };

  return (
    <>
      {/* MANGA MENU TOGGLE BUTTON */}
      {!isHistoryOpen && (
        <button
          className={`manga-toggle ${isOpen ? 'active' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          title="MENU"
        >
          <div className="toggle-bars">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div className="toggle-sfx">ゴ</div>
        </button>
      )}

      {/* OVERLAY */}
      <div className={`manga-overlay ${isOpen ? 'show' : ''}`} onClick={() => setIsOpen(false)} />

      {/* MANGA PANEL MENU */}
      <nav className={`manga-nav ${isOpen ? 'open' : ''}`}>
        {/* Decorative SFX */}
        <div className="nav-sfx">
          <span style={{ top: '8%', right: '10%', animationDelay: '0s' }}>ゴ</span>
          <span style={{ top: '45%', right: '5%', animationDelay: '0.3s' }}>ゴ</span>
          <span style={{ bottom: '12%', right: '15%', animationDelay: '0.6s' }}>ゴ</span>
        </div>

        {/* Menu Panels */}
        <div className="panel-grid">
          {menuItems.map((item, i) => (
            <div
              key={item.en}
              className={`manga-panel panel-${i}`}
              style={{ animationDelay: `${0.08 + i * 0.08}s` }}
              onClick={() => handleItemClick(item.action)}
            >
              <div className="panel-img-wrap">
                <img src={item.icon} className="panel-img" alt={item.en} />
              </div>
              <div className="panel-text">
                <span className="panel-en">{item.en}</span>
                <span className="panel-cn">{item.cn}</span>
              </div>
              <div className="panel-flash"></div>
            </div>
          ))}
        </div>
      </nav>

      <style>{`
        /* ========== MANGA TOGGLE BUTTON ========== */
        .manga-toggle {
          position: fixed;
          top: 20px; right: 20px;
          z-index: 10001;
          width: 56px; height: 56px;
          background: #000;
          border: 3px solid var(--accent-color, #FFD700);
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transform: skewX(-8deg);
          box-shadow:
            4px 4px 0 #000,
            0 0 15px rgba(255, 215, 0, 0.3);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          overflow: visible;
        }
        .manga-toggle:hover {
          transform: skewX(-8deg) scale(1.12);
          box-shadow:
            4px 4px 0 #000,
            0 0 25px rgba(255, 215, 0, 0.6);
          border-color: #fff;
        }
        .manga-toggle:active { transform: skewX(-8deg) scale(0.95); }

        /* Hamburger Bars */
        .toggle-bars {
          display: flex; flex-direction: column;
          gap: 5px; width: 24px;
          transform: skewX(8deg);
          transition: all 0.3s;
        }
        .toggle-bars span {
          display: block; height: 3px;
          background: var(--accent-color, #FFD700);
          border-radius: 1px;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          transform-origin: center;
        }
        .toggle-bars span:nth-child(2) { width: 70%; margin-left: auto; }

        /* Toggle → X animation */
        .manga-toggle.active .toggle-bars span:nth-child(1) {
          transform: rotate(45deg) translate(5px, 6px);
          background: #fff;
        }
        .manga-toggle.active .toggle-bars span:nth-child(2) {
          opacity: 0; width: 0;
        }
        .manga-toggle.active .toggle-bars span:nth-child(3) {
          transform: rotate(-45deg) translate(5px, -6px);
          background: #fff;
        }

        /* SFX on button */
        .toggle-sfx {
          position: absolute;
          top: -14px; right: -16px;
          font-family: 'Noto Serif SC', serif;
          font-size: 1.4rem;
          font-weight: 900;
          color: var(--accent-color, #FFD700);
          text-shadow: 2px 2px 0 #000;
          animation: sfxPulse 2s ease-in-out infinite alternate;
          pointer-events: none;
        }
        @keyframes sfxPulse {
          from { transform: scale(0.85) rotate(-10deg); opacity: 0.6; }
          to { transform: scale(1.1) rotate(5deg); opacity: 1; }
        }

        /* ========== OVERLAY ========== */
        .manga-overlay {
          position: fixed; inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          z-index: 9998;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.4s ease;
        }
        .manga-overlay.show {
          opacity: 1;
          pointer-events: auto;
        }

        /* ========== MANGA NAV PANEL ========== */
        .manga-nav {
          position: fixed;
          top: 0; right: 0;
          width: 380px; height: 100vh;
          z-index: 9999;
          background: linear-gradient(160deg, #1a0033 0%, #0a0014 60%, #000 100%);
          border-left: 5px solid var(--accent-color, #FFD700);
          box-shadow:
            -8px 0 30px rgba(0, 0, 0, 0.8),
            inset 4px 0 20px rgba(255, 215, 0, 0.05);
          transform: translateX(110%);
          transition: transform 0.45s cubic-bezier(0.77, 0, 0.175, 1);
          display: flex;
          flex-direction: column;
          justify-content: center;
          overflow: hidden;
        }
        .manga-nav.open {
          transform: translateX(0);
        }

        /* Diagonal comic line decoration */
        .manga-nav::before {
          content: '';
          position: absolute;
          top: -50%; left: -50%;
          width: 200%; height: 200%;
          background: repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 18px,
            rgba(255, 215, 0, 0.03) 18px,
            rgba(255, 215, 0, 0.03) 20px
          );
          pointer-events: none;
          z-index: 0;
        }

        /* Speed lines at bottom */
        .manga-nav::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 120px;
          background: repeating-linear-gradient(
            90deg,
            transparent,
            transparent 4px,
            rgba(255, 215, 0, 0.04) 4px,
            rgba(255, 215, 0, 0.04) 5px
          );
          mask-image: linear-gradient(to top, rgba(0,0,0,0.5), transparent);
          -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,0.5), transparent);
          pointer-events: none;
          z-index: 0;
        }

        /* ========== SFX FLOATING ========== */
        .nav-sfx {
          position: absolute; inset: 0;
          pointer-events: none; z-index: 1;
        }
        .nav-sfx span {
          position: absolute;
          font-family: 'Noto Serif SC', serif;
          font-size: 3.5rem;
          font-weight: 900;
          color: rgba(75, 0, 130, 0.35);
          text-shadow: 2px 2px 0 rgba(255, 255, 255, 0.05);
          animation: sfxFloat 3s ease-in-out infinite alternate;
        }
        @keyframes sfxFloat {
          from { transform: translateY(0) scale(1); }
          to { transform: translateY(-12px) scale(1.05); }
        }

        /* ========== PANEL GRID ========== */
        .panel-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 30px 28px;
          position: relative;
          z-index: 2;
        }

        /* ========== MANGA PANEL (Each menu item) ========== */
        .manga-panel {
          display: flex;
          align-items: center;
          gap: 18px;
          padding: 16px 20px;
          background: rgba(0, 0, 0, 0.6);
          border: 3px solid #333;
          border-left: 5px solid var(--accent-color, #FFD700);
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transform: skewX(-4deg);
          transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);

          /* Staggered entrance */
          opacity: 0;
          animation: panelSlideIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          animation-play-state: paused;
        }

        .manga-nav.open .manga-panel {
          animation-play-state: running;
        }

        @keyframes panelSlideIn {
          from {
            opacity: 0;
            transform: skewX(-4deg) translateX(80px);
          }
          to {
            opacity: 1;
            transform: skewX(-4deg) translateX(0);
          }
        }

        /* Panel color accents */
        .panel-0 { border-left-color: #FFD700; }
        .panel-1 { border-left-color: #d500f9; }
        .panel-2 { border-left-color: #00e5ff; }
        .panel-3 { border-left-color: #ff1744; }
        .panel-4 { border-left-color: #00c853; }

        /* Hover: dramatic comic emphasis */
        .manga-panel:hover {
          transform: skewX(-4deg) translateX(-8px) scale(1.03);
          border-color: #fff;
          background: rgba(30, 0, 50, 0.9);
          box-shadow:
            6px 6px 0 #000,
            0 0 20px rgba(255, 215, 0, 0.2);
        }
        .manga-panel:active {
          transform: skewX(-4deg) scale(0.97);
        }

        /* Flash overlay on hover */
        .panel-flash {
          position: absolute;
          inset: 0;
          background: linear-gradient(120deg, transparent 40%, rgba(255,255,255,0.08) 50%, transparent 60%);
          transform: translateX(-100%);
          transition: transform 0.5s;
          pointer-events: none;
        }
        .manga-panel:hover .panel-flash {
          transform: translateX(100%);
        }

        /* ========== PANEL IMAGE ========== */
        .panel-img-wrap {
          width: 60px; height: 78px;
          flex-shrink: 0;
          border: 2px solid #555;
          background: #111;
          overflow: hidden;
          transform: skewX(4deg);
          transition: all 0.3s;
        }
        .manga-panel:hover .panel-img-wrap {
          border-color: #fff;
          box-shadow: 0 0 12px rgba(255, 215, 0, 0.4);
        }

        .panel-img {
          width: 100%; height: 100%;
          object-fit: cover;
          filter: grayscale(0.8) contrast(1.3);
          transition: all 0.3s;
        }
        .manga-panel:hover .panel-img {
          filter: grayscale(0) contrast(1.1) brightness(1.1);
          transform: scale(1.1);
        }

        /* ========== PANEL TEXT ========== */
        .panel-text {
          display: flex;
          flex-direction: column;
          transform: skewX(4deg);
          position: relative;
        }

        .panel-cn {
          font-family: 'ZCOOL KuaiLe', cursive;
          font-size: 2rem;
          color: #fff;
          line-height: 1.1;
          text-shadow: 3px 3px 0 #000;
          transition: all 0.3s;
        }
        .manga-panel:hover .panel-cn {
          text-shadow:
            3px 3px 0 #000,
            0 0 15px rgba(255, 215, 0, 0.5);
        }

        .panel-en {
          font-family: 'Anton', sans-serif;
          font-size: 0.85rem;
          color: transparent;
          -webkit-text-stroke: 1px rgba(255, 255, 255, 0.25);
          letter-spacing: 3px;
          text-transform: uppercase;
          margin-top: 2px;
        }
        .manga-panel:hover .panel-en {
          -webkit-text-stroke: 1px rgba(255, 215, 0, 0.6);
        }

        /* Panel accent colors on hover */
        .panel-0:hover .panel-cn { text-shadow: 3px 3px 0 #000, 0 0 15px rgba(255, 215, 0, 0.5); }
        .panel-1:hover .panel-cn { text-shadow: 3px 3px 0 #000, 0 0 15px rgba(213, 0, 249, 0.5); }
        .panel-2:hover .panel-cn { text-shadow: 3px 3px 0 #000, 0 0 15px rgba(0, 229, 255, 0.5); }
        .panel-3:hover .panel-cn { text-shadow: 3px 3px 0 #000, 0 0 15px rgba(255, 23, 68, 0.5); }
        .panel-4:hover .panel-cn { text-shadow: 3px 3px 0 #000, 0 0 15px rgba(0, 200, 83, 0.5); }

        .panel-0:hover .panel-en { -webkit-text-stroke: 1px rgba(255, 215, 0, 0.6); }
        .panel-1:hover .panel-en { -webkit-text-stroke: 1px rgba(213, 0, 249, 0.6); }
        .panel-2:hover .panel-en { -webkit-text-stroke: 1px rgba(0, 229, 255, 0.6); }
        .panel-3:hover .panel-en { -webkit-text-stroke: 1px rgba(255, 23, 68, 0.6); }
        .panel-4:hover .panel-en { -webkit-text-stroke: 1px rgba(0, 200, 83, 0.6); }

        /* ========== MOBILE RESPONSIVE ========== */
        @media (max-width: 768px) {
          .manga-toggle {
            top: 14px; right: 14px;
            width: 46px; height: 46px;
          }
          .toggle-bars { width: 20px; gap: 4px; }
          .toggle-bars span { height: 2.5px; }
          .toggle-sfx { font-size: 1.1rem; top: -10px; right: -12px; }

          .manga-nav { width: 280px; }
          .panel-grid { padding: 20px 16px; gap: 10px; }

          .manga-panel { padding: 12px 14px; gap: 14px; }
          .panel-img-wrap { width: 45px; height: 60px; }
          .panel-cn { font-size: 1.5rem; }
          .panel-en { font-size: 0.7rem; letter-spacing: 2px; }

          .nav-sfx span { font-size: 2.5rem; }
        }

        @media (max-width: 380px) {
          .manga-nav { width: 240px; }
          .panel-cn { font-size: 1.3rem; }
          .panel-img-wrap { width: 38px; height: 50px; }
          .manga-panel { padding: 10px 12px; gap: 10px; }
        }
      `}</style>
    </>
  );
};

export default NavBar;
