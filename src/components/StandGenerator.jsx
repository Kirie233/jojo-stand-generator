import React, { useState, useEffect } from 'react';
import InputForm from './InputForm';
import StandCard from './StandCard';
import HistoryList from './HistoryList';
import NavBar from './NavBar';
import DonateModal from './DonateModal';
import HelpModal from './HelpModal';
import { generateStandProfile, generateStandImage, getCachedStand, saveCachedStand } from '../services/gemini';
// Remove old history service import
// import { getHistory, addToHistory } from '../services/history'; 
import { saveStandToDB, getAllStandsFromDB, initDB } from '../services/db';
import '../styles/variables.css';

const StandGenerator = () => {
  const [standData, setStandData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showDonate, setShowDonate] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Load history from DB on mount (+ Migration Logic)
  useEffect(() => {
    const init = async () => {
      try {
        await initDB();

        // 1. Migration: Move old LocalStorage items to IndexedDB
        const oldRaw = localStorage.getItem('jojo_stand_history');
        if (oldRaw) {
          try {
            const oldHistory = JSON.parse(oldRaw);
            if (Array.isArray(oldHistory) && oldHistory.length > 0) {
              console.log("Migrating legacy history to DB...", oldHistory.length);
              for (const item of oldHistory) {
                await saveStandToDB(item);
              }
              // Clear old storage after successful migration
              localStorage.removeItem('jojo_stand_history');
              console.log("Migration complete. LocalStorage cleared.");
            }
          } catch (e) {
            console.error("Migration failed:", e);
          }
        }

        // 2. Load from DB
        const items = await getAllStandsFromDB();
        setHistory(items);
      } catch (e) {
        console.error("Failed to initialize DB:", e);
      }
    };
    init();
  }, []);

  const handleGenerate = async (inputs) => {
    setLoading(true);
    setError(null);
    setShowHistory(false);

    // 1. Check Cache
    const cached = getCachedStand(inputs);
    if (cached) {
      setStandData(cached);

      // Fix: Ensure cached items are also added to history (if missing)
      // Now using Async DB
      await saveStandToDB(cached);
      const updatedHistory = await getAllStandsFromDB();
      setHistory(updatedHistory);

      setLoading(false);
      return;
    }

    try {
      // 2. Generate Text Profile
      const data = await generateStandProfile(inputs);
      setStandData({ ...data, userName: inputs.userName }); // Display text immediately while image loads

      // 3. Generate Image (Async)
      if (data.appearance) {
        generateStandImage(data.appearance).then(async (imageUrl) => {
          // Prepare final data (with or without image)
          const finalImageUrl = imageUrl || null;
          const fullData = {
            ...data,
            imageUrl: finalImageUrl,
            userName: inputs.userName,
            timestamp: Date.now(),
            // Ensure ID for DB
            id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString()
          };

          // Update Display State
          setStandData(fullData);

          // Save to Cache & DB
          saveCachedStand(inputs, fullData);

          try {
            await saveStandToDB(fullData);
            const updatedHistory = await getAllStandsFromDB();
            setHistory(updatedHistory);
            console.log("Saved to IndexedDB successfully");
          } catch (dbErr) {
            console.error("DB Save failed:", dbErr);
          }

          if (!imageUrl) {
            console.warn("Image generation failed, saved text profile only.");
          }
        });
      }
    } catch (err) {
      console.error(err);
      setError("替身觉醒失败 (FAILED): " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStandData(null);
    setError(null);
  };

  return (
    <div className="generator-container">
      <NavBar
        onReset={handleReset}
        onToggleHistory={() => setShowHistory(prev => !prev)}
        onToggleDonate={() => setShowDonate(true)}
        onToggleHelp={() => setShowHelp(true)}
      />

      {showDonate && <DonateModal onClose={() => setShowDonate(false)} />}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

      {showHistory && (
        <HistoryList
          history={history}
          onClose={() => setShowHistory(false)}
          onLoad={(item) => {
            setStandData(item);
            setShowHistory(false);
          }}
        />
      )}

      <main className="content-area">
        {loading && (
          <div className="loading-state">
            <div className="menacing">ゴ</div>
            <div className="menacing">ゴ</div>
            <div className="menacing">ゴ</div>
            <div className="menacing">ゴ</div>
            <p>觉醒中... AWAKENING</p>
          </div>
        )}

        {error && (
          <div className="error-state">
            <p>{error}</p>
            <button onClick={() => setError(null)}>重试 (RETRY)</button>
          </div>
        )}

        {!loading && !standData && (
          <div className="intro-area">
            <h1 className="main-title">JOJO替身生成器</h1>
            <p className="subtitle">觉醒你的精神幽波纹</p>
            <InputForm onSubmit={handleGenerate} />
          </div>
        )}

        {!loading && standData && (
          <div className="result-area">
            <StandCard standData={standData} />
            <button className="reset-button" onClick={handleReset}>
              下一位替身使者 (NEXT USER)
            </button>

            <div className="sponsor-inline">
              <p>喜欢这个替身？请我喝杯阿帕茶 ☕</p>
              <div className="qr-box-small">
                <img src="/sponsor.png" alt="Sponsor" />
              </div>
            </div>
          </div>
        )}
      </main>

      <style>{`
        .generator-container {
            width: 100%;
            max-width: 1200px;
            margin: 0 auto;
            padding: 80px 20px 20px; /* Top padding for fixed navbar */
            text-align: center;
        }

        .main-title {
            font-size: 4rem;
            color: var(--accent-color);
            text-shadow: 4px 4px var(--primary-color);
            margin-bottom: 10px;
            line-height: 1;
        }

        .subtitle {
            color: var(--secondary-color);
            letter-spacing: 5px;
            font-size: 1.2rem;
            margin-bottom: 40px;
            font-weight: bold;
        }

        .loading-state {
            font-size: 3rem;
            color: var(--primary-color);
            animation: pulse 1s infinite alternate;
        }

        .menacing {
            display: inline-block;
            margin: 0 10px;
            animation: shake 0.5s infinite;
        }
        
        .menacing:nth-child(1) { animation-delay: 0s; }
        .menacing:nth-child(2) { animation-delay: 0.1s; }
        .menacing:nth-child(3) { animation-delay: 0.2s; }
        .menacing:nth-child(4) { animation-delay: 0.3s; }

        .error-state {
            color: red;
            background: rgba(255,0,0,0.1);
            padding: 20px;
            border: 1px solid red;
        }

        .reset-button {
            margin-top: 30px;
            background: transparent;
            border: 2px solid var(--text-color);
            color: var(--text-color);
            padding: 10px 30px;
            font-family: var(--font-heading);
            font-size: 1.2rem;
            transition: all 0.3s;
            cursor: pointer;
        }

        .reset-button:hover {
            background: var(--text-color);
            color: var(--bg-color);
        }

        @keyframes shake {
            0% { transform: translate(0, 0) rotate(0deg); }
            25% { transform: translate(2px, 2px) rotate(5deg); }
            50% { transform: translate(0, -2px) rotate(0deg); }
            75% { transform: translate(-2px, 2px) rotate(-5deg); }
            100% { transform: translate(0, 0) rotate(0deg); }
        }
        
        @keyframes pulse {
            from { opacity: 0.6; }
            to { opacity: 1; }
        }

        .sponsor-inline {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px dashed rgba(255,255,255,0.2);
            color: var(--subtext-color);
        }

        .sponsor-inline p {
            margin-bottom: 15px;
            font-size: 0.9rem;
        }

        .qr-box-small {
            width: 120px;
            height: 120px;
            background: white;
            padding: 5px;
            border-radius: 4px;
            margin: 0 auto;
        }
        
        .qr-box-small img {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }
      `}</style>
    </div>
  );
};

export default StandGenerator;
