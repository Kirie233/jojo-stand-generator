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
            <svg viewBox="0 0 70 140" className="handle-svg">
              <defs>
                {/* PREMIUM METALLIC GOLD GRADIENT */}
                <linearGradient id="stickyGold" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#FFF700" />
                  <stop offset="50%" stopColor="#FFD700" />
                  <stop offset="100%" stopColor="#B8860B" />
                </linearGradient>
                <filter id="stickyGlow">
                  <feDropShadow dx="-2" dy="2" stdDeviation="4" floodColor="#ffd700" floodOpacity="0.4" />
                </filter>
              </defs>

              {/* THE ZIPPER BASE (The part that slides) */}
              <rect x="20" y="0" width="30" height="20" fill="#222" stroke="#000" strokeWidth="1" rx="2" />

              {/* THE PULL TAB - STICKY FINGERS STYLE */}
              <g filter="url(#stickyGlow)">
                {/* Main Body of the Pull */}
                <path
                  d="M15,20 H55 Q60,20 60,25 V100 Q60,115 45,120 L35,125 L25,120 Q10,115 10,100 V25 Q10,20 15,20 Z"
                  fill="url(#stickyGold)"
                  stroke="#000"
                  strokeWidth="2.5"
                />
                {/* The Iconic "Handle Hole" */}
                <circle cx="35" cy="45" r="12" fill="#1a0b2e" stroke="#000" strokeWidth="1.5" />
                {/* Detailed inset line for 3D look */}
                <path
                  d="M20,70 H50 V95 Q50,105 40,110 L35,112 L30,110 Q20,105 20,95 Z"
                  fill="rgba(255,255,255,0.15)"
                  stroke="rgba(0,0,0,0.2)"
                  strokeWidth="1"
                />
              </g>
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
            transform: scale(1.15) rotate(-5deg); /* More dynamic hover */
            filter: drop-shadow(-6px 6px 12px rgba(163, 0, 255, 0.4));
        }

        /* Ambient Gold Glow Pulse for the "Zipper" hint */
        .zipper-handle-sticky::before {
            content: '';
            position: absolute;
            inset: 10px;
            background: rgba(255, 215, 0, 0.25);
            border-radius: 50%;
            filter: blur(18px);
            z-index: -1;
            animation: handlePulse 2s ease-in-out infinite alternate;
        }

        @keyframes handlePulse {
            from { transform: scale(0.8); opacity: 0.3; }
            to { transform: scale(1.4); opacity: 0.7; }
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

        /* === MOBILE RESPONSIVE NAVBAR === */
        @media (max-width: 768px) {
            .zipper-nav-container {
                width: 260px; /* Narrower for mobile */
            }
            .zipper-handle-sticky {
                top: 20px;
                left: -50px;
                width: 50px; height: 100px;
            }
            .menu-list {
                gap: 25px;
                padding-right: 20px;
            }
            .menu-icon-img {
                width: 45px; height: 68px;
            }
            .menu-cn { font-size: 1.8rem; }
            .menu-en { font-size: 1.1rem; }
            .menu-item { gap: 12px; padding: 8px; }
        }

        @media (max-width: 380px) {
            .zipper-nav-container { width: 220px; }
            .menu-cn { font-size: 1.5rem; }
            .menu-icon-img { width: 35px; height: 55px; }
        }

      `}</style>
    </>
  );
};

export default NavBar;
