import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Users, Gamepad2, Zap, Trophy, Globe, User, Languages } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

interface UsersOnlineProps {
    onBack: () => void;
    language: Language;
    onLanguageChange: (lang: Language) => void;
}

// Arabic & Gaming Name Mix
const BASE_NAMES = [
    "Ahmed_Pro", "Mohamed_King", "Ali_Sniper", "Omar_X", "Sayed_Gamer", 
    "Hassan_VIP", "Mahmoud_Fox", "Mustafa_Top", "Youssef_Win", "Ibrahim_Bet", 
    "Khaled_Boss", "Tarek_Eagle", "Amr_Shadow", "Sherif_Lion", "Karim_Joker",
    "El_Gendy", "Masr_Boy", "Cairo_Prince", "Alex_King", "Sa3edy_Hero",
    "Mido_Star", "Ziad_Master", "Hazem_Strike", "Fares_Knight", "Nader_Ghost",
    "Sameh_Rock", "Walid_Tiger", "Hady_Storm", "Ramy_Blaze", "Hesham_Hawk",
    "Tamer_Wolf", "Essam_Bear", "Magdy_Falcon", "Shawky_Viper", "Reda_Cobra"
];

const REGIONS = ["Cairo", "Giza", "Alex", "Mansoura", "Tanta", "Suez", "Luxor", "Aswan", "Global"];
const GAMES = ["Playing Crash", "Playing Mines", "In Lobby", "Playing Apple", "Cashing Out"];
const RANKS = ["Elite", "Pro", "Rookie", "VIP", "Master"];
const COLORS = ["bg-red-500", "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-pink-500", "bg-cyan-500"];

const generateUser = (id: number) => ({
    id: id,
    name: BASE_NAMES[Math.floor(Math.random() * BASE_NAMES.length)] + "_" + Math.floor(Math.random() * 99),
    region: REGIONS[Math.floor(Math.random() * REGIONS.length)],
    game: GAMES[Math.floor(Math.random() * GAMES.length)],
    rank: RANKS[Math.floor(Math.random() * RANKS.length)],
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    winRate: Math.floor(Math.random() * 40) + 50 // 50-90%
});

export const UsersOnline: React.FC<UsersOnlineProps> = ({ onBack, language }) => {
    
    const t = translations[language];

    // Initial Population
    const [users, setUsers] = useState(() => {
        return Array.from({ length: 20 }).map((_, i) => generateUser(Date.now() + i));
    });

    // Real-time Simulation
    useEffect(() => {
        const interval = setInterval(() => {
            setUsers(currentUsers => {
                // 1. Sometimes add a new user at the top
                const newUsers = [...currentUsers];
                if (Math.random() > 0.3) {
                    newUsers.unshift(generateUser(Date.now()));
                    if (newUsers.length > 30) newUsers.pop(); // Keep list size manageable
                }
                
                // 2. Sometimes update an existing user's status
                const randomIndex = Math.floor(Math.random() * newUsers.length);
                if (newUsers[randomIndex]) {
                    newUsers[randomIndex] = {
                        ...newUsers[randomIndex],
                        game: GAMES[Math.floor(Math.random() * GAMES.length)]
                    };
                }

                return newUsers;
            });
        }, 2000); // Update every 2 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col p-4 pb-24 h-full overflow-hidden" 
        >
            <div className="flex items-center justify-between mb-6 shrink-0">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={onBack}
                        className="p-2.5 rounded-xl bg-zinc-900/50 border border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors backdrop-blur-sm"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex flex-col">
                        <h1 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                            <Users className="w-5 h-5 text-green-500" />
                            {t.liveNet}
                        </h1>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{t.activeSquad}</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
                <AnimatePresence initial={false}>
                    {users.map((user) => (
                        <motion.div 
                            key={user.id}
                            initial={{ opacity: 0, height: 0, scale: 0.95 }}
                            animate={{ opacity: 1, height: 'auto', scale: 1 }}
                            exit={{ opacity: 0, height: 0, scale: 0.9 }}
                            layout // Enable layout animation for smooth reordering
                            className="glass-panel p-3 rounded-xl border border-white/5 flex items-center gap-4 hover:bg-white/5 transition-colors group"
                        >
                            {/* Avatar */}
                            <div className={`w-10 h-10 rounded-full ${user.color}/10 border border-white/10 flex items-center justify-center relative shrink-0`}>
                                <User className={`w-5 h-5 ${user.color.replace('bg-', 'text-')}`} />
                                <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 ${user.game === 'In Lobby' ? 'bg-yellow-500' : 'bg-green-500'} rounded-full border-2 border-[#121214]`} />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-white text-sm truncate">{user.name}</h3>
                                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${user.rank === 'VIP' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 'bg-zinc-800 text-zinc-500 border-zinc-700'}`}>
                                        {user.rank}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 mt-1">
                                    <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                                        <Globe className="w-3 h-3 text-zinc-600" />
                                        <span>{user.region}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                                        <Gamepad2 className="w-3 h-3 text-zinc-600" />
                                        <span className={user.game.includes('Playing') ? 'text-green-400' : 'text-zinc-500'}>
                                            {user.game}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Win Rate */}
                            <div className="flex flex-col items-end gap-1 shrink-0 pl-2 border-l border-white/5">
                                <span className="text-[9px] font-bold text-zinc-600 uppercase">{t.winRate}</span>
                                <div className="flex items-center gap-1">
                                    <Zap className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                    <span className="font-mono font-bold text-white">{user.winRate}%</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                
                <div className="py-4 text-center">
                    <p className="text-[10px] text-zinc-600 font-mono animate-pulse flex items-center justify-center gap-2">
                        <Zap className="w-3 h-3" /> {t.updating}
                    </p>
                </div>
            </div>
        </motion.div>
    );
};