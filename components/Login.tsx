import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Loader2, ShieldCheck, AlertCircle, Lock, Server, Globe, ChevronDown, Check, Send } from 'lucide-react';
import { verifyAccessKey } from '../services/auth';
import { playSound } from '../services/audio';
import { AccessKey, Language } from '../types';
import { translations } from '../translations';

const MotionDiv = motion.div as any;

interface LoginProps {
  onLoginSuccess: (keyData: AccessKey) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, language, onLanguageChange }) => {
  const [inputKey, setInputKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const t = translations[language];
  const [loadingText, setLoadingText] = useState(t.authenticating);
  const [keyNameFound, setKeyNameFound] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputKey.trim()) return;

    playSound('click');
    setIsLoading(true);
    setLoadingText(t.connecting);
    setKeyNameFound(null);
    setError(null);

    // Initial delay for UX
    await new Promise(r => setTimeout(r, 1500));
    setLoadingText(t.authenticating);

    const result = await verifyAccessKey(inputKey.trim());

    if (result.valid && result.data) {
        // Success State inside Loader
        setLoadingText(t.accessGranted);
        setKeyNameFound(result.data.name || 'Unknown User');
        playSound('success');
        
        // Show success state for a moment before redirecting
        await new Promise(r => setTimeout(r, 2000));
        
        localStorage.setItem('access_key_data', JSON.stringify(result.data));
        onLoginSuccess(result.data);
    } else {
        playSound('crash'); 
        setError(result.error ? result.error : t.invalidKey);
        setIsLoading(false);
        setLoadingText(t.authenticating);
    }
  };

  const languages = [
        { code: 'en', label: 'English', flag: '🇺🇸' },
        { code: 'ar', label: 'العربية', flag: '🇪🇬' },
    ];

  return (
    <MotionDiv 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col justify-center items-center w-full px-4 relative z-10"
    >
        {/* Background Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-green-500/10 blur-[100px] rounded-full pointer-events-none" />

        {/* Top Right Language Selector Dropdown */}
        <div className="absolute top-6 right-6 z-50">
             <div className="relative">
                <button 
                    onClick={() => {
                        playSound('click');
                        setIsLangMenuOpen(!isLangMenuOpen);
                    }}
                    className="flex items-center gap-2 bg-[#121214]/90 backdrop-blur-md border border-white/10 px-3 py-2 rounded-xl text-xs font-bold text-white hover:bg-white/10 hover:border-white/20 transition-all shadow-lg group"
                >
                    <Globe className="w-3.5 h-3.5 text-green-500 group-hover:rotate-12 transition-transform" />
                    <span className="uppercase tracking-wider">{language}</span>
                    <ChevronDown className={`w-3 h-3 text-zinc-500 transition-transform duration-300 ${isLangMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                    {isLangMenuOpen && (
                        <MotionDiv
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            className="absolute right-0 top-full mt-2 w-40 bg-[#121214] border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col py-1.5 z-50 ring-1 ring-black/50"
                        >
                            {languages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => {
                                        onLanguageChange(lang.code as Language);
                                        setIsLangMenuOpen(false);
                                    }}
                                    className={`
                                        flex items-center gap-3 px-4 py-2.5 text-xs font-bold transition-all text-left relative
                                        ${language === lang.code ? 'bg-green-500/10 text-green-500' : 'text-zinc-400 hover:text-white hover:bg-white/5'}
                                    `}
                                >
                                    <span className="text-sm shadow-sm">{lang.flag}</span>
                                    <span className="flex-1">{lang.label}</span>
                                    {language === lang.code && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
                                    )}
                                </button>
                            ))}
                        </MotionDiv>
                    )}
                </AnimatePresence>
             </div>
        </div>

        <MotionDiv 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full max-w-sm relative mt-10"
        >
            <div className="glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-50" />
                
                <div className="mb-8 flex flex-col items-center text-center">
                    <MotionDiv 
                        whileHover={{ scale: 1.05 }}
                        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1c1c1f] to-black border border-white/10 flex items-center justify-center mb-6 shadow-lg relative group"
                    >
                        <div className="absolute inset-0 bg-green-500/20 blur-lg group-hover:bg-green-500/30 transition-all rounded-2xl" />
                        <ShieldCheck className="w-8 h-8 text-green-500 relative z-10" />
                    </MotionDiv>
                    <h2 className="text-3xl font-black text-white tracking-tight mb-2">{t.secureLogin}</h2>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 uppercase tracking-widest bg-zinc-900/50 px-3 py-1 rounded-full border border-white/5">
                        <Server className="w-3 h-3" />
                        <span>{t.systemOnline}</span>
                    </div>
                </div>

                <form onSubmit={handleLogin} className="flex flex-col gap-5">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">{t.licenseKey}</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-green-500 transition-colors">
                                <Key className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                value={inputKey}
                                onChange={(e) => {
                                    setInputKey(e.target.value);
                                    setError(null);
                                }}
                                placeholder="XXXX-XXXX-XXXX-XXXX"
                                className="w-full bg-[#0c0c0e] border border-white/10 rounded-xl py-4 pl-11 pr-4 text-white placeholder:text-zinc-700 focus:outline-none focus:border-green-500/50 focus:ring-4 focus:ring-green-500/10 transition-all font-mono text-sm tracking-widest shadow-inner"
                                autoCapitalize="none"
                                spellCheck="false"
                            />
                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                <Lock className="w-3 h-3 text-zinc-700" />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <MotionDiv 
                            initial={{ opacity: 0, y: -10 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            className="flex items-center gap-3 text-red-400 text-xs bg-red-500/5 p-3 rounded-xl border border-red-500/10"
                        >
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span className="font-medium">{error}</span>
                        </MotionDiv>
                    )}

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isLoading || !inputKey}
                        className={`
                            w-full py-4 rounded-xl font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all shadow-lg
                            ${isLoading || !inputKey 
                                ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed border border-white/5' 
                                : 'bg-white text-black hover:bg-zinc-200 shadow-white/10'}
                        `}
                    >
                         <span>{t.authenticate}</span>
                    </motion.button>
                </form>

                <div className="mt-8 text-center space-y-4">
                    <p className="text-[10px] text-zinc-600 font-medium">
                        {t.terms}
                    </p>
                    
                    <div className="pt-4 border-t border-white/5">
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-2">
                            {t.needHelp}
                        </p>
                        <a 
                            href="https://t.me/x6_i2" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 text-xs font-bold transition-all group"
                        >
                            <Send className="w-3 h-3 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                            {t.contactDevBtn}
                        </a>
                    </div>
                </div>
            </div>
        </MotionDiv>

        {/* Full Screen Loading Overlay */}
        <AnimatePresence>
            {isLoading && (
                <MotionDiv
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-lg"
                >
                    <div className="flex flex-col items-center p-8 rounded-2xl bg-[#121214] border border-white/10 shadow-2xl min-w-[240px]">
                        <div className="relative w-16 h-16 mb-5">
                            <div className="absolute inset-0 rounded-full border-4 border-zinc-800" />
                            <div className="absolute inset-0 rounded-full border-4 border-t-green-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                {keyNameFound ? (
                                    <ShieldCheck className="w-6 h-6 text-green-500 animate-in zoom-in" />
                                ) : (
                                    <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
                                )}
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-white tracking-wider mb-1 uppercase">{keyNameFound ? t.welcome : t.processing}</h3>
                        <p className={`text-xs font-mono transition-colors duration-300 ${keyNameFound ? 'text-green-500 font-bold' : 'text-zinc-500 animate-pulse'}`}>
                            {loadingText}
                        </p>
                        
                        {/* Display Key Name at Bottom of Dialog */}
                        <AnimatePresence>
                            {keyNameFound && (
                                <MotionDiv 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-4 pt-4 border-t border-white/10 w-full text-center"
                                >
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">{t.keyHolder}</span>
                                    <span className="text-sm font-bold text-white">{keyNameFound}</span>
                                </MotionDiv>
                            )}
                        </AnimatePresence>
                    </div>
                </MotionDiv>
            )}
        </AnimatePresence>
    </MotionDiv>
  );
};
