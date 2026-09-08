import React, { useState } from 'react';
import {
  Crown,
  Shield,
  Zap,
  CheckCircle2,
  Lock,
  Flame,
  Award,
  Coins,
  Sparkles,
  ExternalLink,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../i18n/translations';
import { triggerHaptic } from '../../utils/telegram';

export const StoreTab: React.FC = () => {
  const {
    language,
    user,
    upgradeToPro,
    buyStrikeFreeze,
    joinStakingChallenge,
    leaderboard,
  } = useApp();

  const strings = getTranslation(language);
  const [selectedCurrency, setSelectedCurrency] = useState<'stars' | 'ton' | 'card'>('stars');

  const perks = [
    strings.store.perk1,
    strings.store.perk2,
    strings.store.perk3,
    strings.store.perk4,
    strings.store.perk5,
  ];

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* PRO Hero Card */}
      <section
        id="pro-pass-card"
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-950 via-slate-900 to-slate-950 border-2 border-purple-500/60 p-5 shadow-2xl shadow-purple-950/40"
      >
        <div className="absolute top-0 right-0 p-8 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <Crown className="w-5 h-5 text-amber-400 fill-amber-400" />
              <span className="text-xs font-black uppercase tracking-wider text-amber-400 font-chakra">
                {strings.store.proTitle}
              </span>
            </div>
            <h2 className="text-2xl font-black font-chakra text-slate-100 mt-1">
              $5.00 <span className="text-xs font-normal text-slate-400">/ {language === 'ru' ? 'месяц' : 'month'}</span>
            </h2>
            <div className="text-[11px] font-mono text-purple-300 mt-0.5">
              ≈ 250 Telegram Stars / 1.8 TON
            </div>
          </div>

          <div className="text-right">
            {user.isPro ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40 text-xs font-bold font-chakra">
                <Check className="w-3.5 h-3.5" />
                ACTIVE
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-semibold font-chakra">
                FREE TIER
              </span>
            )}
          </div>
        </div>

        {/* Currency Selector */}
        {!user.isPro && (
          <div className="flex items-center gap-1.5 mt-4 p-1 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-chakra font-bold">
            <button
              onClick={() => setSelectedCurrency('stars')}
              className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
                selectedCurrency === 'stars'
                  ? 'bg-purple-900/80 text-amber-300 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>★ 250 Stars</span>
            </button>
            <button
              onClick={() => setSelectedCurrency('ton')}
              className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
                selectedCurrency === 'ton'
                  ? 'bg-purple-900/80 text-cyan-300 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>💎 1.8 TON</span>
            </button>
            <button
              onClick={() => setSelectedCurrency('card')}
              className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
                selectedCurrency === 'card'
                  ? 'bg-purple-900/80 text-purple-200 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>💳 $5 Card</span>
            </button>
          </div>
        )}

        {/* Perks List */}
        <div className="mt-4 space-y-2 border-t border-purple-900/40 pt-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300 font-chakra block">
            {strings.store.proPerksTitle}
          </span>
          {perks.map((perk, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{perk}</span>
            </div>
          ))}
        </div>

        {/* Upgrade Button */}
        <div className="mt-4">
          {user.isPro ? (
            <button
              disabled
              className="w-full py-3 px-4 rounded-xl bg-slate-900/80 border border-purple-500/40 text-purple-300 font-chakra font-black text-xs uppercase tracking-wide cursor-default flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              {strings.store.proActiveBtn}
            </button>
          ) : (
            <button
              id="buy-pro-subscription-btn"
              onClick={() => {
                triggerHaptic('heavy');
                upgradeToPro();
              }}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-purple-600 to-emerald-400 text-slate-950 hover:brightness-110 font-chakra font-black text-xs uppercase tracking-wider shadow-lg shadow-purple-950/60 active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <Crown className="w-4 h-4 fill-slate-950" />
              {strings.store.upgradeNow}
            </button>
          )}
        </div>
      </section>

      {/* Strike Freeze Emergency Shields Store */}
      <section
        id="strike-freeze-section"
        className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/30 space-y-3"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <Shield className="w-5 h-5 fill-cyan-400/20" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase text-slate-100 font-chakra tracking-wider">
                {strings.store.freezeSectionTitle}
              </h3>
              <p className="text-[11px] text-slate-400 leading-tight">
                {strings.store.freezeSectionDesc}
              </p>
            </div>
          </div>

          <div className="px-2.5 py-1 rounded-xl bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold shrink-0">
            {user.strikeFreezes} {strings.topBar.freezes}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            id="buy-1-freeze-btn"
            onClick={() => {
              triggerHaptic('medium');
              buyStrikeFreeze(1);
            }}
            className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-left transition-all active:scale-95"
          >
            <div className="flex items-center justify-between text-cyan-300 font-bold font-chakra text-xs">
              <span>+1 Freeze Shield</span>
              <span>50 ★</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
              $1.00 single emergency
            </span>
          </button>

          <button
            id="buy-3-freeze-btn"
            onClick={() => {
              triggerHaptic('medium');
              buyStrikeFreeze(3);
            }}
            className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-left transition-all active:scale-95"
          >
            <div className="flex items-center justify-between text-cyan-300 font-bold font-chakra text-xs">
              <span>+3 Freezes Pack</span>
              <span>120 ★</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono block mt-0.5">
              Save 20% bundle
            </span>
          </button>
        </div>
      </section>

      {/* 14-Day Paid Staking Challenge ($5 / 100 Stars Entry) */}
      <section
        id="paid-staking-challenge-card"
        className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border-2 border-amber-500/50 space-y-3 shadow-lg shadow-amber-950/20"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Coins className="w-5 h-5" />
            </span>
            <div>
              <span className="text-xs font-black uppercase text-amber-400 font-chakra tracking-wider">
                {strings.store.stakingTitle}
              </span>
              <p className="text-[11px] text-slate-300 mt-0.5">
                {strings.store.stakeEntry}
              </p>
            </div>
          </div>

          {user.hasActiveStake && (
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-chakra animate-pulse">
              {strings.store.stakeStatusActive}
            </span>
          )}
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          {strings.store.stakingDesc}
        </p>

        {user.hasActiveStake ? (
          <div className="p-3 rounded-xl bg-slate-950/80 border border-amber-500/40 space-y-2">
            <div className="flex items-center justify-between text-xs font-chakra">
              <span className="text-slate-400">{strings.store.stakeProgress}:</span>
              <span className="font-bold text-amber-400">
                {user.stakeDaysCompleted} / {user.stakeDaysTotal} {strings.topBar.days}
              </span>
            </div>

            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-500"
                style={{
                  width: `${Math.round((user.stakeDaysCompleted / user.stakeDaysTotal) * 100)}%`,
                }}
              />
            </div>

            <p className="text-[10px] text-rose-400 font-mono text-center">
              ⚠️ {strings.store.forfeitedNotice}
            </p>
          </div>
        ) : (
          <button
            id="join-staking-challenge-btn"
            onClick={() => {
              triggerHaptic('heavy');
              joinStakingChallenge();
            }}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-slate-950 font-chakra font-black text-xs uppercase tracking-wider shadow-md shadow-amber-950/50 active:scale-98 transition-all"
          >
            {strings.store.stakeButton}
          </button>
        )}
      </section>

      {/* Leaderboard with Gold Badges */}
      <section
        id="leaderboard-section"
        className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase text-slate-100 font-chakra tracking-wider">
            {strings.store.leaderboardTitle}
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">Top Warriors</span>
        </div>

        <div className="space-y-1.5">
          {leaderboard.map((item, idx) => {
            const isSelf = item.isCurrentUser;
            return (
              <div
                key={item.id}
                className={`flex items-center justify-between p-2.5 rounded-xl text-xs transition-all ${
                  isSelf
                    ? 'bg-purple-950/50 border border-purple-500/50 shadow-sm'
                    : 'bg-slate-950/60 border border-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-5 font-chakra font-black text-center ${
                      idx === 0
                        ? 'text-amber-400'
                        : idx === 1
                        ? 'text-slate-300'
                        : idx === 2
                        ? 'text-amber-600'
                        : 'text-slate-500'
                    }`}
                  >
                    #{idx + 1}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`font-semibold font-chakra ${
                        isSelf ? 'text-purple-300 font-bold' : 'text-slate-200'
                      }`}
                    >
                      @{item.username}
                    </span>

                    {item.hasGoldBadge && (
                      <span
                        title={strings.store.goldBadgeVerified}
                        className="p-0.5 rounded bg-amber-400 text-slate-950 text-[10px] font-black leading-none"
                      >
                        ★ GOLD
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 font-mono">
                  <div className="flex items-center gap-1 text-orange-400 font-bold">
                    <Flame className="w-3.5 h-3.5 fill-orange-500" />
                    <span>{item.streak}d</span>
                  </div>
                  <span className="text-slate-400 text-[11px]">{item.xp} XP</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
