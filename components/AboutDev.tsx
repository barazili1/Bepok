import React from 'react';
import { motion } from 'framer-motion';
import { Code, Send, ChevronLeft, Terminal, Cpu, Globe, Shield, Zap, Database, Award, UserCheck } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

interface AboutDevProps {
    onBack: () => void;
    language: Language;
}

export const AboutDev: React.FC<AboutDevProps> = ({ onBack, language }) => {
    const t = translations[language];

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 flex flex-col p-4 pb-24 h-full overflow-y-auto"
        >
            <div className="flex items-center gap-3 mb-8">
                <button 
                    onClick={onBack}
                    className="p-2.5 rounded-xl bg-zinc-900/50 border border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors backdrop-blur-sm"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <h1 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                    <Code className="w-5 h-5 text-blue-500" />
                    {t.systemArchitect}
                </h1>
            </div>

            <div className="flex-1 flex flex-col space-y-6">
                
                {/* ID Card Style Profile */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-blue-500/5 rounded-3xl blur-xl group-hover:bg-blue-500/10 transition-colors" />
                    <div className="relative glass-panel rounded-3xl border border-white/10 p-6 overflow-hidden">
                        
                        {/* Header Background */}
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-blue-500/10 to-transparent opacity-50" />
                        
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="relative w-28 h-28 mb-4">
                                <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full animate-pulse" />
                                <div className="w-full h-full rounded-2xl bg-[#0c0c0e] border border-blue-500/30 flex items-center justify-center relative overflow-hidden shadow-2xl">
                                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                                    <Terminal className="w-12 h-12 text-blue-400" />
                                    
                                    {/* Glitch Effect Lines */}
                                    <div className="absolute top-1/4 w-full h-[1px] bg-blue-500/50 animate-pulse" />
                                    <div className="absolute bottom-1/3 w-full h-[1px] bg-blue-500/30" />
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded border border-[#09090b] shadow-lg flex items-center gap-1">
                                    <UserCheck className="w-3 h-3" /> VERIFIED
                                </div>
                            </div>

                            <h2 className="text-3xl font-black text-white tracking-tight mb-1">X6_i2</h2>
                            <p className="text-xs font-mono text-blue-400 tracking-widest uppercase mb-4">{t.leadDev}</p>
                            
                            <div className="flex flex-wrap justify-center gap-2 mb-2">
                                <span className="px-2 py-1 rounded bg-zinc-900 border border-white/5 text-[9px] text-zinc-400 font-bold uppercase">Full Stack</span>
                                <span className="px-2 py-1 rounded bg-zinc-900 border border-white/5 text-[9px] text-zinc-400 font-bold uppercase">Algorithm</span>
                                <span className="px-2 py-1 rounded bg-zinc-900 border border-white/5 text-[9px] text-zinc-400 font-bold uppercase">Security</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats / Skills Matrix */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#121214] p-4 rounded-2xl border border-white/5 flex flex-col gap-3 group hover:border-blue-500/20 transition-colors">
                        <div className="p-2 bg-blue-500/10 rounded-lg w-fit">
                            <Cpu className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <span className="text-2xl font-black text-white">99.8%</span>
                            <span className="text-[9px] font-bold uppercase text-zinc-500 block">{t.uptime}</span>
                        </div>
                    </div>

                    <div className="bg-[#121214] p-4 rounded-2xl border border-white/5 flex flex-col gap-3 group hover:border-green-500/20 transition-colors">
                        <div className="p-2 bg-green-500/10 rounded-lg w-fit">
                            <Shield className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                            <span className="text-2xl font-black text-white">SECURE</span>
                            <span className="text-[9px] font-bold uppercase text-zinc-500 block">{t.encryption}</span>
                        </div>
                    </div>
                </div>

                <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4">
                     <h3 className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">{t.coreCompetencies}</h3>
                     
                     <div className="space-y-3">
                        <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-bold text-zinc-300">
                                <span>{t.neuralNet}</span>
                                <span>98%</span>
                            </div>
                            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 w-[98%] rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-bold text-zinc-300">
                                <span>{t.realtimeData}</span>
                                <span>95%</span>
                            </div>
                            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500 w-[95%] rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-bold text-zinc-300">
                                <span>{t.predictiveMod}</span>
                                <span>92%</span>
                            </div>
                            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 w-[92%] rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                            </div>
                        </div>
                     </div>
                </div>

                <div className="mt-auto pt-4">
                    <a 
                        href="https://t.me/x6_i2" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group w-full relative overflow-hidden rounded-xl p-0.5 bg-gradient-to-r from-blue-600 to-cyan-500 shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all block"
                    >
                        <div className="absolute inset-0 bg-white/20 group-hover:opacity-0 transition-opacity" />
                        <div className="relative bg-[#09090b] rounded-[10px] p-4 flex items-center justify-between group-hover:bg-transparent transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-white/20 transition-colors">
                                    <Send className="w-5 h-5 text-blue-400 group-hover:text-white" />
                                </div>
                                <div className="flex flex-col text-left">
                                    <span className="font-bold text-white text-sm tracking-wide">{t.contactDirect}</span>
                                    <span className="text-[10px] text-zinc-400 group-hover:text-blue-100">{t.viaTelegram}</span>
                                </div>
                            </div>
                            <ChevronLeft className="w-5 h-5 text-zinc-600 rotate-180 group-hover:text-white transition-colors" />
                        </div>
                    </a>
                </div>

                <div className="flex items-center justify-center gap-2 opacity-30 pb-4">
                    <Globe className="w-3 h-3 text-zinc-500" />
                    <span className="text-[9px] text-zinc-500 font-mono uppercase">Global Systems Inc. © 2025</span>
                </div>
            </div>
        </motion.div>
    );
};