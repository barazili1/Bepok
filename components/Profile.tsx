import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Smartphone, MapPin, Key, Clock, LogOut, Shield, Activity, Wifi, Code, ChevronRight, Edit2, Ghost, Skull, Crown, Zap, Bot, Smile } from 'lucide-react';
import { AccessKey, ViewState, Language } from '../types';
import { translations } from '../translations';

interface ProfileProps {
    accessKeyData: AccessKey | null;
    onSignOut: () => void;
    onNavigate: (view: ViewState) => void;
    currentAvatarId: number;
    onAvatarChange: (id: number) => void;
    language: Language;
    onLanguageChange: (lang: Language) => void;
}

const AVATARS = [
    { id: 0, icon: User, color: 'text-zinc-400', bg: 'bg-zinc-800' },
    { id: 1, icon: Ghost, color: 'text-purple-400', bg: 'bg-purple-900/40' },
    { id: 2, icon: Skull, color: 'text-red-400', bg: 'bg-red-900/40' },
    { id: 3, icon: Crown, color: 'text-yellow-400', bg: 'bg-yellow-900/40' },
    { id: 4, icon: Zap, color: 'text-blue-400', bg: 'bg-blue-900/40' },
    { id: 5, icon: Bot, color: 'text-green-400', bg: 'bg-green-900/40' },
    { id: 6, icon: Smile, color: 'text-pink-400', bg: 'bg-pink-900/40' },
    { id: 7, icon: Shield, color: 'text-cyan-400', bg: 'bg-cyan-900/40' },
];

