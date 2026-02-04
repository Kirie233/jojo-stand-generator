import React, { useState } from 'react';

const LandingPage = ({ onStart }) => {
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    setClicked(true);
    setTimeout(() => {
      onStart();
    }, 600);
  };

  return (
    <div className={`landing-container ${clicked ? 'exit-anim' : ''}`}>

      {/* 1. BACKGROUND LAYERS */}
      <div className="bg-sunburst"></div>
      <div className="bg-particles"></div>

      {/* 2. HAT LAYER (Middle - Decorative) */}
      <div className="hat-layer">
        <img src="/assets/jotaro_hat_no_border.png" className="hat-visual" alt="Jotaro Hat" />
      </div>

      {/* 3. SFX LAYER (Floating) */}
      <div className="sfx-layer">
        <span style={{ top: '10%', left: '5%', animationDelay: '0s' }}>ゴ</span>
        <span style={{ top: '25%', left: '2%', animationDelay: '0.2s' }}>ゴ</span>
        <span style={{ top: '80%', right: '5%', animationDelay: '0.5s' }}>ゴ</span>
        <span style={{ top: '65%', right: '2%', animationDelay: '0.7s' }}>ゴ</span>
      </div>

      {/* 4. UI LAYER (Top Level) */}
      <div className="ui-layer">

        {/* TOP: LOGO */}
        <div className="logo-section">
          <h1 className="main-logo">JOJO</h1>
          <div className="sub-logo">STAND GENERATOR</div>
        </div>

        {/* BOTTOM: CONTROLS */}
        <div className="controls-section">
          <h2 className="action-title">奇妙な冒険：替身生成器</h2>

          <button className="stand-arrow-btn" onClick={handleClick}>
            <div className="btn-inner">
              <img src="/assets/stand_arrow.png" className="arrow-icon-img" alt="Arrow" />
              <span className="btn-text">
                <span>覺醒能力</span>
                <small>AWAKEN YOUR STAND</small>
              </span>
            </div>
            <div className="btn-shine"></div>
          </button>
        </div>

      </div>

      <style>{`
        /* --- LAYOUT & CONTAINER --- */
        .landing-container {
            position: fixed; inset: 0;
            background: #1a0033 no-repeat center center;
            background-size: cover;
            overflow: hidden;
            display: flex; flex-direction: column;
            align-items: center; justify-content: center;
            /* CRITICAL FIX: Smooth transition for exit animation */
            transition: opacity 0.6s ease-out, transform 0.6s ease-in; 
            opacity: 1;
            transform: scale(1);
        }

        /* --- BACKGROUND EFFECTS --- */
        .bg-sunburst {
            position: absolute; inset: -50%;
            background: repeating-conic-gradient(
                from 0deg,
                rgba(0,0,0,0) 0deg 10deg,
                rgba(255,255,255,0.03) 10deg 20deg
            );
            animation: sunburst-spin 20s linear infinite;
            z-index: 0;
        }
        @keyframes sunburst-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .sfx-layer span {
            position: absolute;
            font-family: 'Noto Serif SC', serif;
            font-size: 5rem;
            color: #4b0082;
            text-shadow: 2px 2px 0 #FFF;
            font-weight: 900;
            opacity: 0.8;
            animation: sfx-float 3s ease-in-out infinite alternate;
            z-index: 10;
        }
        @keyframes sfx-float { from { transform: translateY(0px); } to { transform: translateY(-20px); } }

        /* --- HAT VISUAL --- */
        .hat-layer {
            position: absolute;
            top: 45%; left: 50%; /* Move up slightly */
            transform: translate(-50%, -50%);
            width: 60%; max-width: 600px; /* Reduced from 80% to fix oppressiveness */
            z-index: 5;
            pointer-events: none;
        }
        .hat-visual {
            width: 100%; height: auto;
            transform: rotate(25deg); /* Slightly reduced tilt for balance */
            filter: drop-shadow(10px 10px 0 rgba(0,0,0,0.3)); /* Cleaner shadow */
            opacity: 0.8; /* Dim background to let text pop */
            animation: hat-hover 4s ease-in-out infinite alternate;
        }
        @keyframes hat-hover { from { transform: rotate(20deg) translateY(0); } to { transform: rotate(22deg) translateY(-15px); } }

        /* --- UI LAYER --- */
        .ui-layer {
            position: relative; z-index: 20;
            width: 100%; height: 100%;
            display: flex; flex-direction: column;
            justify-content: space-between;
            padding: 40px 0;
            box-sizing: border-box;
            pointer-events: none; /* Pass through to buttons */
        }
        .ui-layer > * { pointer-events: auto; } /* Re-enable controls */

        /* TOP LOGO */
        .logo-section {
            display: flex; flex-direction: column; align-items: center;
            margin-top: 5vh;
        }
        .main-logo {
            font-family: 'ZCOOL KuaiLe', cursive;
            font-size: 10rem;
            line-height: 0.8;
            margin: 0;
            color: #FFF;
            text-shadow: 8px 8px 0 #000;
            -webkit-text-stroke: 3px #000;
        }
        .sub-logo {
            font-family: 'Anton', sans-serif;
            font-size: 3rem;
            color: #FFD700;
            background: #000; /* As requested, keep nice contrast but user said remove BG bars - wait, user said 'Remove white background bars'. Black is okay? Or remove all bars? User said 'remove white bars', use hard shadow. Let's try NO BG. */
            /* UPDATING TO NO BG AS PER REQUEST */
            background: transparent;
            color: #FFF;
            text-shadow: 4px 4px 0 #000;
            padding: 0;
            margin-top: 0;
            transform: skewX(-15deg);
            border: none;
            -webkit-text-stroke: 0;
        }

        /* BOTTOM CONTROLS */
        .controls-section {
            display: flex; flex-direction: column; align-items: center;
            margin-bottom: 20vh; /* Move up a bit */
            gap: 30px;
        }

        .action-title {
            font-family: 'Noto Serif SC', serif; /* Elegant serif font with clear strokes */
            font-size: 3rem;
            
            /* PURE WHITE - Force clean fill */
            color: #FFFFFF;
            -webkit-text-fill-color: #FFFFFF; /* Override any potential gradient clips */
            background: none; /* Ensure no texture background */
            
            /* Black Stroke (3px - balanced between style and clarity) */
            -webkit-text-stroke: 3px #000;
            paint-order: stroke fill;
            
            /* Purple Outer Glow */
            text-shadow: 0 0 15px #800080;
            
            font-weight: 900;
            margin: 0;
            letter-spacing: 5px; /* Increased for serif font */
            position: relative;
            z-index: 100;
        }

        /* BUTTON DESIGN */
        .stand-arrow-btn {
            background: transparent; border: none;
            cursor: pointer;
            perspective: 500px;
            transition: transform 0.2s;
            animation: btn-heartbeat 1.5s ease-in-out infinite;
        }
        .stand-arrow-btn:hover { animation: none; transform: scale(1.1); }
        .stand-arrow-btn:active { transform: scale(0.95); }

        .btn-inner {
            background: #000; /* PURE BLACK BACKGROUND */
            padding: 10px 45px; /* Slightly tighter */
            display: flex; align-items: center; gap: 25px;
            transform: skewX(-20deg); 
            border: 3px solid #FFD700; /* Gold Border */
            box-shadow: -6px -6px 0 #4b0082; 
            position: relative;
            overflow: hidden;
        }

        .arrow-icon-img {
            width: 70px; height: 70px;
            object-fit: contain;
            transform: skewX(20deg) rotate(-15deg); /* Adjusted for stand_arrow.png angle */
            /* Cleaner look: subtle drop shadow, no heavy brightness overrides */
            filter: drop-shadow(0 0 5px rgba(255, 215, 0, 0.4));
        }

        .btn-text {
            display: flex; flex-direction: column; align-items: flex-start;
            transform: skewX(20deg);
            color: #FFD700; /* GOLD TEXT */
            line-height: 1;
        }
        .btn-text span { font-size: 2rem; font-weight: 900; letter-spacing: 2px; }
        .btn-text small { font-size: 0.9rem; font-weight: 800; opacity: 1; letter-spacing: 1px; }

        @keyframes btn-heartbeat {
            0% { transform: scale(1); }
            15% { transform: scale(1.05); }
            30% { transform: scale(1); }
            100% { transform: scale(1); }
        }

        .exit-anim { opacity: 0; transform: scale(1.1); }

        /* === RESPONSIVE LANDING === */
        @media (max-width: 768px) {
            .main-logo { font-size: 5rem; }
            .sub-logo { font-size: 1.5rem; }
            .hat-layer { top: 35%; width: 90%; opacity: 0.6; } /* Move hat up and fade */
            .logo-section { margin-top: 10vh; }
            .controls-section { margin-bottom: 15vh; gap: 20px; }
            .action-title { font-size: 1.8rem; -webkit-text-stroke: 1.5px #000; letter-spacing: 2px; }
            
            .btn-inner { padding: 8px 25px; gap: 15px; }
            .arrow-icon-img { width: 50px; height: 50px; }
            .btn-text span { font-size: 1.4rem; } 
            .btn-text small { font-size: 0.7rem; }
            
            /* SFX Scaling */
            .sfx-layer span { font-size: 3rem; }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
