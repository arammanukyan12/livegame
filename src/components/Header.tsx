import React from 'react';
import { Flame, Shield, Volume2, VolumeX, Crown, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../i18n/translations';

export const Header: React.FC = () => {
  const { language, toggleLanguage, user, soundEnabled, toggleSound } = useApp();
  const strings = getTranslation(language);

  // XP progress calculation (250 XP per level)
  const currentLevelBaseXp = (user.level - 1) * 250;
  const currentLevelProgress = Math.max(0, user.xp - currentLevelBaseXp);
  const xpPercent = Math.min(100, Math.round((currentLevelProgress / 250) * 100));

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5">
      <div className="max-w-md mx-auto flex items-center justify-between gap-2">
        {/* Left: User Avatar & Telegram Name */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative shrink-0">
            <img
              src={user.avatarUrl}
              alt={user.username}
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-xl object-cover border-2 border-purple-500/60 shadow-md shadow-purple-950/40"
            />
            {user.isPro && (
              <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 p-0.5 rounded-full shadow">
                <Crown className="w-3 h-3 stroke-[2.5]" />
              </span>
            )}
            {user.badge === 'gold_disciplined' && !user.isPro && (
              <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 text-[9px] font-black px-1 rounded-full shadow">
                ★
              </span>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-slate-100 truncate tracking-tight font-chakra">
                @{user.username}
              </span>
              {user.isPro ? (
                <span className="text-[10px] uppercase font-black px-1.5 py-0.2 rounded bg-purple-950/80 text-purple-300 border border-purple-500/40 shrink-0">
                  PRO
                </span>
              ) : (
                <span className="text-[9px] uppercase font-semibold px-1 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700 shrink-0">
                  FREE
                </span>
              )}
            </div>

            {/* Level & XP Mini Bar */}
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[11px] font-extrabold text-purple-400 font-chakra shrink-0">
                {strings.topBar.level} {user.level}
              </span>
              <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden shrink-0 border border-slate-700/50">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 transition-all duration-500"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 font-mono shrink-0">
                {user.xp} XP
              </span>
            </div>
          </div>
        </div>

        {/* Right: Streak, Shield Count, Sound & Language Switcher */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Active Streak */}
          <div
            id="streak-badge"
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-950/40 border border-orange-500/40 text-orange-400 shadow-sm"
          >
            <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-500 animate-pulse" />
            <span className="text-xs font-black font-chakra tracking-wide">
              {user.streak}
            </span>
          </div>

          {/* Strike Freezes count */}
          <div
            id="freeze-badge"
            title={`${user.strikeFreezes} ${strings.topBar.freezes}`}
            className="flex items-center gap-1 px-1.5 py-1 rounded-lg bg-cyan-950/40 border border-cyan-500/40 text-cyan-300"
          >
            <Shield className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400/20" />
            <span className="text-xs font-bold font-mono">
              {user.strikeFreezes}
            </span>
          </div>

          {/* Sound Toggle */}
          <button
            id="sound-toggle-btn"
            onClick={toggleSound}
            aria-label="Toggle Sound"
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-slate-500" />
            )}
          </button>

          {/* Bilingual Language Switcher (RU | EN) */}
          <button
            id="language-switcher-btn"
            onClick={toggleLanguage}
            className="flex items-center justify-center px-2 py-1 rounded-lg bg-gradient-to-r from-purple-900/60 to-slate-900 border border-purple-500/50 hover:border-purple-400 text-purple-300 font-chakra font-extrabold text-xs transition-all active:scale-95 shadow-sm"
          >
            {language === 'ru' ? 'RU 🇷🇺' : 'EN 🇬🇧'}
          </button>
        </div>
      </div>
    </header>
  );
};