export const Profile: React.FC<ProfileProps> = ({ accessKeyData, onSignOut, onNavigate, currentAvatarId, onAvatarChange, language }) => {
    const [deviceType, setDeviceType] = useState('Unknown Device');
    const [userRegion, setUserRegion] = useState('Unknown');
    const [onlineTime, setOnlineTime] = useState(0);
    const [isEditingAvatar, setIsEditingAvatar] = useState(false);
    const t = translations[language];

    useEffect(() => {
        // Detect Device
        const ua = navigator.userAgent;
        if (/android/i.test(ua)) setDeviceType('Android Device');
        else if (/iPad|iPhone|iPod/.test(ua)) setDeviceType('Apple iOS Device');
        else if (/windows/i.test(ua)) setDeviceType('Windows PC');
        else if (/macintosh/i.test(ua)) setDeviceType('Macintosh');
        else setDeviceType('Web Client');

        // Detect Region
        try {
            const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const regionName = timeZone.split('/')[1] || timeZone;
            setUserRegion(regionName.replace(/_/g, ' '));
        } catch (e) { setUserRegion('Global'); }

        // Session timer simulation
        const interval = setInterval(() => {
            setOnlineTime(prev => prev + 1);
        }, 60000); // Update every minute

        return () => clearInterval(interval);
    }, []);

    const formatTime = (minutes: number) => {
        if (minutes < 60) return `${minutes} mins`;
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hrs}h ${mins}m`;
    };

    const CurrentAvatarIcon = AVATARS.find(a => a.id === currentAvatarId)?.icon || User;
    const currentAvatarStyle = AVATARS.find(a => a.id === currentAvatarId) || AVATARS[0];

    return (
        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col p-2 space-y-6 overflow-y-auto pb-24"
        >
            <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl font-black text-white">{t.profile.toUpperCase()}</h1>
                <div className="bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-green-500 uppercase">{t.online}</span>
                </div>
            </div>

            {/* User ID Card */}
            <div className="glass-panel p-6 rounded-3xl border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-green-500/10 to-transparent rounded-bl-full -mr-10 -mt-10" />
                
                <div className="flex items-center gap-4 mb-6 relative z-10">
                    <div className="relative group cursor-pointer" onClick={() => setIsEditingAvatar(true)}>
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-zinc-800 to-black border border-white/10 flex items-center justify-center shadow-lg overflow-hidden`}>
                            <div className={`absolute inset-0 ${currentAvatarStyle.bg} opacity-20`} />
                            <CurrentAvatarIcon className={`w-8 h-8 ${currentAvatarStyle.color}`} />
                        </div>
                        <div className="absolute -bottom-1 -right-1 p-1 bg-zinc-800 rounded-full border border-zinc-700 text-white shadow-lg">
                            <Edit2 className="w-3 h-3" />
                        </div>
                    </div>
                    
                    <div>
                        <h2 className="text-xl font-bold text-white">{accessKeyData?.name || 'Commander'}</h2>
                        <span className="text-xs text-zinc-500 font-mono">{t.id}: {accessKeyData?.key.slice(0, 8)}...</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 relative z-10">
                    <div className="bg-[#121214] p-3 rounded-xl border border-white/5">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block mb-1">{t.status}</span>
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-green-500" />
                            <span className="text-sm font-bold text-white">{t.verified}</span>
                        </div>
                    </div>
                    <div className="bg-[#121214] p-3 rounded-xl border border-white/5">
                         <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block mb-1">{t.plan}</span>
                         <div className="flex items-center gap-2">
                            <Key className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm font-bold text-white">{accessKeyData?.type === 'PERMANENT' ? t.vip : t.standard}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Avatar Selection Modal */}
            <AnimatePresence>
                {isEditingAvatar && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                        onClick={() => setIsEditingAvatar(false)}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-[#121214] border border-white/10 rounded-2xl p-5 w-full max-w-xs shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wide text-center">{t.selectIdentity}</h3>
                            <div className="grid grid-cols-4 gap-3">
                                {AVATARS.map((avatar) => (
                                    <button
                                        key={avatar.id}
                                        onClick={() => {
                                            onAvatarChange(avatar.id);
                                            setIsEditingAvatar(false);
                                        }}
                                        className={`
                                            aspect-square rounded-xl flex items-center justify-center border transition-all
                                            ${currentAvatarId === avatar.id 
                                                ? 'bg-white/10 border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]' 
                                                : 'bg-zinc-900 border-white/5 hover:bg-zinc-800 hover:border-white/20'}
                                        `}
                                    >
                                        <avatar.icon className={`w-6 h-6 ${avatar.color}`} />
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Device & Location Info */}
            <div className="space-y-3">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">{t.systemInfo}</h3>
                
                <div className="bg-[#121214] rounded-2xl border border-white/5 overflow-hidden divide-y divide-white/5">
                    <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-zinc-900 rounded-lg">
                                <Smartphone className="w-5 h-5 text-blue-500" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-zinc-500 font-bold uppercase">{t.deviceModel}</span>
                                <span className="text-sm font-medium text-zinc-200">{deviceType}</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-zinc-900 rounded-lg">
                                <MapPin className="w-5 h-5 text-red-500" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-zinc-500 font-bold uppercase">{t.region}</span>
                                <span className="text-sm font-medium text-zinc-200">{userRegion}</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-zinc-900 rounded-lg">
                                <Clock className="w-5 h-5 text-purple-500" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-zinc-500 font-bold uppercase">{t.activationTime}</span>
                                <span className="text-sm font-medium text-zinc-200">
                                    {new Date(accessKeyData?.createdAt || Date.now()).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Activity Stats */}
            <div className="space-y-3">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">{t.sessionMetrics}</h3>
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#121214] p-4 rounded-2xl border border-white/5 flex flex-col gap-2">
                        <Activity className="w-5 h-5 text-orange-500" />
                        <div>
                            <span className="text-2xl font-black text-white">{t.active}</span>
                            <span className="text-[10px] text-zinc-500 uppercase font-bold block">{t.currentStatus}</span>
                        </div>
                    </div>
                    <div className="bg-[#121214] p-4 rounded-2xl border border-white/5 flex flex-col gap-2">
                        <Wifi className="w-5 h-5 text-green-500" />
                        <div>
                            <span className="text-2xl font-black text-white">{formatTime(onlineTime)}</span>
                            <span className="text-[10px] text-zinc-500 uppercase font-bold block">{t.sessionDuration}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* App Info / About Dev */}
            <div className="space-y-3">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">{t.appInfo}</h3>
                <button 
                    onClick={() => onNavigate('ABOUT_DEV')}
                    className="w-full p-4 rounded-2xl bg-[#121214] border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-zinc-900 rounded-lg">
                            <Code className="w-5 h-5 text-blue-500" />
                        </div>
                        <div className="flex flex-col items-start">
                            <span className="font-bold text-white">{t.aboutDev}</span>
                            <span className="text-[10px] text-zinc-500">{t.credits}</span>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-white transition-colors" />
                </button>
            </div>

            {/* Sign Out */}
            <button 
                onClick={onSignOut}
                className="mt-6 w-full py-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors"
            >
                <LogOut className="w-4 h-4" />
                {t.signOut}
            </button>
        </motion.div>
    );
};
