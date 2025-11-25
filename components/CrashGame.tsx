import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Terminal, RotateCcw, History, Clock, MapPin, TrendingUp, Activity, XCircle } from 'lucide-react';
import { generateCrashPrediction } from '../services/gemini';
import { fetchCrashOdd } from '../services/database';
import { playSound } from '../services/audio';
import { CrashPredictionResult, GameState, AccessKey, Language } from '../types';
import { translations } from '../translations';

const MotionDiv = motion.div as any;

interface CrashGameProps {
  onBack: () => void;
  accessKeyData: AccessKey | null;
  language: Language;
}

export const CrashGame: React.FC<CrashGameProps> = ({ onBack, accessKeyData, language }) => {
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [result, setResult] = useState<CrashPredictionResult | null>(null);
  const [currentMultiplier, setCurrentMultiplier] = useState(1.00);
  const [userRegion, setUserRegion] = useState<string>('Unknown');
  const t = translations[language];
  
  // Graph State
  const [graphPoints, setGraphPoints] = useState<{x: number, y: number}[]>([{x: 0, y: 1}]);
  
  const [history, setHistory] = useState<CrashPredictionResult[]>(() => {
    if (typeof window !== 'undefined') {
        try {
            const saved = localStorage.getItem('crash-ai-history');
            return saved ? JSON.parse(saved) : [];
        } catch (e) { return []; }
    }
    return [];
  });
  const [showHistory, setShowHistory] = useState(false);

  const requestRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      try {
          const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          const regionName = timeZone.split('/')[1] || timeZone;
          setUserRegion(regionName.replace(/_/g, ' '));
      } catch (e) {
          setUserRegion('Global');
      }
  }, []);

  useEffect(() => {
      localStorage.setItem('crash-ai-history', JSON.stringify(history));
  }, [history]);

  const animateValue = (time: number) => {
     if (!startTimeRef.current) startTimeRef.current = time;
     const progress = time - startTimeRef.current;
     
     // Simulation Logic: 
     // X axis = time (ms), Y axis = Multiplier
     // Simple curve: y = 1 + 0.0002 * x^1.4
     const seconds = progress / 1000;
     const val = 1 + (0.1 * Math.pow(seconds, 2)); 
     
     // Update Graph Points
     setGraphPoints(prev => {
         const newX = seconds * 20; // Scale X for view
         const newY = val;
         // Keep last 50 points for performance if needed, but for smooth curve we want all
         return [...prev, { x: newX, y: newY }];
     });

     if (val < 100) {
        setCurrentMultiplier(val);
        requestRef.current = requestAnimationFrame(animateValue);
     }
  };

  const handlePredict = async () => {
    if (gameState === GameState.ANALYZING) return;
    
    playSound('plane-start');
    setGameState(GameState.ANALYZING);
    setResult(null);
    setCurrentMultiplier(1.00);
    setGraphPoints([{x: 0, y: 1}]);
    
    startTimeRef.current = 0;
    requestRef.current = requestAnimationFrame(animateValue);

    // Artificial wait plus API call
    const apiStartTime = Date.now();
    
    // FETCH REAL DATA
    const firebaseOdd = await fetchCrashOdd();
    const aiData = await generateCrashPrediction(); // We still fetch this for analysis/history text
    
    const elapsedTime = Date.now() - apiStartTime;
    const minTime = 4000; // Longer animation for graph effect
    
    if (elapsedTime < minTime) {
        await new Promise(r => setTimeout(r, minTime - elapsedTime));
    }

    cancelAnimationFrame(requestRef.current);
    playSound('crash');
    
    // Determine Final Data
    const finalCrashPoint = firebaseOdd !== null ? firebaseOdd : aiData.predictedCrash;
    const finalData: CrashPredictionResult = {
        ...aiData,
        predictedCrash: finalCrashPoint,
        safeCashout: parseFloat((finalCrashPoint * 0.9).toFixed(2)) // Recalculate safe cashout
    };

    setResult(finalData);
    // Snap to prediction
    setCurrentMultiplier(finalData.predictedCrash);
    // Add final point
    setGraphPoints(prev => [...prev, { x: prev[prev.length-1].x + 5, y: finalData.predictedCrash }]);
    
    setGameState(GameState.PREDICTED);
    setHistory(prev => [finalData, ...prev].slice(0, 10));
  };

  useEffect(() => {
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  // Generate SVG Path from points
  const getGraphPath = () => {
      if (graphPoints.length < 2) return "";
      
      // We need to scale points to fit the SVG viewbox (e.g. 100x100)
      // Max X is current time, Max Y is current multiplier + buffer
      const maxX = graphPoints[graphPoints.length - 1].x || 10;
      const maxY = Math.max(2, currentMultiplier * 1.2);
      
      const width = 400;
      const height = 250;
      
      const points = graphPoints.map(p => {
          const x = (p.x / maxX) * width;
          // Invert Y because SVG 0 is top
          const y = height - ((p.y - 1) / (maxY - 1)) * (height - 20) - 10; 
          return `${x},${y}`;
      });

      return `M 0,${height} L ${points.join(' L ')}`;
  };

  const graphPath = getGraphPath();
  const isCrashed = gameState === GameState.PREDICTED;

  return (
    <div className="flex flex-col h-full relative pt-2">
      
      {/* Top Info Bar */}
      <div className="flex justify-center mb-6">
          <div className="bg-[#151518]/90 backdrop-blur border border-white/5 rounded-full px-6 py-2 flex items-center gap-6 shadow-xl z-50">
              <div className="flex flex-col items-center leading-none">
                   <div className="flex items-center gap-1.5 mb-1">
                      <Clock className="w-3 h-3 text-orange-500" />
                      <span className="text-[10px] font-bold text-orange-400 tracking-wider">
                          {accessKeyData?.type === 'PERMANENT' ? 'LIFETIME' : 'ACTIVE'}
                      </span>
                   </div>
                   <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">
                       {accessKeyData?.name || 'USER'}
                   </span>
              </div>
              <div className="w-px h-6 bg-white/5" />
              <div className="flex flex-col items-center leading-none">
                  <div className="flex items-center gap-1.5 mb-1">
                      <MapPin className="w-3 h-3 text-zinc-400" />
                      <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">
                          {userRegion}
                      </span>
                  </div>
                  <span className="text-[9px] text-zinc-600 uppercase font-bold tracking-widest">{t.region.toUpperCase()}</span>
              </div>
          </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8 px-2">
        <div className="flex flex-col">
            <h1 className="text-3xl font-black text-white leading-none tracking-tight flex items-center gap-1">
                CRASH <span className="text-orange-500">PRO</span>
            </h1>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] mt-1">{t.marketTrend}</span>
        </div>
        <button 
          onClick={onBack}
          className="px-4 py-2 rounded-lg bg-zinc-900 border border-white/5 text-xs font-bold text-zinc-400 hover:text-white transition-all uppercase tracking-wider hover:bg-zinc-800"
        >
          {t.back}
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-6">
        
        {/* Graph Display Area */}
        <div className="relative rounded-3xl overflow-hidden flex flex-col min-h-[300px] bg-[#0c0c0e] border border-white/5 shadow-2xl group" ref={containerRef}>
            
            {/* Grid Lines */}
            <div className="absolute inset-0 z-0">
                <div className="w-full h-full" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
            </div>

            {/* Canvas / SVG Graph */}
            <div className="absolute inset-0 z-10 p-0 flex items-end">
                <svg viewBox="0 0 400 250" preserveAspectRatio="none" className="w-full h-full drop-shadow-lg">
                    <defs>
                        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={isCrashed ? "rgba(239, 68, 68, 0.5)" : "rgba(249, 115, 22, 0.5)"} />
                            <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
                        </linearGradient>
                    </defs>
                    
                    {/* Fill Area */}
                    <path 
                        d={`${graphPath} L 400,250 L 0,250 Z`} 
                        fill="url(#areaGradient)" 
                        className="transition-all duration-300"
                    />
                    
                    {/* Line Stroke */}
                    <path 
                        d={graphPath} 
                        fill="none" 
                        stroke={isCrashed ? "#ef4444" : "#f97316"} 
                        strokeWidth="3" 
                        strokeLinecap="round"
                        vectorEffect="non-scaling-stroke"
                        className="transition-colors duration-300"
                    />
                </svg>

                {/* Rocket / Point Indicator */}
                <div className="absolute inset-0 pointer-events-none">
                </div>
            </div>

            {/* Central HUD Multiplier */}
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none">
                <div className="flex flex-col items-center bg-[#09090b]/80 backdrop-blur-sm p-6 rounded-3xl border border-white/5 shadow-2xl">
                     <div className={`text-7xl font-black tabular-nums tracking-tighter flex items-baseline transition-all duration-100 ${isCrashed ? 'text-red-500 scale-110' : 'text-white'}`}>
                         <span>{currentMultiplier.toFixed(2)}</span>
                         <span className={`text-4xl ml-2 ${isCrashed ? 'text-red-600' : 'text-orange-500'}`}>x</span>
                     </div>
                     <span className={`text-[10px] uppercase tracking-[0.3em] font-bold mt-2 px-3 py-1 rounded-full border ${isCrashed ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-orange-500/10 border-orange-500/20 text-orange-500'}`}>
                         {gameState === GameState.ANALYZING ? t.currentMultiplier : gameState === GameState.PREDICTED ? t.crashPoint : t.ready}
                     </span>
                </div>
            </div>

            {/* Crash Overlay */}
            <AnimatePresence>
                {isCrashed && (
                     <MotionDiv 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-30 flex items-center justify-center bg-red-900/10 mix-blend-overlay pointer-events-none"
                     >
                         <div className="absolute inset-0 bg-red-500/10 animate-pulse" />
                     </MotionDiv>
                )}
            </AnimatePresence>
        </div>

        {/* Prediction Stats Cards */}
        <AnimatePresence>
            {result && gameState === GameState.PREDICTED && (
                 <MotionDiv 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="grid grid-cols-2 gap-4"
                 >
                    <div className="bg-[#121214] border border-white/5 p-4 rounded-2xl flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-green-500/10 to-transparent rounded-bl-full -mr-4 -mt-4" />
                        <span className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider mb-1">{t.safeCashout}</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-white">{result.safeCashout.toFixed(2)}</span>
                            <span className="text-sm font-bold text-green-500">x</span>
                        </div>
                    </div>
                    
                    <div className="bg-[#121214] border border-white/5 p-4 rounded-2xl flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-orange-500/10 to-transparent rounded-bl-full -mr-4 -mt-4" />
                        <span className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider mb-1">{t.confidence}</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-orange-500">{result.confidence}</span>
                            <span className="text-sm font-bold text-zinc-600">%</span>
                        </div>
                    </div>
                 </MotionDiv>
            )}
        </AnimatePresence>

        {/* Action Button */}
        <button 
             onClick={handlePredict}
             disabled={gameState === GameState.ANALYZING}
             className={`
                mt-auto w-full group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 shadow-xl
                ${gameState === GameState.ANALYZING 
                   ? 'bg-zinc-800 cursor-not-allowed opacity-50' 
                   : 'bg-white text-black hover:bg-zinc-200 active:scale-[0.98] shadow-white/5'}
             `}
          >
             <div className="relative flex items-center justify-center gap-3">
                {gameState === GameState.ANALYZING ? (
                    <>
                        <RotateCcw className="w-5 h-5 animate-spin text-zinc-500" />
                        <span className="font-bold tracking-widest text-sm">{t.calculatingTrajectory}</span>
                    </>
                ) : (
                    <>
                        <TrendingUp className="w-5 h-5 text-orange-600" />
                        <span className="font-black tracking-widest text-sm">{t.predictNext}</span>
                    </>
                )}
             </div>
          </button>
      </div>

       {/* History Toggle */}
       <div className="mt-4 pt-2 border-t border-white/5">
            <button 
                onClick={() => {
                    playSound('click');
                    setShowHistory(!showHistory);
                }}
                className="flex items-center justify-center w-full gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-600 hover:text-zinc-400 transition-colors py-2"
            >
                <History className="w-3 h-3" />
                {showHistory ? t.hideHistory : t.viewHistory}
            </button>

            <AnimatePresence>
                {showHistory && (
                    <MotionDiv 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="pt-2 space-y-2 pb-4">
                             {history.length === 0 ? (
                                <div className="text-center py-4 text-zinc-700 text-[10px] italic">
                                    {t.noHistory}
                                </div>
                             ) : (
                                history.map((h) => (
                                    <div key={h.id} className="bg-zinc-900/50 rounded-lg p-3 border border-white/5 flex items-center justify-between">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider">
                                                {new Date(h.timestamp).toLocaleTimeString()}
                                            </span>
                                        </div>
                                        <div className="text-right flex items-center gap-3">
                                             <span className="text-[10px] text-zinc-500">{t.exit}: {h.safeCashout}x</span>
                                             <div className={`font-black text-sm ${h.predictedCrash >= 2.0 ? 'text-green-500' : 'text-orange-500'}`}>
                                                 {h.predictedCrash.toFixed(2)}x
                                             </div>
                                        </div>
                                    </div>
                                ))
                             )}
                        </div>
                    </MotionDiv>
                )}
            </AnimatePresence>
       </div>
    </div>
  );
};