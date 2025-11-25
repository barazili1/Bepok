import React, { useState, useEffect } from 'react';
import { Grid } from './Grid';
import { generatePrediction } from '../services/gemini';
import { playSound } from '../services/audio';
import { GameState, PredictionResult, AccessKey, Language } from '../types';
import { translations } from '../translations';
import { 
    History, 
    ChevronRight, 
    Activity,
    AlertTriangle,
    Minus,
    Plus,
    LayoutGrid,
    Target,
    Zap,
    Shield,
    Skull,
    Eye,
    EyeOff,
    Maximize2,
    X,
    Terminal,
    Check,
    Clock,
    MapPin,
    Key
} from 'lucide-react';

interface AppleGameProps {
    onBack: () => void;
    accessKeyData: AccessKey | null;
    language: Language;
}

export const AppleGame: React.FC<AppleGameProps> = ({ onBack, accessKeyData, language }) => {
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [userRegion, setUserRegion] = useState<string>('Unknown');
  const t = translations[language];
  
  // Settings State with Local Storage Persistence
  const [rowCount, setRowCount] = useState(() => {
    if (typeof window !== 'undefined') {
        try {
            const saved = localStorage.getItem('fortune-ai-rows');
            if (saved) {
                const parsed = parseInt(saved, 10);
                return Math.min(15, Math.max(5, parsed));
            }
        } catch (e) {
            console.warn('Failed to load settings', e);
        }
    }
    return 10;
  });

  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>(() => {
    if (typeof window !== 'undefined') {
        try {
            const saved = localStorage.getItem('fortune-ai-difficulty');
            if (saved === 'Easy' || saved === 'Medium' || saved === 'Hard') {
                return saved;
            }
        } catch (e) {
            console.warn('Failed to load settings', e);
        }
    }
    return 'Hard';
  });

  const [currentResult, setCurrentResult] = useState<PredictionResult | null>(() => {
    if (typeof window !== 'undefined') {
        try {
            const saved = localStorage.getItem('fortune-ai-last-result');
            if (saved) {
                const parsed = JSON.parse(saved);
                // Basic validation
                if (parsed && Array.isArray(parsed.path)) {
                    return parsed;
                }
            }
        } catch (e) {
            console.warn('Failed to load last result', e);
        }
    }
    return null;
  });

  const [history, setHistory] = useState<PredictionResult[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  // Streak State with Local Storage Persistence
  const [winStreak, setWinStreak] = useState(() => {
    if (typeof window !== 'undefined') {
        try {
            return parseInt(localStorage.getItem('fortune-ai-winstreak') || '0', 10);
        } catch (e) { return 0; }
    }
    return 0;
  });

  const [lossStreak, setLossStreak] = useState(() => {
    if (typeof window !== 'undefined') {
        try {
            return parseInt(localStorage.getItem('fortune-ai-lossstreak') || '0', 10);
        } catch (e) { return 0; }
    }
    return 0;
  });

  const [revealRotten, setRevealRotten] = useState(false);
  
  // Modal State
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);

  useEffect(() => {
      // Detect Region
      try {
          const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          const regionName = timeZone.split('/')[1] || timeZone;
          setUserRegion(regionName.replace(/_/g, ' '));
      } catch (e) {
          setUserRegion('Global');
      }
  }, []);

  // Sync state with local storage
  useEffect(() => {
      localStorage.setItem('fortune-ai-rows', rowCount.toString());
  }, [rowCount]);

  useEffect(() => {
      localStorage.setItem('fortune-ai-difficulty', difficulty);
  }, [difficulty]);

  useEffect(() => {
      localStorage.setItem('fortune-ai-winstreak', winStreak.toString());
      localStorage.setItem('fortune-ai-lossstreak', lossStreak.toString());
  }, [winStreak, lossStreak]);

  useEffect(() => {
      if (currentResult) {
          localStorage.setItem('fortune-ai-last-result', JSON.stringify(currentResult));
          if (gameState === GameState.IDLE) {
              setGameState(GameState.PREDICTED);
          }
      } else {
          localStorage.removeItem('fortune-ai-last-result');
      }
  }, [currentResult, gameState]);

  // Handle the prediction logic
  const handlePredict = async () => {
    if (gameState === GameState.ANALYZING) return;
    
    playSound('predict');
    setGameState(GameState.ANALYZING);
    setRevealRotten(false);
    setCurrentResult(null);

    const startTime = Date.now();
    const result = await generatePrediction(rowCount, difficulty);
    const elapsedTime = Date.now() - startTime;
    const minTime = 1500; 
    
    if (elapsedTime < minTime) {
        await new Promise(resolve => setTimeout(resolve, minTime - elapsedTime));
    }

    if (result.confidence === 0) {
        setGameState(GameState.ERROR);
    } else {
        setGameState(GameState.PREDICTED);
        playSound('success');
    }
    
    setCurrentResult(result);
    setHistory(prev => [result, ...prev].slice(0, 10));
  };

  const adjustRows = (delta: number) => {
    playSound('click');
    setRevealRotten(false);
    if (gameState === GameState.PREDICTED || currentResult) {
        setGameState(GameState.IDLE);
        setCurrentResult(null);
    }
    setRowCount(prev => Math.min(15, Math.max(5, prev + delta)));
  };

  const handleDifficultyChange = (level: 'Easy' | 'Medium' | 'Hard') => {
      playSound('toggle');
      setDifficulty(level);
  };

  const toggleReveal = () => {
    if (!currentResult) return;
    playSound('toggle');
    setRevealRotten(prev => !prev);
  };

  const openAnalysis = () => {
      if (!currentResult && gameState !== GameState.ANALYZING) return;
      playSound('click');
      setIsAnalysisOpen(true);
  };

  const closeAnalysis = () => {
      playSound('click');
      setIsAnalysisOpen(false);
  };

  const handleWin = () => {
      playSound('success');
      setWinStreak(prev => prev + 1);
      setLossStreak(0);
  };

  const handleLoss = () => {
      playSound('toggle');
      setLossStreak(prev => prev + 1);
      setWinStreak(0);
  };

  return (
    <div className="flex flex-col h-full relative pt-2">
        
        {/* Top Info Bar (Centered) */}
        <div className="flex justify-center mb-4">
            <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-2 flex flex-col items-center gap-1 shadow-lg z-50 min-w-[200px]">
                
                {/* Row 1: Key Time & Name */}
                <div className="flex items-center gap-3 w-full justify-between border-b border-white/5 pb-1 mb-0.5">
                     <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-green-500" />
                        <span className="text-[11px] font-bold text-green-400 tracking-wider">
                            {accessKeyData?.type === 'PERMANENT' ? 'LIFETIME' : 'ACTIVE'}
                        </span>
                     </div>
                     <div className="flex items-center gap-1.5">
                        <Key className="w-3 h-3 text-zinc-500" />
                        <span className="text-[11px] text-zinc-300 uppercase font-bold">
                            {accessKeyData?.name || 'USER'}
                        </span>
                     </div>
                </div>

                {/* Row 2: Region */}
                <div className="flex items-center gap-1.5 opacity-80">
                    <MapPin className="w-3 h-3 text-zinc-500" />
                    <span className="text-[10px] text-zinc-400 uppercase tracking-widest">
                        {t.region} : <span className="text-zinc-300 font-bold">{userRegion}</span>
                    </span>
                </div>
            </div>
        </div>

        {/* Header Area (Logo & Back) */}
        <div className="flex items-center justify-between mb-6 px-1">
            <div className="flex items-center gap-3">
                <div className="bg-green-500/10 p-2.5 rounded-xl border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                    <LayoutGrid className="w-6 h-6 text-green-500" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white leading-none tracking-tight">FORTUNE<span className="text-green-500">AI</span></h1>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-medium ml-0.5">{t.predictorTool}</span>
                </div>
            </div>
            
            <button 
                onClick={onBack}
                className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors uppercase tracking-wider"
            >
                {t.back}
            </button>
        </div>

        {/* Configuration Toolbar */}
        <div className="mb-6 space-y-3">
            <div className="glass-panel p-3 rounded-xl border border-white/5 flex items-center justify-between px-4">
                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">{t.gridHeight}</span>
                <div className="flex items-center gap-3">
                     <button 
                        onClick={() => adjustRows(-1)} 
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 active:bg-white/20 flex items-center justify-center text-zinc-400 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        disabled={rowCount <= 5}
                     >
                        <Minus className="w-4 h-4" />
                     </button>
                     <span className="text-xl font-bold font-mono text-white min-w-[2rem] text-center">{rowCount}</span>
                     <button 
                        onClick={() => adjustRows(1)} 
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 active:bg-white/20 flex items-center justify-center text-zinc-400 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        disabled={rowCount >= 15}
                     >
                        <Plus className="w-4 h-4" />
                     </button>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
                {[
                    { id: 'Easy', icon: Shield, label: t.easy },
                    { id: 'Medium', icon: Zap, label: t.medium },
                    { id: 'Hard', icon: Skull, label: t.hard }
                ].map((level) => (
                    <button
                        key={level.id}
                        onClick={() => handleDifficultyChange(level.id as any)}
                        className={`
                            flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl border transition-all duration-300
                            ${difficulty === level.id 
                                ? 'bg-green-500/10 border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.1)]' 
                                : 'bg-white/5 border-white/5 hover:bg-white/10 text-zinc-500'}
                        `}
                    >
                        <level.icon className={`w-4 h-4 ${difficulty === level.id ? 'text-green-400' : 'text-zinc-500'}`} />
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${difficulty === level.id ? 'text-green-400' : 'text-zinc-500'}`}>
                            {level.label}
                        </span>
                    </button>
                ))}
            </div>
        </div>

        {/* 1. GRID (Top Position - Hero) */}
        <div className="mb-6 flex-1 min-h-0 flex flex-col justify-center relative">
            <div className="absolute -inset-4 bg-gradient-to-b from-green-500/5 via-transparent to-transparent opacity-50 blur-xl pointer-events-none rounded-full" />
            <Grid 
                path={currentResult?.path || []} 
                isAnalyzing={gameState === GameState.ANALYZING}
                predictionId={currentResult?.id}
                onCellClick={() => {}} // Removed manual click per previous instructions
                rowCount={rowCount}
                difficulty={difficulty}
                revealRotten={revealRotten}
            />
        </div>

        {/* 2. Controls Panel (Below Grid) */}
        <div className="space-y-4 relative z-20">
          <button 
             onClick={handlePredict}
             disabled={gameState === GameState.ANALYZING}
             className={`
                w-full group relative overflow-hidden rounded-xl p-4 transition-all duration-300
                ${gameState === GameState.ANALYZING 
                   ? 'bg-zinc-800 cursor-not-allowed opacity-80' 
                   : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 shadow-lg shadow-green-900/30 active:scale-[0.98]'}
             `}
          >
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
             <div className="relative flex items-center justify-center gap-3">
                {gameState === GameState.ANALYZING ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span className="font-bold tracking-wide text-sm text-lg">{t.calculatingPath}</span>
                    </>
                ) : (
                    <>
                        <Target className="w-5 h-5 fill-current" />
                        <span className="font-bold tracking-wide text-sm text-lg">{t.generatePrediction}</span>
                    </>
                )}
             </div>
          </button>

          <div className="grid grid-cols-2 gap-3">
              <button 
                  onClick={handleWin}
                  className="glass-panel p-3 rounded-xl border border-green-500/20 hover:bg-green-500/10 active:bg-green-500/20 transition-all flex flex-col items-start gap-1 group relative overflow-hidden"
              >
                  <div className="absolute right-2 top-2 p-1.5 rounded-full bg-green-500/10 text-green-500 group-hover:bg-green-500 group-hover:text-black transition-all">
                      <Check className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">{t.winStreak}</span>
                  <span className="text-2xl font-bold text-green-500 group-hover:scale-110 transition-transform origin-left">{winStreak}</span>
              </button>

              <button 
                  onClick={handleLoss}
                  className="glass-panel p-3 rounded-xl border border-red-500/20 hover:bg-red-500/10 active:bg-red-500/20 transition-all flex flex-col items-start gap-1 group relative overflow-hidden"
              >
                  <div className="absolute right-2 top-2 p-1.5 rounded-full bg-red-500/10 text-red-500 group-hover:bg-red-500 group-hover:text-black transition-all">
                      <X className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">{t.lossStreak}</span>
                  <span className="text-2xl font-bold text-red-500 group-hover:scale-110 transition-transform origin-left">{lossStreak}</span>
              </button>
          </div>

          {currentResult && (
              <button
                  onClick={toggleReveal}
                  className={`
                    w-full py-3 rounded-xl border font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2
                    ${revealRotten 
                        ? 'bg-red-900/20 border-red-500/30 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.15)]' 
                        : 'bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'}
                  `}
              >
                  {revealRotten ? (
                      <>
                        <EyeOff className="w-4 h-4" />
                        {t.hideRotten}
                      </>
                  ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        {t.revealRotten}
                      </>
                  )}
              </button>
          )}

          <div className="grid grid-cols-2 gap-3">
             <div className="glass-panel p-3 rounded-xl flex flex-col gap-1 border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-10">
                    <Activity className="w-8 h-8 text-green-500" />
                </div>
                <span className="text-zinc-500 text-[10px] uppercase tracking-wider font-bold">{t.confidence}</span>
                <div className="flex items-end gap-1.5 z-10">
                    <span className="text-2xl font-bold text-white tracking-tight">
                        {currentResult ? `${currentResult.confidence}%` : '--'}
                    </span>
                </div>
             </div>
             
             <div 
                onClick={openAnalysis}
                className={`glass-panel p-3 rounded-xl flex flex-col gap-1 border border-white/5 relative overflow-hidden transition-all duration-300 group
                    ${(currentResult || gameState === GameState.ANALYZING) ? 'cursor-pointer hover:bg-white/5 hover:border-white/10' : 'opacity-50 cursor-default'}
                `}
             >
                <div className="flex items-center justify-between">
                    <span className="text-zinc-500 text-[10px] uppercase tracking-wider font-bold flex items-center gap-1.5">
                        <Terminal className="w-3 h-3" />
                        {t.analysisLog}
                    </span>
                    <Maximize2 className="w-3 h-3 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                </div>
                <p className="text-[10px] text-zinc-300 font-mono leading-tight mt-1 line-clamp-2 min-h-[1.5em]">
                   {gameState === GameState.ANALYZING 
                     ? <span className="animate-pulse text-green-400">{t.processingMatrix}</span> 
                     : currentResult 
                        ? currentResult.analysis
                        : t.systemIdle
                   }
                </p>
             </div>
          </div>
          
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-yellow-500/5 border border-yellow-500/5 text-yellow-600/60 text-[10px]">
            <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
            <p>Predictions are based on probabilistic models and do not guarantee results. Use responsibly.</p>
          </div>
        </div>

        {/* 3. Toggle History (Bottom) */}
        <div className="pt-4 mt-auto">
            <button 
                onClick={() => {
                    playSound('click');
                    setShowHistory(!showHistory);
                }}
                className="flex items-center justify-center w-full gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-600 hover:text-zinc-400 transition-colors py-3"
            >
                <History className="w-3 h-3" />
                {showHistory ? 'Hide Recent History' : 'Show Recent History'}
            </button>

            {showHistory && (
                <div className="mt-2 space-y-2 animate-in fade-in slide-in-from-bottom-2 pb-4">
                    {history.length === 0 ? (
                        <div className="text-center py-4 text-zinc-700 text-[10px] italic border border-dashed border-zinc-800 rounded-lg">
                            No prediction history yet.
                        </div>
                    ) : (
                        history.map((h) => (
                            <div key={h.id} className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900/80 border border-white/5 hover:border-white/10 transition-colors">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-zinc-500 font-mono">
                                        {new Date(h.timestamp).toLocaleTimeString()}
                                    </span>
                                    <span className="text-[10px] text-zinc-400">
                                        Path Length: {h.path.length}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-green-500">{h.confidence}%</span>
                                    <ChevronRight className="w-3 h-3 text-zinc-700" />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>

        {/* Analysis Detail Modal */}
        {isAnalysisOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="w-full max-w-lg bg-[#09090b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5">
                        <div className="flex items-center gap-2">
                            <Terminal className="w-4 h-4 text-green-500" />
                            <h3 className="text-sm font-bold text-white tracking-wide">AI ANALYSIS PROTOCOL</h3>
                        </div>
                        <button onClick={closeAnalysis} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                            <X className="w-5 h-5 text-zinc-400" />
                        </button>
                    </div>
                    
                    <div className="p-6 font-mono text-sm leading-relaxed text-zinc-300 min-h-[200px] max-h-[60vh] overflow-y-auto bg-[#0c0c0e]">
                        {gameState === GameState.ANALYZING ? (
                            <div className="flex flex-col items-center justify-center h-full gap-3 text-green-500">
                                <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                <span className="animate-pulse">{t.decryptingPattern}</span>
                            </div>
                        ) : currentResult ? (
                             <div className="space-y-4">
                                <div className="flex flex-wrap gap-3 text-xs text-zinc-500 border-b border-dashed border-zinc-800 pb-4">
                                    <div className="flex flex-col">
                                        <span className="uppercase text-[10px] font-bold tracking-wider text-zinc-600">Session ID</span>
                                        <span className="font-mono text-zinc-400">{currentResult.id.split('-')[0]}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="uppercase text-[10px] font-bold tracking-wider text-zinc-600">Timestamp</span>
                                        <span className="font-mono text-zinc-400">{new Date(currentResult.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="uppercase text-[10px] font-bold tracking-wider text-zinc-600">{t.confidence}</span>
                                        <span className="font-mono text-green-400">{currentResult.confidence}%</span>
                                    </div>
                                </div>
                                
                                <div className="bg-green-900/5 border border-green-900/20 p-4 rounded-lg">
                                    <p className="text-green-100/90 leading-7">
                                        <span className="text-green-500 font-bold mr-2">›</span>
                                        {currentResult.analysis}
                                    </p>
                                </div>

                                <div className="space-y-1 pt-2">
                                    <span className="uppercase text-[10px] font-bold tracking-wider text-zinc-600">Path Sequence Vector</span>
                                    <div className="flex flex-wrap gap-1">
                                        {currentResult.path.map((col, i) => (
                                            <span key={i} className="px-1.5 py-0.5 bg-zinc-800 rounded text-xs font-mono text-zinc-400">
                                                R{i+1}:{col+1}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                             </div>
                        ) : (
                             <div className="flex flex-col items-center justify-center h-full text-zinc-600 gap-2">
                                <Terminal className="w-8 h-8 opacity-20" />
                                <p>System idle. Initiate prediction to generate analysis.</p>
                             </div>
                        )}
                    </div>
                    
                    <div className="p-3 border-t border-white/5 bg-white/5 flex justify-end">
                        <button onClick={closeAnalysis} className="px-4 py-2 text-xs font-bold uppercase bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors">
                            {t.closeConsole}
                        </button>
                    </div>
                </div>
            </div>
      )}
    </div>
  );
};