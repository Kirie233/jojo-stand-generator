import React, { useState, useEffect } from 'react';
import LandingPage from './LandingPage'; // Import Landing Page
import InputForm from './InputForm';
import StandCard from './StandCard';
import HistoryList from './HistoryList';
import NavBar from './NavBar';
import DonateModal from './DonateModal';
import HelpModal from './HelpModal';
import FAQModal from './FAQModal';
import { generateStandProfile, generateStandImage, getCachedStand, saveCachedStand } from '../services/gemini';
import { saveStandToDB, getAllStandsFromDB, initDB } from '../services/db';
import '../styles/variables.css';

const StandGenerator = () => {
  // GAME STATE: 'LANDING' | 'INPUT' | 'RESULT'
  const [gameState, setGameState] = useState('LANDING');

  const [standData, setStandData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showDonate, setShowDonate] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [inputProgress, setInputProgress] = useState({ current: 0, total: 1 });

  // Load history from DB on mount
  useEffect(() => {
    const init = async () => {
      try {
        await initDB();
        // LocalStorage Migration Logic (Simplified)
        const oldRaw = localStorage.getItem('jojo_stand_history');
        if (oldRaw) {
          const old = JSON.parse(oldRaw);
          if (Array.isArray(old)) {
            for (const i of old) await saveStandToDB(i);
            localStorage.removeItem('jojo_stand_history');
          }
        }
        const items = await getAllStandsFromDB();
        setHistory(items);
      } catch (e) { console.error(e); }
    };
    init();
  }, []);

  // --- AUTOMATIC SCROLL TO TOP ON STATE CHANGE ---
  useEffect(() => {
    const container = document.querySelector('.app-container');
    if (container) {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [gameState, standData]); // Scroll up when changing state or loading new stand

  // --- FLOW HANDLERS ---
  const handleStartGame = () => {
    setGameState('INPUT');
  };

  const handleBackToTitle = () => {
    // Nigerundayo!
    setGameState('LANDING');
    setStandData(null);
    setLoading(false);
    setError(null); // Clear error when going back to title
  };

  const handleReset = () => {
    setStandData(null);
    setGameState('INPUT'); // Or LANDING if preferred, but usually Retry means new Input
    setError(null); // Clear error when resetting
  };

  const handleGenerate = async (inputs) => {
    setLoading(true);
    setError(null);
    setShowHistory(false);

    // EASTER EGG: 10% Chance of Rejection (Death)
    if (Math.random() < 0.1) {
      setTimeout(() => {
        setLoading(false);
        setGameState('DEATH');
      }, 2000); // Fake delay for suspense
      return;
    }

    // Check Cache
    const cached = getCachedStand(inputs);
    if (cached) {
      setStandData(cached);
      await saveStandToDB(cached);
      setHistory(await getAllStandsFromDB());
      setLoading(false);
      setGameState('RESULT'); // Move to Result
      return;
    }

    try {
      // Generate Text
      const data = await generateStandProfile(inputs);
      setStandData({ ...data, userName: inputs.userName });
      setGameState('RESULT'); // Show Text first

      // Generate Image in background
      if (data.appearance) {
        generateStandImage(data.appearance).then(async (imageUrl) => {
          const finalImageUrl = imageUrl || null;
          const fullData = {
            ...data,
            imageUrl: finalImageUrl,
            userName: inputs.userName,
            referenceImage: inputs.referenceImage,
            timestamp: Date.now(),
            id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString()
          };

          // Update State & Cache
          setStandData(fullData);
          saveCachedStand(inputs, fullData);
          await saveStandToDB(fullData);
          setHistory(await getAllStandsFromDB());
        });
      }
    } catch (err) {
      console.error(err);
      setError("替身觉醒失败... 你的精神力还不够强吗？(API Error)");
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER HELPERS ---
  const renderContent = () => {
    if (loading) {
      return (
        <div className="kars-loading-overlay">
          <div className="kars-drifter">
            <img src="/assets/kars_frozen.png" alt="Kars Stopped Thinking" className="kars-img" />
            <div className="menacing-text left">ゴ</div>
            <div className="menacing-text right">ゴ</div>
          </div>
          <div className="kars-message-box">
            <h2 className="kars-main-text">卡兹停止了思考...</h2>
            <p className="kars-sub-text">HE FINALLY STOPPED THINKING</p>
            <div className="loading-bar-container">
              <div className="loading-bar-fill"></div>
            </div>
            <p className="loading-status">正在从精神彼岸召唤替身...</p>
          </div>
        </div>
      );
    }

    switch (gameState) {
      case 'LANDING':
        return <LandingPage onStart={handleStartGame} />;

      case 'INPUT':
        return <InputForm
          onSubmit={handleGenerate}
          onCancel={handleBackToTitle}
          onStepChange={setInputProgress}
        />;

      case 'RESULT':
        return standData ? (
          <StandCard standData={standData} onReset={handleReset} />
        ) : null;

      case 'DEATH':
        return (
          <div className="death-screen">
            <h1 className="retired-text">RETIRED</h1>
            <p className="death-message">箭拒绝了你... 你的精神力太弱了。</p>
            <p className="death-sub">The Arrow rejected you.</p>
            <button className="try-again-btn" onClick={handleReset}>
              再次挑战 (TRY AGAIN)
            </button>
          </div>
        );

      default:
        return <LandingPage onStart={handleStartGame} />;
    }
  };

  const handleLoadFromHistory = (item) => {
    setStandData(item);
    setGameState('RESULT');
    setShowHistory(false);
  };

  return (
    <div className="app-container">
      {/* GLOBAL HUD (Only show on Input/Result, hide on Landing for immersion?) */}
      {gameState !== 'LANDING' && (
        <NavBar
          onReset={handleBackToTitle} // "The Fool" now goes to Title? Or Input? Let's say Title for "New Awakening"
          isHistoryOpen={showHistory}
          onToggleHistory={() => {
            setShowHistory(prev => !prev);
            setShowDonate(false);
            setShowHelp(false);
            setShowFAQ(false);
          }}
          onToggleDonate={() => {
            setShowDonate(prev => !prev);
            setShowHistory(false);
            setShowHelp(false);
            setShowFAQ(false);
          }}
          onToggleHelp={() => {
            setShowHelp(prev => !prev);
            setShowHistory(false);
            setShowDonate(false);
            setShowFAQ(false);
          }}
          onToggleFAQ={() => {
            setShowFAQ(prev => !prev);
            setShowHistory(false);
            setShowDonate(false);
            setShowHelp(false);
          }}
        />
      )}

      {/* ERROR MESSAGE */}
      {error && (
        <div className="error-message" onClick={() => setError(null)}>
          <span className="error-icon">⚠️</span> {error}
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="content-area">
        {renderContent()}
      </main>

      {/* MODALS & DRAWERS */}
      {showHistory && (
        <HistoryList
          history={history}
          onClose={() => setShowHistory(false)}
          onLoad={handleLoadFromHistory}
        />
      )}

      {showDonate && <DonateModal onClose={() => setShowDonate(false)} />}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      {showFAQ && <FAQModal onClose={() => setShowFAQ(false)} />}

      {/* FIXED UI ELEMENTS (TBC ARROW) - ROOT LEVEL FOR STABLE CONTEXT */}
      {gameState === 'INPUT' && (
        <>
          <div className="tbc-container-fixed">
            <div className="tbc-mask-container">
              <div className="tbc-mask-bg"></div>
              <div
                className="tbc-mask-fill"
                style={{ width: `${inputProgress.total > 1 ? (inputProgress.current / (inputProgress.total - 1)) * 100 : 0}%` }}
              ></div>
            </div>
          </div>

          <img
            src="/assets/stand_awakening_text.png"
            className={`tbc-floating-img-global ${inputProgress.current === inputProgress.total - 1 ? 'visible' : ''}`}
            alt="Stand Awakening"
          />
        </>
      )}

      <style>{`
        .tbc-floating-img-global {
            position: fixed;
            bottom: 30px; /* Lowered to sit closer to the arrow per user request */
            left: 25px;    /* Slightly moved in for tighter grouping */
            width: 320px;  /* Slightly larger for more impact */
            opacity: 0;
            transform: translateY(20px) scale(0.8);
            transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            mix-blend-mode: screen; 
            pointer-events: none;
            z-index: 10; /* Above arrow but behind card/modals */
        }
        .tbc-floating-img-global.visible {
            opacity: 1;
            transform: translateY(0) scale(1);
        }

          .kars-loading-overlay {
              position: fixed; top: 0; left: 0; width: 100%; height: 100%;
              /* Colder, more monochrome space gradient */
              background: radial-gradient(circle at center, #0a0a1a 0%, #000 100%);
              display: flex; flex-direction: column; align-items: center; justify-content: center;
              z-index: 9999; overflow: hidden;
          }
          .kars-drifter {
              position: relative;
              width: 450px; height: 450px; /* Increased size to match reference scale */
              animation: space-float 15s ease-in-out infinite;
              margin-bottom: 20px;
          }
          .kars-img {
              width: 100%; height: 100%; object-fit: contain;
              /* Cinematic silver/blue glow */
              filter: drop-shadow(0 0 40px rgba(176, 190, 197, 0.3));
              border-radius: 10px;
          }
          .menacing-text {
              position: absolute; font-family: 'ZCOOL KuaiLe'; font-size: 5rem; color: #fff;
              text-shadow: 0 0 15px rgba(213, 0, 249, 0.8), 2px 2px 0 #000; opacity: 0.5;
          }
          .menacing-text.left { top: 10%; left: -10%; animation: menace-float 4s ease-in-out infinite; }
          .menacing-text.right { bottom: 10%; right: -10%; animation: menace-float 4s ease-in-out infinite reverse; }

          .kars-message-box { text-align: center; position: relative; z-index: 10; padding-bottom: 20px; }
          .kars-main-text {
              font-family: 'ZCOOL KuaiLe'; font-size: 3.5rem; color: #fff;
              text-shadow: 0 0 20px rgba(255, 255, 255, 0.5), 3px 3px 0 #000;
              margin-bottom: 0px;
              letter-spacing: 2px;
          }
          .kars-sub-text {
              font-family: 'Anton'; font-size: 1.4rem; color: #b0bec5;
              letter-spacing: 6px; margin-bottom: 25px; opacity: 0.9;
              text-transform: uppercase;
          }
          
          .loading-bar-container {
              width: 350px; height: 2px; background: rgba(255,255,255,0.05);
              margin: 15px auto; border-radius: 1px; overflow: hidden;
          }
          .loading-bar-fill {
              width: 100%; height: 100%; background: linear-gradient(90deg, transparent, #fff, transparent);
              animation: loading-scan 1.5s linear infinite;
              opacity: 0.8;
          }
          .loading-status {
              font-family: 'Noto Serif SC'; font-size: 0.9rem; color: rgba(255,255,255,0.4);
              font-style: italic; letter-spacing: 1px;
          }

          @keyframes space-float {
              0%, 100% { transform: translate(0, 0) rotate(0deg); }
              33% { transform: translate(15px, -20px) rotate(2deg); }
              66% { transform: translate(-10px, 15px) rotate(-2deg); }
          }
          @keyframes menace-float {
              0%, 100% { transform: scale(1) translateY(0); opacity: 0.4; }
              50% { transform: scale(1.2) translateY(-10px); opacity: 0.8; }
          }
          @keyframes loading-scan {
              from { transform: translateX(-100%); }
              to { transform: translateX(100%); }
          }
          @keyframes shake { from { transform: rotate(-5deg); } to { transform: rotate(5deg); } }
          .error-message {
              position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
              background: #d32f2f; color: #fff; padding: 15px 30px;
              border: 3px solid #000; z-index: 10000;
              font-family: 'Courier New'; font-weight: bold;
              cursor: pointer; box-shadow: 5px 5px 0 rgba(0,0,0,0.5);
              animation: slideDown 0.5s cubic-bezier(0.18, 0.89, 0.32, 1.28);
          }
          @keyframes slideDown { from {top: -100px;} to {top: 20px;} }
          
          .content-area {
              width: 100%;
              min-height: 80vh;
              display: flex;
              justify-content: center;
              padding: 20px;
          }
      `}</style>
    </div>
  );
};

export default StandGenerator;
