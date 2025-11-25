import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bomb, Diamond, RotateCcw, Target, Shield, Skull, Clock, MapPin, Key, Terminal, Settings2, Sparkles, Activity, Crosshair } from 'lucide-react';
import { generateMinesPrediction } from '../services/gemini';
import { playSound } from '../services/audio';
import { GameState, MinesPredictionResult, AccessKey, Language } from '../types';
import { translations } from '../translations';

const MotionDiv = motion.div as any;

interface MinesGameProps {
    onBack: () => void;
    accessKeyData: AccessKey | null;
    language: Language;
}

export const MinesGame: React.FC<MinesGameProps> = ({ onBack, accessKeyData, language }) => {
    const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
    const [mineCount, setMineCount] = useState(3);
    const [prediction, setPrediction] = useState<MinesPredictionResult | null>(null);
    const [userRegion, setUserRegion] = useState('Unknown');
    const t = translations[language];

    useEffect(() => {
        try {
            const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const regionName = timeZone.split('/')[1] || timeZone;
            setUserRegion(regionName.replace(/_/g, ' '));
        } catch (e) { setUserRegion('Global'); }
    }, []);

    const handlePredict = async () => {
        if (gameState === GameState.ANALYZING) return;
        playSound('predict');
        setGameState(GameState.ANALYZING);
        setPrediction(null);

        // Artificial delay for professional feel
        await new Promise(r => setTimeout(r, 2000));

        // Use the Gemini service to predict ALL safe spots (25 - mineCount)
        const result = await generateMinesPrediction(mineCount);
        
        setPrediction(result);
        setGameState(GameState.PREDICTED);
        playSound('success');
    };

    const handleMineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value);
        setMineCount(val);
        if (gameState !== GameState.IDLE) {
            setGameState(GameState.IDLE);
            setPrediction(null);
        }
    };
    
    // Total cells in the grid
    const cells = Array.from({ length: 25 }, (_, i) => i);
    const safeSpotsCount = 25 - mineCount;

    return (
        <div className="flex flex-col h-full relative pt-2">
            
            {/* Top Info Bar */}
            <div className="flex justify-center mb-6">
                <div className="bg-[#151518]/90 backdrop-blur border border-white/5 rounded-full px-5 py-2 flex items-center gap-6 shadow-xl z-50">
                    <div className="flex flex-col items-center leading-none">
                        <div className="flex items-center gap-1.5 mb-1">
                            <Clock className="w-3 h-3 text-blue-500" />
                            <span className="text-[10px] font-bold text-blue-400 tracking-wider">
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
            <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex flex-col">
                    <h1 className="text-3xl font-black text-white leading-none tracking-tight flex items-center gap-2">
                        MINES <span className="text-blue-500">PRO</span>
                    </h1>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] mt-1">{t.gridPattern}</span>
                </div>
                <button 
                    onClick={onBack}
                    className="px-4 py-2 rounded-lg bg-zinc-900 border border-white/5 text-xs font-bold text-zinc-400 hover:text-white transition-all uppercase tracking-wider hover:bg-zinc-800"
                >
                    {t.back}
                </button>
            </div>

            {/* Advanced Controls */}
            <div className="bg-[#121214] p-5 rounded-2xl border border-white/5 mb-4 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Settings2 className="w-16 h-16 text-white" />
                </div>
                
                <div className="relative z-10 space-y-5">
                    {/* Mines Count Slider */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Bomb className="w-4 h-4 text-blue-500" />
                                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">{t.totalMines}</span>
                            </div>
                            <div className="px-3 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono font-bold">
                                {mineCount}
                            </div>
                        </div>
                        <input 
                            type="range" 
                            min="1" 
                            max="24" 
                            value={mineCount} 
                            onChange={handleMineChange}
                            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                         <div className="flex justify-between mt-2 text-[10px] text-zinc-600 font-mono uppercase">
                             <span>1 {t.mine}</span>
                             <span>{t.prediction}: {safeSpotsCount} {t.safeSpots}</span>
                             <span>24 {t.mine}s</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid Visualization */}
            <div className="flex-1 flex flex-col items-center justify-center min-h-[320px] mb-4 relative">
                 <div className="grid grid-cols-5 gap-2.5 p-5 bg-[#0c0c0e] rounded-3xl border border-white/5 shadow-2xl relative z-10">
                    {/* Corner accents */}
                    <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-blue-500/30 rounded-tl-lg" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-blue-500/30 rounded-br-lg" />

                    {cells.map((idx) => {
                        const isSafe = prediction?.safeSpots.includes(idx);
                        return (
                            <MotionDiv
                                key={idx}
                                initial={false}
                                animate={{
                                    scale: isSafe ? 1.05 : 1,
                                    backgroundColor: isSafe ? '#172033' : '#121214',
                                    borderColor: isSafe ? 'rgba(59, 130, 246, 0.4)' : 'rgba(255, 255, 255, 0.05)',
                                    boxShadow: isSafe ? '0 0 15px rgba(59, 130, 246, 0.2)' : 'none'
                                }}
                                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl border flex items-center justify-center relative overflow-hidden transition-all duration-300`}
                            >
                                <AnimatePresence>
                                    {isSafe && (
                                        <MotionDiv
                                            initial={{ scale: 0, opacity: 0, rotate: -45 }}
                                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                            exit={{ scale: 0, opacity: 0 }}
                                            transition={{ type: "spring", bounce: 0.6, delay: 0.1 }}
                                        >
                                            <Sparkles className="w-6 h-6 text-blue-400 fill-blue-400/20 drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]" />
                                        </MotionDiv>
                                    )}
                                </AnimatePresence>
                                
                                {!isSafe && gameState === GameState.ANALYZING && (
                                    <MotionDiv 
                                        className="absolute inset-0 bg-blue-500/5"
                                        animate={{ opacity: [0, 1, 0] }}
                                        transition={{ duration: 0.8, repeat: Infinity, delay: Math.random() * 0.5 }}
                                    />
                                )}
                            </MotionDiv>
                        );
                    })}
                 </div>
            </div>

            {/* AI Analysis Section */}
            <div className="mb-4 space-y-3">
                 {/* Analysis Card */}
                 <div className="glass-panel p-4 rounded-xl border border-white/5 relative overflow-hidden min-h-[90px] flex flex-col justify-center">
                    <div className="absolute top-0 right-0 p-2 opacity-5">
                         <Terminal className="w-12 h-12 text-white" />
                    </div>
                    
                    <div className="flex items-center justify-between mb-2">
                         <div className="flex items-center gap-2">
                             <div className={`w-2 h-2 rounded-full ${gameState === GameState.ANALYZING ? 'bg-yellow-500 animate-pulse' : 'bg-blue-500'}`} />
                             <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                                 {gameState === GameState.ANALYZING ? t.scanning : t.aiAnalysis}
                             </span>
                         </div>
                         {prediction && (
                            <div className="flex items-center gap-1.5 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                                <Activity className="w-3 h-3 text-blue-400" />
                                <span className="text-xs font-bold text-blue-400">{prediction.confidence}% {t.confidence}</span>
                            </div>
                         )}
                    </div>

                    <p className="text-sm font-mono text-zinc-300 leading-relaxed line-clamp-2">
                        {gameState === GameState.ANALYZING ? (
                            <span className="text-blue-400 animate-pulse">{t.decryptingSeed}</span>
                        ) : prediction ? (
                            prediction.analysis
                        ) : (
                            <span className="text-zinc-600 italic">{t.systemIdle}</span>
                        )}
                    </p>
                 </div>
            </div>

            {/* Action Button */}
            <div className="mt-auto pb-4">
                <button 
                    onClick={handlePredict}
                    disabled={gameState === GameState.ANALYZING}
                    className={`
                    w-full group relative overflow-hidden rounded-2xl p-4 transition-all duration-300 shadow-xl
                    ${gameState === GameState.ANALYZING 
                        ? 'bg-zinc-800 cursor-not-allowed opacity-50' 
                        : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-900/20'}
                    `}
                >
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                    <div className="relative flex items-center justify-center gap-3">
                        {gameState === GameState.ANALYZING ? (
                            <>
                                <RotateCcw className="w-5 h-5 animate-spin text-white/50" />
                                <span className="font-bold tracking-widest text-sm">{t.calculatingProb}</span>
                            </>
                        ) : (
                            <>
                                <Target className="w-5 h-5 fill-current text-blue-200" />
                                <span className="font-black tracking-widest text-sm">{t.identify} {safeSpotsCount} {t.safeZones}</span>
                            </>
                        )}
                    </div>
                </button>
            </div>
        </div>
    );
};