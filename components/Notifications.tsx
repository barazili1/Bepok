import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, AlertTriangle, CheckCircle, Info, Clock, Check, ChevronDown, ChevronUp, Terminal } from 'lucide-react';
import { Notification, Language } from '../types';
import { translations } from '../translations';

interface NotificationsProps {
    notifications: Notification[];
    onMarkRead: (id: string) => void;
    language: Language;
}

export const Notifications: React.FC<NotificationsProps> = ({ notifications, onMarkRead, language }) => {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const t = translations[language];

    const toggleExpand = (id: string, read: boolean) => {
        if (expandedId === id) {
            setExpandedId(null);
        } else {
            setExpandedId(id);
            if (!read) {
                onMarkRead(id);
            }
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col p-2 space-y-4 overflow-y-auto pb-24"
        >
            <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl font-black text-white">{t.alerts.toUpperCase()}</h1>
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-white/5 relative">
                    <Bell className="w-4 h-4 text-zinc-400" />
                    {notifications.filter(n => !n.read).length > 0 && (
                        <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border border-[#18181b]" />
                    )}
                </div>
            </div>

            <div className="space-y-3">
                <AnimatePresence>
                    {notifications.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-8 text-center border border-dashed border-zinc-800 rounded-2xl"
                        >
                            <Bell className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                            <p className="text-zinc-600 text-xs">{t.noNotifications}</p>
                        </motion.div>
                    ) : (
                        notifications.map((notif, index) => (
                            <motion.div
                                key={notif.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => toggleExpand(notif.id, notif.read)}
                                className={`
                                    rounded-2xl border relative overflow-hidden group cursor-pointer transition-all duration-300
                                    ${notif.read ? 'bg-[#121214] border-white/5' : 'bg-[#18181b] border-white/10 hover:bg-[#202024]'}
                                    ${expandedId === notif.id ? 'ring-1 ring-white/10 bg-[#202024]' : ''}
                                `}
                            >
                                <div className="p-4 flex items-start gap-4">
                                    <div className={`
                                        p-3 rounded-xl flex items-center justify-center shrink-0 transition-colors
                                        ${notif.sender === 'Administrator' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.15)]' :
                                        notif.type === 'success' ? 'bg-green-500/10 text-green-500' : 
                                        notif.type === 'warning' ? 'bg-orange-500/10 text-orange-500' : 
                                        'bg-blue-500/10 text-blue-500'}
                                    `}>
                                        {notif.sender === 'Administrator' ? <Terminal className="w-5 h-5" /> : (
                                            <>
                                                {notif.type === 'success' && <CheckCircle className="w-5 h-5" />}
                                                {notif.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
                                                {notif.type === 'info' && <Info className="w-5 h-5" />}
                                            </>
                                        )}
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2 truncate pr-2">
                                                <h3 className={`font-bold text-sm ${notif.read ? 'text-zinc-400' : 'text-white'}`}>
                                                    {notif.title}
                                                </h3>
                                                {notif.sender === 'Administrator' && (
                                                    <span className="text-[9px] bg-purple-500/20 text-purple-400 border border-purple-500/30 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                                                        Developer
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1 text-[10px] text-zinc-600 shrink-0">
                                                <Clock className="w-3 h-3" />
                                                <span>{new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="relative">
                                            <p className={`text-xs text-zinc-400 leading-relaxed font-medium transition-all ${expandedId === notif.id ? '' : 'line-clamp-1'}`}>
                                                {notif.message}
                                            </p>
                                        </div>

                                        <AnimatePresence>
                                            {expandedId === notif.id && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="mt-3 pt-3 border-t border-white/5"
                                                >
                                                    <div className="flex items-center justify-between text-[10px] text-zinc-500 uppercase tracking-wider">
                                                        <span>{t.systemGenerated}</span>
                                                        <span className="flex items-center gap-1 text-green-500">
                                                            <Check className="w-3 h-3" /> {t.verified}
                                                        </span>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <div className="shrink-0 pt-1">
                                         {expandedId === notif.id ? (
                                             <ChevronUp className="w-4 h-4 text-zinc-600" />
                                         ) : (
                                             <ChevronDown className="w-4 h-4 text-zinc-600" />
                                         )}
                                    </div>
                                </div>
                                
                                {!notif.read && (
                                    <div className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                )}
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            <div className="mt-4 text-center">
                <p className="text-[10px] text-zinc-600 font-mono">{t.endOfNotifications}</p>
            </div>
        </motion.div>
    );
};