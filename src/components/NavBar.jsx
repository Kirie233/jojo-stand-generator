import React, { useState } from 'react';
import '../styles/variables.css';

const NavBar = ({ onReset, onToggleHistory, onToggleHelp, onToggleDonate }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className={`zipper-nav ${isOpen ? 'open' : ''}`}>

        {/* ZIPPER PULL BUTTON */}
        <button className="zipper-toggle" onClick={() => setIsOpen(!isOpen)} title="Sticky Fingers!">
          <div className="zipper-icon">
            {/* SVG Zipper Pull */}
            <svg viewBox="0 0 24 24" fill="gold" stroke="black" strokeWidth="1">
              <path d="M12,2 C12,2 8,6 8,10 C8,14 10,16 12,18 C14,16 16,14 16,10 C16,6 12,2 12,2 Z" />
              <circle cx="12" cy="10" r="2" fill="black" />
              <rect x="11" y="18" width="2" height="6" fill="gold" stroke="black" />
            </svg>
          </div>
          <span className="zipper-text">{isOpen ? 'CLOSE' : 'MENU'}</span>
        </button>

        {/* INSIDE THE ZIPPER (MENU CONTENT) */}
        <div className="zipper-content">
          <div className="menu-list">
            <div onClick={() => { onReset(); setIsOpen(false); }}>
              <span className="menu-en">AWAKEN</span>
              <span className="menu-cn">觉醒</span>
            </div>
            <div onClick={() => { onToggleHistory(); setIsOpen(false); }}>
              <span className="menu-en">HISTORY</span>
              <span className="menu-cn">记录</span>
            </div>
            <div onClick={() => { onToggleHelp(); setIsOpen(false); }}>
              <span className="menu-en">GUIDE</span>
              <span className="menu-cn">图鉴</span>
            </div>
            <div onClick={() => { onToggleDonate(); setIsOpen(false); }}>
              <span className="menu-en">DONATE</span>
              <span className="menu-cn">赞赏</span>
            </div>
          </div>
          {/* Background Pattern for "Void" */}
          <div className="zipper-void"></div>
        </div>

      </div>

      <style>{`
        .zipper-nav {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
        }

        .zipper-toggle {
            background: transparent;
            border: none;
            cursor: pointer;
            position: relative;
            z-index: 10001;
            display: flex;
            flex-direction: column;
            align-items: center;
            transition: transform 0.2s;
        }
        .zipper-toggle:hover { transform: scale(1.1); }

        .zipper-icon {
            width: 50px; height: 80px;
            filter: drop-shadow(3px 3px 0 #000);
        }
        .zipper-text {
            font-family: 'Anton', sans-serif;
            color: #fff;
            text-shadow: 2px 2px 0 #000;
            margin-top: 5px;
            background: #000;
            padding: 2px 5px;
        }

        /* MENU CONTENT */
        .zipper-content {
            position: fixed;
            top: 0; right: 0; width: 300px; height: 100vh;
            background: #1a1a1d; /* Void color */
            border-left: 8px solid gold; /* The Zipper Teeth */
            transform: translateX(100%);
            transition: transform 0.4s cubic-bezier(0.77, 0, 0.175, 1);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: -10px 0 30px rgba(0,0,0,0.8);
            /* Zipper Teeth Pattern */
            background-image: 
                linear-gradient(45deg, #222 25%, transparent 25%, transparent 75%, #222 75%, #222),
                linear-gradient(45deg, #222 25%, transparent 25%, transparent 75%, #222 75%, #222);
            background-size: 20px 20px;
            background-position: 0 0, 10px 10px;
            z-index: 10000;
        }

        .zipper-nav.open .zipper-content {
            transform: translateX(0);
        }

        .menu-list {
            display: flex;
            flex-direction: column;
            gap: 30px;
            text-align: right;
            width: 100%;
            padding-right: 40px;
        }

        .menu-list div {
            cursor: pointer;
            transition: all 0.2s;
            position: relative;
        }
        .menu-list div:hover {
            transform: translateX(-10px);
        }
        .menu-list div:hover .menu-cn {
            color: gold;
            text-shadow: 0 0 10px gold;
        }

        .menu-en {
            display: block;
            font-family: 'Anton', sans-serif;
            font-size: 1.5rem;
            color: #555;
            letter-spacing: 2px;
        }
        .menu-cn {
            display: block;
            font-family: 'ZCOOL KuaiLe', cursive;
            font-size: 2.5rem;
            color: #fff;
            line-height: 1;
        }

      `}</style>
    </>
  );
};

export default NavBar;
