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
        <div className="loading-container">
          <div className="menacing-loader">ゴゴゴゴ...</div>
          <p>正在从精神之海中召唤替身...</p>
        </div>
      );
    }

    switch (gameState) {
      case 'LANDING':
        return <LandingPage onStart={handleStartGame} />;

      case 'INPUT':
        return <InputForm onSubmit={handleGenerate} onCancel={handleBackToTitle} />;

      case 'RESULT':
        return standData ? (
          <StandCard standData={standData} onReset={handleReset} />
        ) : null;

      default:
        return <LandingPage onStart={handleStartGame} />;
    }
  };

  return (
    <div className="app-container">
      {/* GLOBAL HUD (Only show on Input/Result, hide on Landing for immersion?) */}
      {gameState !== 'LANDING' && (
        <NavBar
          onReset={handleBackToTitle} // "The Fool" now goes to Title? Or Input? Let's say Title for "New Awakening"
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

      {/* MODALS */}
      {showHistory && (
        <div className="modal-overlay" onClick={() => setShowHistory(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <HistoryList history={history} />
            <button className="close-btn" onClick={() => setShowHistory(false)}>CLOSE</button>
          </div>
        </div>
      )}

      {showDonate && <DonateModal onClose={() => setShowDonate(false)} />}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      {showFAQ && <FAQModal onClose={() => setShowFAQ(false)} />}

      <style>{`
          .loading-container {
              color: #fff; text-align: center; margin-top: 100px;
              font-family: 'ZCOOL KuaiLe'; font-size: 2rem;
          }
          .menacing-loader {
              font-size: 4rem; animation: shake 1s infinite alternate;
              color: #d500f9; margin-bottom: 20px;
          }
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
