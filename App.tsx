import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppleGame } from './components/AppleGame';
import { CrashGame } from './components/CrashGame';
import { MinesGame } from './components/MinesGame';
import { Login } from './components/Login';
import { Profile } from './components/Profile';
import { Notifications } from './components/Notifications';
import { AboutDev } from './components/AboutDev';
import { UsersOnline } from './components/UsersOnline';
import { ViewState, AccessKey, Notification, Language } from './types';
import { LayoutGrid, Rocket, Bomb, Cpu, Zap, Star, User, Bell, Wallet, ChevronRight, BarChart3, Radio, Home, Activity, Server, Users, Globe, X, Database, Ghost, Skull, Crown, Bot, Smile, Shield, Scan, Binary, Power, Terminal } from 'lucide-react';
import { playSound } from './services/audio';
import { fetchNotifications } from './services/database';
import { verifyAccessKey } from './services/auth';
import { translations } from './translations';

const MotionDiv = motion.div as any;
const MotionH1 = motion.h1 as any;

export const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('SPLASH');
  const [accessKeyData, setAccessKeyData] = useState<AccessKey | null>(null);
  
  // Language State - Default to English
  const [language, setLanguage] = useState<Language>(() => {
      try {
          return (localStorage.getItem('app_language') as Language) || 'en';
      } catch { return 'en'; }
  });

  const changeLanguage = (lang: Language) => {
      setLanguage(lang);
      localStorage.setItem('app_language', lang);
      playSound('click');
  };

  const t = translations[language];

  // Font class based on language
  const getFontClass = () => {
      switch(language) {
          case 'ar': return 'font-ar';
          default: return 'font-en';
      }
  };
  
  // Avatar State
  const [userAvatarId, setUserAvatarId] = useState<number>(() => {
      try {
          return parseInt(localStorage.getItem('user_avatar_id') || '0', 10);
      } catch { return 0; }
  });

  const handleAvatarChange = (id: number) => {
      setUserAvatarId(id);
      localStorage.setItem('user_avatar_id', id.toString());
      playSound('click');
  };

  const getAvatarIcon = (id: number) => {
      switch(id) {
          case 1: return Ghost;
          case 2: return Skull;
          case 3: return Crown;
          case 4: return Zap;
          case 5: return Bot;
          case 6: return Smile;
          case 7: return Shield;
          default: return User;
      }
  };
  
  const CurrentAvatar = getAvatarIcon(userAvatarId);

  // Dashboard Realism State
  const [metrics, setMetrics] = useState({
      luck: 65,
      signal: 82,
      volatility: 35,
      users: 1240,
      serverLoad: 4829103921 // Initial 10-digit number
  });

  // Notification System State
  const [notifications, setNotifications] = useState<Notification[]>([
      {
          id: '1',
          title: 'System Update',
          message: 'AI Model v2.5 Flash is now active for all regions. Latency reduced by 40%.',
          timestamp: Date.now() - 1000 * 60 * 30,
          type: 'success',
          read: false
      },
      {
          id: '2',
          title: 'Maintenance Alert',
          message: 'Scheduled server maintenance in 48 hours for database optimization. Short downtime expected.',
          timestamp: Date.now() - 1000 * 60 * 60 * 5,
          type: 'warning',
          read: true
      },
      {
          id: '3',
          title: 'Welcome',
          message: 'Welcome to FortuneAI. Key verification successful. All modules are ready for use.',
          timestamp: Date.now() - 1000 * 60 * 60 * 24,
          type: 'info',
          read: true
      }
  ]);
  const [latestToast, setLatestToast] = useState<Notification | null>(null);

  // Dynamic Dashboard Data Simulation
  useEffect(() => {
    const interval = setInterval(() => {
        setMetrics(prev => ({
            luck: Math.min(98, Math.max(15, prev.luck + (Math.random() * 20 - 10))),
            signal: Math.min(99, Math.max(40, prev.signal + (Math.random() * 10 - 5))),
            volatility: Math.min(90, Math.max(10, prev.volatility + (Math.random() * 30 - 15))),
            users: Math.floor(prev.users + (Math.random() * 12 - 5)),
            // Fluctuate 10-digit number slightly
            serverLoad: Math.floor(prev.serverLoad + (Math.random() * 50000 - 25000))
        }));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Automatic Push Notification Simulation (Local)
  useEffect(() => {
    const interval = setInterval(() => {
        const types: ('info' | 'success' | 'warning')[] = ['info', 'success', 'info', 'warning'];
        const randomType = types[Math.floor(Math.random() * types.length)];
        const titles = ["Market Update", "Security Alert", "Pattern Detected", "System Opt", "Bonus Event"];
        const messages = [
            "Unexpected volatility spike detected in Crash market sector.",
            "New high-probability safe path identified for Apple grid config #4.",
            "Mines distribution algorithm seed updated for increased fairness.",
            "Server load optimized for your specific region gateway.",
            "Flash event: +10% prediction accuracy for next 15 minutes.",
            "Database sync complete. Real-time odds updated.",
            "Bot activity detected and filtered from analytics.",
            "Signal strength increased to 98% for current session."
        ];
        
        const randomTitle = titles[Math.floor(Math.random() * titles.length)];
        const randomMsg = messages[Math.floor(Math.random() * messages.length)];

        const newNotif: Notification = {
            id: crypto.randomUUID(),
            title: randomTitle,
            message: randomMsg,
            timestamp: Date.now(),
            type: randomType,
            read: false
        };

        setNotifications(prev => [newNotif, ...prev]);
        
        // Show Toast if not on notifications page
        if (view !== 'NOTIFICATIONS') {
             setLatestToast(newNotif);
             playSound('toggle');
             setTimeout(() => setLatestToast(null), 4000);
        }
        
    }, 120000); // Push every 2 minutes (120,000 ms)

    return () => clearInterval(interval);
  }, [view]);

  // Firebase Notification Integration
  const processedFirebaseIds = useRef<Set<string>>(new Set());
  const isFirstFetch = useRef(true);

  useEffect(() => {
    const pollFirebaseNotifications = async () => {
        const notes = await fetchNotifications();
        if (notes) {
            const newNotes: Notification[] = [];
            
            Object.entries(notes).forEach(([key, note]: [string, any]) => {
                if (!processedFirebaseIds.current.has(key)) {
                    processedFirebaseIds.current.add(key);
                    
                    newNotes.push({
                        id: key,
                        title: note.title || 'Admin Message',
                        message: note.message || 'New update available',
                        timestamp: note.timestamp || Date.now(),
                        type: note.type || 'info',
                        sender: note.sender,
                        read: false
                    });
                }
            });

            if (newNotes.length > 0) {
                // Add to state
                setNotifications(prev => [...newNotes, ...prev]);

                // Toast only if not the very first load (prevents spamming on app open)
                if (!isFirstFetch.current && view !== 'NOTIFICATIONS') {
                    // Show the latest one
                    setLatestToast(newNotes[newNotes.length - 1]);
                    playSound('toggle');
                    setTimeout(() => setLatestToast(null), 5000);
                }
            }
            isFirstFetch.current = false;
        }
    };

    const interval = setInterval(pollFirebaseNotifications, 10000); // Poll every 10 seconds
    pollFirebaseNotifications(); // Initial call

    return () => clearInterval(interval);
  }, [view]);

  const handleMarkRead = (id: string) => {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      playSound('click');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    // Enhanced Splash Timer
    if (view === 'SPLASH') {
        const timer = setTimeout(() => {
            try {
                const savedData = localStorage.getItem('access_key_data');
                if (savedData) {
                    const parsed = JSON.parse(savedData);
                    setAccessKeyData(parsed);
                    setView('SELECTION');
                } else {
                    setView('LOGIN');
                }
            } catch (e) {
                setView('LOGIN');
            }
        }, 6000); // Increased slightly for the new animation
        return () => clearTimeout(timer);
    }
  }, [view]);

  const handleLoginSuccess = (data: AccessKey) => {
      setAccessKeyData(data);
      setView('SELECTION');
  };

  const handleSignOut = () => {
      localStorage.removeItem('access_key_data');
      setAccessKeyData(null);
      setView('LOGIN');
  };

  // Background Key Validation Logic
  useEffect(() => {
    if (!accessKeyData) return;

    const checkKeyStatus = async () => {
        // Perform verification against Firebase
        const result = await verifyAccessKey(accessKeyData.key);
        
        if (!result.valid) {
            // Differentiate between network error and actual key invalidation
            // In services/auth.ts, network error returns "Connection failed..."
            const isNetworkError = result.error?.includes("Connection");
            
            if (!isNetworkError) {
                // Key is invalid or disabled -> Force Logout
                handleSignOut();
                
                // Show a toast to explain why
                const msg = result.error === "Key has been disabled." 
                    ? (language === 'ar' ? "تم تعطيل المفتاح الخاص بك" : "Your access key has been disabled")
                    : (language === 'ar' ? "المفتاح غير صالح أو انتهت صلاحيته" : "Access key invalid or expired");

                setLatestToast({
                    id: 'session-terminated',
                    title: t.notif_securityAlert,
                    message: msg,
                    timestamp: Date.now(),
                    type: 'warning',
                    read: false
                });
                
                playSound('crash');
            }
        }
    };

    // Check every 10 seconds
    const interval = setInterval(checkKeyStatus, 10000);
    return () => clearInterval(interval);
  }, [accessKeyData, language, t]);

  const selectGame = (game: 'APPLE' | 'CRASH' | 'MINES') => {
      playSound('click');
      setView(game);
  };

  // Determine if we should show the bottom navigation bar
  const showBottomNav = ['SELECTION', 'PROFILE', 'NOTIFICATIONS', 'ABOUT_DEV', 'USERS_ONLINE'].includes(view);

  // Render content based on view state
  const renderContent = () => {
    switch (view) {
        case 'PROFILE':
            return <Profile accessKeyData={accessKeyData} onSignOut={handleSignOut} onNavigate={setView} currentAvatarId={userAvatarId} onAvatarChange={handleAvatarChange} language={language} onLanguageChange={changeLanguage} />;
        case 'ABOUT_DEV':
            return <AboutDev onBack={() => setView('PROFILE')} language={language} />;
        case 'NOTIFICATIONS':
            return <Notifications notifications={notifications} onMarkRead={handleMarkRead} language={language} />;
        case 'USERS_ONLINE':
            return <UsersOnline onBack={() => setView('SELECTION')} language={language} onLanguageChange={changeLanguage} />;
        case 'APPLE':
            return <AppleGame onBack={() => { playSound('click'); setView('SELECTION'); }} accessKeyData={accessKeyData} language={language} />;
        case 'CRASH':
            return <CrashGame onBack={() => { playSound('click'); setView('SELECTION'); }} accessKeyData={accessKeyData} language={language} />;
        case 'MINES':
            return <MinesGame onBack={() => { playSound('click'); setView('SELECTION'); }} accessKeyData={accessKeyData} language={language} />;
        case 'SELECTION':
        default:
            return (
                <MotionDiv
                    key="selection"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex-1 flex flex-col pb-24 overflow-y-auto"
                >
                    {/* Dashboard Header */}
                    <header className="flex items-center justify-between mb-4 pt-4 px-4">
                        <div 
                            className="flex items-center gap-3 cursor-pointer group"
                            onClick={() => { playSound('click'); setView('PROFILE'); }}
                        >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 flex items-center justify-center shadow-lg relative group-hover:border-green-500/50 transition-colors">
                                <CurrentAvatar className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" />
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#09090b] rounded-full"></div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider group-hover:text-green-500 transition-colors">{t.welcomeBack}</span>
                                <span className="text-sm font-bold text-white">{accessKeyData?.name || 'Commander'}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                             <div 
                                className="relative p-2 rounded-full bg-zinc-900 border border-white/5 hover:bg-zinc-800 cursor-pointer transition-all active:scale-95"
                                onClick={() => { playSound('click'); setView('NOTIFICATIONS'); }}
                             >
                                 <Bell className="w-5 h-5 text-zinc-400" />
                                 {unreadCount > 0 && (
                                     <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-[#09090b] flex items-center justify-center">
                                         <span className="text-[8px] font-bold text-white">{unreadCount > 9 ? '!' : unreadCount}</span>
                                     </div>
                                 )}
                             </div>
                        </div>
                    </header>

                    {/* LIVE METRICS WIDGETS */}
                    <div className="px-4 mb-4 grid grid-cols-2 gap-3">
                         <div 
                            onClick={() => { playSound('click'); setView('USERS_ONLINE'); }}
                            className="bg-[#121214] border border-white/5 p-3 rounded-2xl flex flex-col gap-2 relative overflow-hidden group cursor-pointer hover:bg-white/5 transition-colors"
                        >
                             <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-1.5 text-zinc-500">
                                     <Users className="w-3 h-3" />
                                     <span className="text-[9px] font-bold uppercase tracking-wider">{t.onlineUsers}</span>
                                 </div>
                                 <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                             </div>
                             <div className="text-xl font-black text-white tabular-nums tracking-tight">
                                 {metrics.users.toLocaleString()}
                             </div>
                             {/* Mini sparkline */}
                             <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden mt-auto">
                                 <MotionDiv 
                                    className="h-full bg-green-500" 
                                    animate={{ width: `${Math.random() * 40 + 40}%` }}
                                    transition={{ duration: 2 }}
                                 />
                             </div>
                         </div>
                         
                         <div className="bg-[#121214] border border-white/5 p-3 rounded-2xl flex flex-col gap-1 relative overflow-hidden group">
                             <div className="flex items-center justify-between mb-1">
                                 <div className="flex items-center gap-1.5 text-zinc-500">
                                     <Database className="w-3 h-3" />
                                     <span className="text-[9px] font-bold uppercase tracking-wider">{t.serverHash}</span>
                                 </div>
                                 <Activity className="w-3 h-3 text-blue-500 animate-pulse" />
                             </div>
                             
                             <div className="text-sm font-black text-white tabular-nums tracking-tighter font-mono bg-zinc-900/50 p-1 rounded border border-white/5 text-center">
                                 {metrics.serverLoad}
                             </div>
                             
                             <div className="text-[8px] text-zinc-500 font-mono mt-auto text-right w-full">
                                 OPS/SEC
                             </div>
                         </div>
                    </div>

                    {/* Luck Analysis Dashboard */}
                    <div className="mb-6 mx-4 p-5 rounded-3xl bg-gradient-to-b from-[#151518] to-[#0c0c0e] border border-white/5 shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />
                        
                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <h2 className="text-sm font-bold text-white flex items-center gap-2">
                                <Activity className="w-4 h-4 text-purple-500" />
                                {t.liveAnalytics}
                            </h2>
                            <div className="flex items-center gap-1.5 bg-green-500/10 px-2 py-1 rounded border border-green-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-[9px] font-bold text-green-500 uppercase tracking-wide">
                                    {t.systemActive}
                                </span>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3 mb-2 relative z-10 h-32">
                             <div className="flex flex-col gap-2 h-full">
                                 <div className="flex-1 bg-zinc-900/50 rounded-xl relative overflow-hidden flex items-end p-1.5 border border-white/5">
                                     <MotionDiv 
                                        animate={{ height: `${metrics.luck}%` }} 
                                        transition={{ type: "spring", bounce: 0, duration: 1.5 }}
                                        className="w-full bg-gradient-to-t from-purple-500/10 to-purple-500/40 border-t border-purple-500/50 rounded-lg relative group"
                                     >
                                        <div className="absolute inset-x-0 top-0 h-[1px] bg-purple-400 shadow-[0_0_15px_#a855f7]" />
                                     </MotionDiv>
                                 </div>
                                 <div className="flex flex-col items-center">
                                     <span className="text-[9px] text-zinc-500 font-bold uppercase">{t.luck}</span>
                                     <span className="text-[10px] font-mono text-purple-400">{Math.round(metrics.luck)}%</span>
                                 </div>
                             </div>
                             
                             <div className="flex flex-col gap-2 h-full">
                                 <div className="flex-1 bg-zinc-900/50 rounded-xl relative overflow-hidden flex items-end p-1.5 border border-white/5">
                                     <MotionDiv 
                                        animate={{ height: `${metrics.signal}%` }} 
                                        transition={{ type: "spring", bounce: 0, duration: 1.5 }}
                                        className="w-full bg-gradient-to-t from-green-500/10 to-green-500/40 border-t border-green-500/50 rounded-lg relative"
                                     >
                                         <div className="absolute inset-x-0 top-0 h-[1px] bg-green-400 shadow-[0_0_15px_#22c55e]" />
                                     </MotionDiv>
                                 </div>
                                 <div className="flex flex-col items-center">
                                     <span className="text-[9px] text-zinc-500 font-bold uppercase">{t.signal}</span>
                                     <span className="text-[10px] font-mono text-green-400">{Math.round(metrics.signal)}%</span>
                                 </div>
                             </div>
                             
                             <div className="flex flex-col gap-2 h-full">
                                 <div className="flex-1 bg-zinc-900/50 rounded-xl relative overflow-hidden flex items-end p-1.5 border border-white/5">
                                     <MotionDiv 
                                        animate={{ height: `${metrics.volatility}%` }} 
                                        transition={{ type: "spring", bounce: 0, duration: 1.5 }}
                                        className="w-full bg-gradient-to-t from-blue-500/10 to-blue-500/40 border-t border-blue-500/50 rounded-lg relative"
                                     >
                                         <div className="absolute inset-x-0 top-0 h-[1px] bg-blue-400 shadow-[0_0_15px_#3b82f6]" />
                                     </MotionDiv>
                                 </div>
                                 <div className="flex flex-col items-center">
                                     <span className="text-[9px] text-zinc-500 font-bold uppercase">{t.volatility}</span>
                                     <span className="text-[10px] font-mono text-blue-400">{Math.round(metrics.volatility)}%</span>
                                 </div>
                             </div>
                        </div>
                    </div>

                    {/* Games Grid */}
                    <div className="flex-1 space-y-4 px-4 pb-4">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="text-sm font-bold text-white tracking-wide">{t.availableModules}</h3>
                            <div className="flex items-center gap-1.5">
                                <Radio className="w-3 h-3 text-red-500 animate-pulse" />
                                <span className="text-[10px] font-mono text-zinc-500">{t.liveFeed}</span>
                            </div>
                        </div>

                        <div className="grid gap-4">
                            <button 
                                onClick={() => selectGame('APPLE')}
                                className="group relative h-24 rounded-2xl bg-[#121214] border border-white/5 hover:border-green-500/30 transition-all duration-300 overflow-hidden shadow-lg"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-green-900/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                
                                <div className="relative h-full flex items-center px-5 gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-zinc-900/80 border border-white/5 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
                                        <LayoutGrid className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <h4 className="font-bold text-white text-base">{t.appleFortune}</h4>
                                        <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{t.patternRec}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                         <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-white/5 text-[9px] font-bold text-green-500 uppercase">{t.online}</span>
                                         <ChevronRight className="w-5 h-5 text-zinc-700 group-hover:text-white transition-colors" />
                                    </div>
                                </div>
                            </button>

                            <button 
                                onClick={() => selectGame('CRASH')}
                                className="group relative h-24 rounded-2xl bg-[#121214] border border-white/5 hover:border-orange-500/30 transition-all duration-300 overflow-hidden shadow-lg"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-orange-900/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                
                                <div className="relative h-full flex items-center px-5 gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-zinc-900/80 border border-white/5 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                                        <Rocket className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <h4 className="font-bold text-white text-base">{t.crashPredictor}</h4>
                                        <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{t.trendAnalysis}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                         <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-white/5 text-[9px] font-bold text-orange-500 uppercase">{t.hot}</span>
                                         <ChevronRight className="w-5 h-5 text-zinc-700 group-hover:text-white transition-colors" />
                                    </div>
                                </div>
                            </button>

                            <button 
                                onClick={() => selectGame('MINES')}
                                className="group relative h-24 rounded-2xl bg-[#121214] border border-white/5 hover:border-blue-500/30 transition-all duration-300 overflow-hidden shadow-lg"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                
                                <div className="relative h-full flex items-center px-5 gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-zinc-900/80 border border-white/5 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                                        <Bomb className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <h4 className="font-bold text-white text-base">{t.minesAi}</h4>
                                        <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{t.safetyGrid}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                         <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-white/5 text-[9px] font-bold text-blue-500 uppercase">{t.stable}</span>
                                         <ChevronRight className="w-5 h-5 text-zinc-700 group-hover:text-white transition-colors" />
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                </MotionDiv>
            );
    }
  };

  return (
    <div className={`min-h-screen bg-[#09090b] text-white overflow-x-hidden selection:bg-green-500/30 ${getFontClass()}`}>
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-zinc-900 via-[#0c0c0e] to-transparent opacity-60" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
      </div>

      <div className="max-w-md mx-auto relative z-10 flex flex-col min-h-screen bg-[#09090b] shadow-2xl">
        
        {/* TOAST NOTIFICATION */}
        <AnimatePresence>
            {latestToast && (
                <MotionDiv 
                    initial={{ opacity: 0, y: -50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    onClick={() => { setView('NOTIFICATIONS'); setLatestToast(null); }}
                    className="fixed top-4 left-0 right-0 z-[100] px-4 flex justify-center pointer-events-none"
                >
                    <div className="pointer-events-auto bg-[#18181b]/90 backdrop-blur-md border border-white/10 p-3 rounded-2xl shadow-2xl flex items-center gap-3 max-w-[90%] w-full cursor-pointer ring-1 ring-white/5">
                        <div className={`p-2 rounded-xl shrink-0 ${
                            latestToast.sender === 'Administrator' 
                                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.2)]' 
                                : latestToast.type === 'warning' 
                                    ? 'bg-orange-500/10 text-orange-500' 
                                    : 'bg-blue-500/10 text-blue-500'
                        }`}>
                            {latestToast.sender === 'Administrator' ? <Terminal className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            {(() => {
                                // Dynamic Content extraction logic duplicated here for render
                                const title = latestToast.titleKey && (t as any)[latestToast.titleKey] ? (t as any)[latestToast.titleKey] : latestToast.title;
                                const message = latestToast.messageKey && (t as any)[latestToast.messageKey] ? (t as any)[latestToast.messageKey] : latestToast.message;
                                return (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-xs font-bold text-white truncate">{title}</h4>
                                            {latestToast.sender === 'Administrator' && (
                                                <span className="text-[8px] bg-purple-500 text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">DEV</span>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-zinc-400 truncate">{message}</p>
                                    </>
                                );
                            })()}
                        </div>
                        <X 
                            className="w-4 h-4 text-zinc-600 hover:text-white shrink-0" 
                            onClick={(e) => { e.stopPropagation(); setLatestToast(null); }} 
                        />
                    </div>
                </MotionDiv>
            )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
            
            {/* REDESIGNED SPLASH SCREEN */}
            {view === 'SPLASH' && (
                <MotionDiv 
                    key="splash"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, filter: 'blur(20px)', scale: 1.1 }}
                    className="absolute inset-0 z-50 flex flex-col bg-[#050505] overflow-hidden"
                >
                    {/* Background Grid */}
                    <div className="absolute inset-0 bg-grid-moving opacity-10"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]" />

                    <div className="flex-1 flex flex-col items-center justify-center relative">
                        {/* Logo Container */}
                        <div className="relative mb-12">
                            <MotionDiv
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 1.5, ease: "anticipate" }}
                                className="relative w-32 h-32 flex items-center justify-center"
                            >
                                 <div className="absolute inset-0 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
                                 <MotionDiv 
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 border border-green-500/30 rounded-full border-t-transparent border-l-transparent" 
                                 />
                                 <MotionDiv 
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-2 border border-green-500/10 rounded-full border-b-transparent border-r-transparent" 
                                 />
                                 <Cpu className="w-12 h-12 text-white drop-shadow-[0_0_15px_rgba(34,197,94,0.8)]" />
                            </MotionDiv>
                        </div>

                        {/* Text and Loader */}
                        <div className="w-64 space-y-6">
                            <div className="text-center space-y-2">
                                <MotionH1 
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-4xl font-black tracking-tighter text-white"
                                >
                                    CASINO <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">AI</span>
                                </MotionH1>
                                <MotionDiv
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="flex justify-between text-[10px] text-zinc-500 font-mono uppercase tracking-widest"
                                >
                                    <span>{t.systemBoot}</span>
                                    <span>v3.4.1</span>
                                </MotionDiv>
                            </div>

                            {/* Technical Progress Bar */}
                            <div className="relative h-1 bg-zinc-900 rounded-full overflow-hidden">
                                <MotionDiv 
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 4.5, ease: "easeInOut" }}
                                    className="absolute top-0 left-0 h-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                                />
                            </div>
                            
                            <div className="h-8 relative overflow-hidden">
                                <MotionDiv
                                    animate={{ y: [0, -32, -64, -96] }}
                                    transition={{ duration: 4, times: [0, 0.3, 0.6, 0.9] }}
                                    className="flex flex-col items-center text-[10px] text-zinc-500 font-mono"
                                >
                                    <span className="h-8 flex items-center gap-2"><Scan className="w-3 h-3" /> {t.initializing}</span>
                                    <span className="h-8 flex items-center gap-2"><Binary className="w-3 h-3" /> {t.decrypting}</span>
                                    <span className="h-8 flex items-center gap-2"><Globe className="w-3 h-3" /> {t.connecting}</span>
                                    <span className="h-8 flex items-center gap-2 text-green-500"><Power className="w-3 h-3" /> {t.systemReady}</span>
                                </MotionDiv>
                            </div>
                        </div>
                    </div>

                    {/* Footer Code Rain Effect */}
                    <div className="h-12 border-t border-white/5 bg-black/50 backdrop-blur flex items-center justify-between px-6 text-[9px] text-zinc-700 font-mono uppercase tracking-widest">
                        <span>{t.securedBy}</span>
                        <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                                <MotionDiv
                                    key={i}
                                    animate={{ opacity: [0.2, 1, 0.2] }}
                                    transition={{ duration: 1, delay: i * 0.1, repeat: Infinity }}
                                    className="w-1 h-1 bg-green-900 rounded-full"
                                />
                            ))}
                        </div>
                    </div>
                </MotionDiv>
            )}

            {/* LOGIN SCREEN */}
            {view === 'LOGIN' && (
                <Login key="login" onLoginSuccess={handleLoginSuccess} language={language} onLanguageChange={changeLanguage} />
            )}

            {/* MAIN CONTENT AREA */}
            {(view !== 'SPLASH' && view !== 'LOGIN') && (
                <MotionDiv className="flex-1 flex flex-col min-h-screen">
                     {renderContent()}
                </MotionDiv>
            )}

        </AnimatePresence>

        {/* BOTTOM NAVIGATION BAR */}
        {showBottomNav && (
            <div className="fixed bottom-0 left-0 right-0 z-50 p-4 max-w-md mx-auto">
                <div className="bg-[#121214]/80 backdrop-blur-lg border border-white/10 rounded-2xl p-1 flex items-center justify-between shadow-2xl">
                    <button 
                        onClick={() => { playSound('click'); setView('SELECTION'); }}
                        className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl transition-all ${view === 'SELECTION' ? 'bg-white/5 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        <Home className="w-5 h-5" />
                        <span className="text-[9px] font-bold uppercase tracking-wider">{t.home}</span>
                    </button>
                    <button 
                        onClick={() => { playSound('click'); setView('NOTIFICATIONS'); }}
                        className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl transition-all ${view === 'NOTIFICATIONS' ? 'bg-white/5 text-white' : 'text-zinc-500 hover:text-zinc-300'} relative`}
                    >
                        <div className="relative">
                            <Bell className="w-5 h-5" />
                            {unreadCount > 0 && (
                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-[#121214]" />
                            )}
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-wider">{t.alerts}</span>
                    </button>
                    <button 
                        onClick={() => { playSound('click'); setView('PROFILE'); }}
                        className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl transition-all ${view === 'PROFILE' ? 'bg-white/5 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        <User className="w-5 h-5" />
                        <span className="text-[9px] font-bold uppercase tracking-wider">{t.profile}</span>
                    </button>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};