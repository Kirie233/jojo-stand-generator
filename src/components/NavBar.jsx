import React, { useState } from 'react';
import '../styles/variables.css';

const NavBar = ({ onReset, onToggleHistory, onToggleHelp, onToggleDonate, onToggleFAQ, isHistoryOpen }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* MAIN NAVIGATION CONTAINER (FIXED) */}
      <div className={`zipper-nav-container ${isOpen ? 'open' : ''}`}>

        {/* THE ZIPPER HANDLE (ALWAYS VISIBLE, SLIDES WITH MENU) */}
        {!isHistoryOpen && (
          <div className="zipper-handle-sticky" onClick={() => setIsOpen(!isOpen)} title="Sticky Fingers!">
            <svg viewBox="0 0 60 120" className="handle-svg">
              <defs>
                <linearGradient id="giantGold" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#FFF700" />
                  <stop offset="100%" stopColor="#DAA520" />
                </linearGradient>
                <filter id="heavyShadow">
                  <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#000" floodOpacity="0.8" />
                </filter>
              </defs>
              <path d="M10,10 H50 L55,90 L30,110 L5,90 Z" fill="url(#giantGold)" stroke="#000" strokeWidth="3" filter="url(#heavyShadow)" />
              <path d="M22,25 H38 L40,70 L30,80 L20,70 Z" fill="#1a0b2e" stroke="#000" strokeWidth="2" />
            </svg>
          </div>
        )}

        {/* MENU CONTENT PAN (BEHIND THE ZIPPER) */}
        <div className="zipper-panel">
          <div className="menu-list">
            {/* INTRO */}
            <div className="menu-item" onClick={() => { onToggleHelp(); setIsOpen(false); }}>
              <img src="/assets/icon_tarot_intro.png" className="menu-icon-img" alt="Intro" />
              <div className="menu-text-group">
                <span className="menu-en">INTRO</span>
                <span className="menu-cn">简介</span>
              </div>
            </div>
            {/* HISTORY */}
            <div className="menu-item" onClick={() => { onToggleHistory(); setIsOpen(false); }}>
              <img src="/assets/icon_tarot_history.png" className="menu-icon-img" alt="History" />
              <div className="menu-text-group">
                <span className="menu-en">HISTORY</span>
                <span className="menu-cn">历史</span>
              </div>
            </div>
            {/* DONATE */}
            <div className="menu-item" onClick={() => { onToggleDonate(); setIsOpen(false); }}>
              <img src="/assets/icon_tarot_harvest.png" className="menu-icon-img" alt="Donate" />
              <div className="menu-text-group">
                <span className="menu-en">DONATE</span>
                <span className="menu-cn">赞赏</span>
              </div>
            </div>
            {/* FAQ */}
            <div className="menu-item" onClick={() => { onToggleFAQ(); setIsOpen(false); }}>
              <img src="/assets/icon_tarot_faq.png" className="menu-icon-img" alt="FAQ" />
              <div className="menu-text-group">
                <span className="menu-en">FAQ</span>
                <span className="menu-cn">问答</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        .zipper-nav-container {
            position: fixed;
            top: 0; right: 0;
            height: 100vh;
            width: 350px; /* Menu Width */
            z-index: 9999;
            transform: translateX(100%); /* Hidden by default */
            transition: transform 0.4s cubic-bezier(0.77, 0, 0.175, 1);
            /* THE GOLDEN ZIPPER TEETH LINE */
            border-left: 12px solid gold; 
            box-shadow: -5px 0 10px rgba(0,0,0,0.5);
        }
        
        .zipper-nav-container.open {
            transform: translateX(0); /* Slide In */
        }

        /* THE SINGLE ZIPPER HANDLE */
        .zipper-handle-sticky {
            position: absolute;
            top: 30px; 
            left: -60px; /* Sticks out to the left of the border */
            width: 60px; height: 120px;
            cursor: pointer;
            z-index: 10002;
            transition: transform 0.2s;
            filter: drop-shadow(-2px 2px 5px rgba(0,0,0,0.5));
        }
        .zipper-handle-sticky:hover {
            transform: scale(1.05); /* Subtle pop */
            filter: drop-shadow(-4px 4px 8px rgba(0,0,0,0.6));
        }

        /* THE MENU PANEL BACKGROUND */
        .zipper-panel {
            width: 100%; height: 100%;
            background: linear-gradient(135deg, #1a0b2e 0%, #000000 100%);
            display: flex; flex-direction: column;
            justify-content: center;
            box-shadow: inset 10px 0 50px rgba(0,0,0,0.8);
        }

        .menu-list {
            display: flex;
            flex-direction: column;
            gap: 40px;
            text-align: right;
            width: 100%;
            padding-right: 40px;
            align-items: flex-end;
        }

        .menu-item {
            cursor: pointer;
            transition: all 0.2s;
            position: relative;
            display: flex;
            align-items: center;
            gap: 20px;
            padding: 10px;
        }
        
        /* HOVER EFFECTS */
        .menu-item:hover { transform: translateX(-15px); }
        .menu-item:hover .menu-cn { text-shadow: 0 0 15px #fff; }
        .menu-item:hover .menu-icon-img { 
            transform: scale(1.1) rotate(5deg);
            filter: drop-shadow(0 0 10px #fff) brightness(1.2);
            border-color: #fff;
        }

        .menu-icon-img {
             width: 60px; height: 90px;
             object-fit: cover;
             border: 3px solid #555;
             transition: all 0.3s;
             /* High Contrast B/W looking */
             filter: grayscale(1) contrast(1.2);
             background: #fff;
        }

        .menu-text-group {
            display: flex; flex-direction: column;
            align-items: flex-end;
            position: relative;
        }

        .menu-cn {
            display: block;
            font-family: 'ZCOOL KuaiLe', cursive; /* Using the Bold Font */
            font-size: 2.5rem; /* BIG TEXT */
            color: #fff;
            line-height: 1;
            z-index: 2;
        }
        
        .menu-en {
            display: block;
            font-family: 'Anton', sans-serif;
            font-size: 1.5rem;
            color: transparent;
            -webkit-text-stroke: 1px rgba(255,255,255,0.3); /* HOLLOW OUTLINE */
            letter-spacing: 2px;
            position: absolute;
            top: -15px; right: 0; /* Watermark placement */
            z-index: 1;
            pointer-events: none;
        }

      `}</style>
    </>
  );
};

export default NavBar;
