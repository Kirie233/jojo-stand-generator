import React, { useState } from 'react';

const LandingPage = ({ onStart }) => {
  const [isStarting, setIsStarting] = useState(false);

  const handleClick = () => {
    setIsStarting(true);
    // Play sound here if possible: new Audio('/ora.mp3').play();
    setTimeout(() => {
      onStart();
    }, 800); // 0.8s for transition animation
  };

  return (
    <div className={`landing-container ${isStarting ? 'shattering' : ''}`}>

      {/* BACKGROUND ELEMENTS */}
      <div className="landing-bg"></div>
      <img src="/assets/jojo_silhouettes.png" className="jojo-silhouettes-bg" alt="" />
      <img src="/assets/joestar_star.png" className="joestar-star-topright" alt="Joestar Mark" />

      {/* MENACING SFX */}
      <div className="sfx-layer">
        <span style={{ top: '10%', left: '5%' }}>ゴ</span>
        <span style={{ top: '15%', left: '12%' }}>ゴ</span>
        <span style={{ top: '25%', left: '8%' }}>ゴ</span>
        <span style={{ top: '80%', right: '5%' }}>ド</span>
        <span style={{ top: '75%', right: '12%' }}>ォ</span>
        <span style={{ top: '85%', right: '8%' }}>ン</span>
      </div>

      <div className="jotaro-hat-container">
        <div className="hat-brim-logic">
          <div className="hat-palm-emblem"></div>
          <div className="title-wrapper">
            <h1 className="main-title">
              <span className="jojo-word">JOJO</span>
              <span className="sub-title">STAND GENERATOR</span>
            </h1>
            <div className="jap-title">奇妙な冒険：替身生成器</div>
          </div>

          <button className="start-btn" onClick={handleClick}>
            <span className="btn-content">
              <span className="arrow-icon">➤</span>
              <span className="btn-text">觉醒你的替身<br /><small>ENTER THE WORLD</small></span>
            </span>
          </button>
        </div>
      </div>

      <style>{`
        .landing-container {
            position: fixed;
            top: 0; left: 0; width: 100vw; height: 100vh;
            background: #2b003e; /* Deep Purple */
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            z-index: 5000;
            transition: all 0.5s;
        }

        /* BACKGROUND PATTERN */
        .landing-bg {
            position: absolute; inset: 0;
            background-image: 
                radial-gradient(#4a148c 30%, transparent 30%),
                linear-gradient(45deg, rgba(255,215,0,0.1) 25%, transparent 25%, transparent 75%, rgba(255,215,0,0.1) 75%);
            background-size: 20px 20px, 40px 40px;
            opacity: 0.5;
            z-index: 0;
            animation: bg-scroll 20s linear infinite;
        }
        @keyframes bg-scroll { 0% {background-position: 0 0;} 100% {background-position: 100px 100px;} }

        /* DECORATIONS */
        .joestar-star-topright {
            position: absolute;
            top: 40px; right: 40px;
            width: 80px; height: 80px;
            background: #d500f9;
            clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
            box-shadow: 0 0 30px #d500f9;
            animation: breathe-star 3s infinite alternate;
            z-index: 100;
        }
        @keyframes breathe-star {
            from { transform: scale(1) rotate(0deg); filter: brightness(1); }
            to { transform: scale(1.2) rotate(15deg); filter: brightness(1.5); }
        }

        .jojo-silhouettes-bg {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 30%;
            background: url('/assets/jojo_silhouettes.png') center bottom no-repeat;
            background-size: cover;
            opacity: 0.2;
            mix-blend-mode: screen; /* Fixes checkerboard if it's dark enough */
            z-index: 1;
        }

        /* JOTARO HAT THEME */
        .jotaro-hat-container {
            position: relative;
            z-index: 10;
            transform: rotate(8deg);
        }

        .hat-brim-logic {
            background: #000;
            padding: 80px 100px;
            border: 6px solid #FFD700;
            box-shadow: 15px 15px 0 #d500f9;
            position: relative;
            /* Jotaro Hat Brim Shape */
            border-radius: 10px 10px 300px 80px;
            overflow: hidden;
        }

        .hat-brim-logic::before {
            content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 30px;
            background: #d500f9; /* Cap band */
        }

        .hat-palm-emblem {
            position: absolute;
            top: 35px; left: 30px;
            width: 60px; height: 60px;
            background: #FFD700;
            clip-path: polygon(40% 0%, 50% 20%, 60% 0%, 80% 20%, 100% 50%, 80% 80%, 50% 100%, 20% 80%, 0% 50%, 20% 20%);
            border: 2px solid #000;
        }

        /* SFX */
        .sfx-layer span {
            position: absolute;
            font-family: 'Noto Serif SC', serif;
            font-weight: 900;
            font-size: 4rem;
            color: rgba(213, 0, 249, 0.2);
            animation: shake 2s infinite ease-in-out alternate;
            z-index: 5;
        }

        /* TITLE */
        .title-wrapper {
            position: relative;
            z-index: 10;
            text-align: center;
            margin-bottom: 40px;
        }
        .main-title {
            font-family: 'ZCOOL KuaiLe', cursive;
            font-size: 7rem;
            color: #FFD700;
            text-shadow: 8px 8px 0 #000;
            margin: 0;
            line-height: 0.9;
        }
        .sub-title {
            display: block;
            font-family: 'Anton', sans-serif;
            font-size: 2.5rem;
            color: #fff;
            background: #000;
            padding: 5px 20px;
            margin-top: 10px;
            transform: skewX(10deg);
        }
        .jap-title {
            font-family: 'Noto Serif SC', serif;
            font-weight: bold;
            font-size: 1.5rem;
            color: #FFD700;
            margin-top: 15px;
            text-shadow: 2px 2px 2px #000;
            letter-spacing: 5px;
        }

        /* START BUTTON */
        .start-btn {
            position: relative;
            z-index: 10;
            background: transparent;
            border: none;
            cursor: pointer;
            transition: transform 0.2s;
            margin-top: 20px;
        }
        .start-btn:hover { transform: scale(1.1) rotate(-2deg); }
        
        .btn-content {
            display: flex;
            align-items: center;
            gap: 15px;
            background: #000;
            border: 4px solid #d500f9;
            padding: 15px 40px;
            clip-path: polygon(5% 0, 100% 0, 95% 100%, 0% 100%);
            box-shadow: 0 0 15px #d500f9;
        }
        
        @keyframes pulse-glow {
            0% { box-shadow: 0 0 20px #FFD700; }
            50% { box-shadow: 0 0 50px #FFD700, 0 0 30px #d500f9; }
            100% { box-shadow: 0 0 20px #FFD700; }
        }

        .arrow-icon {
            font-size: 3rem;
            color: #d500f9;
            animation: point-right 1s infinite alternate;
        }
        @keyframes point-right { from {transform: translateX(0);} to {transform: translateX(10px);} }

        .btn-text {
            color: #fff;
            font-family: 'ZCOOL KuaiLe', cursive;
            font-size: 2rem;
            text-align: left;
            line-height: 1.2;
        }
        .btn-text small {
            font-family: 'Anton', sans-serif;
            font-size: 1rem;
            color: #aaa;
            letter-spacing: 2px;
        }

        /* SHATTER EFFECT (Simple CSS approximation) */
        .landing-container.shattering {
            opacity: 0;
            transform: scale(1.5) rotate(5deg);
            filter: blur(10px);
        }

        @media (max-width: 768px) {
            .main-title { font-size: 5rem; }
            .sub-title { font-size: 2rem; }
            .btn-content { padding: 15px 30px; }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
