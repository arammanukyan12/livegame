import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Flame,
  Shield,
  Dumbbell,
  Sun,
  Droplets,
  CupSoda,
  Brain,
  ShieldBan,
  Quote,
  Sparkles,
  Lock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../i18n/translations';
import { Habit } from '../../types';

export const HabitsTab: React.FC = () => {
  const {
    language,
    habits,
    toggleHabit,
    reportHabitFailure,
    pendingFailureHabitId,
    cancelFailureReport,
    confirmFailureReset,
    consumeStrikeFreeze,
    user,
    setActiveTab,
  } = useApp();

  const strings = getTranslation(language);
  const completedCount = habits.filter((h) => h.completed).length;
  const progressPercent = Math.round((completedCount / habits.length) * 100);

  // Hardcore motivational quote based on day
  const quote = strings.habits.quotes[user.streak % strings.habits.quotes.length];

  const getHabitIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sun':
        return <Sun className="w-5 h-5 text-amber-400" />;
      case 'Dumbbell':
        return <Dumbbell className="w-5 h-5 text-purple-400" />;
      case 'Droplets':
        return <Droplets className="w-5 h-5 text-cyan-400" />;
      case 'CupSoda':
        return <CupSoda className="w-5 h-5 text-sky-400" />;
      case 'ShieldBan':
        return <ShieldBan className="w-5 h-5 text-rose-400" />;
      case 'Brain':
        return <Brain className="w-5 h-5 text-indigo-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-emerald-400" />;
    }
  };

  const pendingHabit = habits.find((h) => h.id === pendingFailureHabitId);

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Zero-Tolerance Banner */}
      <section
        id="zero-tolerance-banner"
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-950/70 via-slate-900 to-slate-950 border border-rose-600/40 p-4 shadow-lg shadow-rose-950/20"
      >
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-rose-600/20 text-rose-400 border border-rose-500/30 shrink-0 mt-0.5">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-rose-400 font-chakra">
                {strings.habits.zeroTolerance}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
                STRICT
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {strings.habits.ruleWarning}
            </p>
          </div>
        </div>

        {/* Freezes in reserve banner */}
        <div className="mt-3 pt-3 border-t border-rose-900/40 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-cyan-300 font-medium">
            <Shield className="w-4 h-4 text-cyan-400 fill-cyan-500/20" />
            <span>
              {user.strikeFreezes} {strings.topBar.freezes} {language === 'ru' ? 'в запасе' : 'in armory'}
            </span>
          </div>

          <button
            onClick={() => setActiveTab('store')}
            className="text-[11px] font-bold text-purple-400 hover:text-purple-300 underline underline-offset-2"
          >
            {language === 'ru' ? '+ Пополнить щиты' : '+ Get more shields'}
          </button>
        </div>
      </section>

      {/* Daily Discipline Progress Card */}
      <section
        id="discipline-progress-card"
        className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 relative overflow-hidden"
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-chakra">
              {strings.habits.todayProgress}
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <h2 className="text-2xl font-black font-chakra text-slate-100">
                {completedCount} <span className="text-sm font-normal text-slate-400">/ {habits.length}</span>
              </h2>
              <span className="text-xs font-mono font-bold text-emerald-400">
                {progressPercent}%
              </span>
            </div>
          </div>

          {/* Streak Flame Badge */}
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-950/60 border border-orange-500/40 text-orange-300 shadow-sm">
              <Flame className="w-4 h-4 fill-orange-500 text-orange-400 animate-pulse" />
              <span className="text-sm font-black font-chakra">
                {user.streak} {strings.topBar.days}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 font-mono">
              {language === 'ru' ? `Рекорд: ${user.bestStreak} дн.` : `Best: ${user.bestStreak} days`}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mt-3 border border-slate-700/50">
          <div
            className="h-full bg-gradient-to-r from-purple-500 via-emerald-400 to-teal-400 transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Quote */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-start gap-2 text-slate-400 italic text-[11px] leading-snug">
          <Quote className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5 opacity-70" />
          <span>"{quote}"</span>
        </div>
      </section>

      {/* Habits List */}
      <section id="habits-list-section" className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-extrabold tracking-wider uppercase text-slate-400 font-chakra">
            {language === 'ru' ? 'Ежедневные Мандаты' : 'Daily Mandates'}
          </h3>
          <span className="text-[11px] font-mono text-slate-400">
            {habits.length - completedCount > 0
              ? `${habits.length - completedCount} ${strings.habits.pendingHabits}`
              : strings.habits.allComplete}
          </span>
        </div>

        {habits.map((habit) => {
          const isDone = habit.completed;
          return (
            <div
              key={habit.id}
              id={`habit-card-${habit.id}`}
              className={`rounded-2xl border transition-all duration-200 p-3.5 ${
                isDone
                  ? 'bg-slate-900/40 border-emerald-500/40 shadow-sm shadow-emerald-950/20'
                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                {/* Checkbox & Habit Info */}
                <button
                  id={`toggle-habit-${habit.id}`}
                  onClick={() => toggleHabit(habit.id)}
                  className="flex items-start gap-3 text-left flex-1 min-w-0 group"
                >
                  <div className="shrink-0 mt-0.5">
                    {isDone ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 fill-emerald-500/20 transition-transform active:scale-90" />
                    ) : (
                      <Circle className="w-6 h-6 text-slate-500 group-hover:text-purple-400 transition-colors active:scale-90" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`text-sm font-bold font-chakra ${
                          isDone ? 'line-through text-slate-400' : 'text-slate-100'
                        }`}
                      >
                        {habit.title[language]}
                      </span>

                      {habit.isKeyHabit && (
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-purple-900/60 text-purple-300 border border-purple-500/40 font-mono">
                          {strings.habits.keyHabitBadge}
                        </span>
                      )}

                      {habit.failCount > 0 && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-950/60 text-rose-400 border border-rose-500/30 font-mono">
                          {habit.failCount} {language === 'ru' ? 'срывов' : 'strikes'}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 mt-0.5 leading-snug">
                      {habit.subtitle[language]}
                    </p>

                    {habit.isKeyHabit && !isDone && (
                      <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-purple-400 font-medium">
                        <Dumbbell className="w-3.5 h-3.5 shrink-0" />
                        <span>{strings.habits.dailyExtremeWorkoutNotice}</span>
                      </div>
                    )}
                  </div>
                </button>

                {/* Right: Category Icon & Report Failure Trigger */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700/50">
                    {getHabitIcon(habit.icon)}
                  </div>

                  {!isDone && (
                    <button
                      id={`report-fail-${habit.id}`}
                      onClick={() => reportHabitFailure(habit.id)}
                      title={strings.habits.markFailed}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 active:scale-90 transition-colors"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Action for Extreme Workout if pending */}
              {habit.id === 'extreme_workout' && !isDone && (
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">
                    {language === 'ru' ? 'Готов к отказу?' : 'Ready to push limits?'}
                  </span>
                  <button
                    id="goto-extreme-workout-btn"
                    onClick={() => setActiveTab('workouts')}
                    className="flex items-center gap-1 text-xs font-bold text-purple-400 hover:text-purple-300 font-chakra"
                  >
                    <Dumbbell className="w-3.5 h-3.5" />
                    {language === 'ru' ? 'Выбрать тренировку →' : 'Select workout →'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* Critical Failure / Zero-Tolerance Modal */}
      {pendingFailureHabitId && (
        <div
          id="strike-failure-modal-backdrop"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            id="strike-failure-modal"
            className="w-full max-w-sm rounded-2xl bg-slate-950 border-2 border-rose-600/80 p-5 shadow-2xl shadow-rose-950/60 animate-strike-shake"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-rose-600/20 text-rose-500 border border-rose-500/40 shrink-0">
                <AlertTriangle className="w-7 h-7 animate-bounce" />
              </div>
              <div>
                <h4 className="text-sm font-black text-rose-400 uppercase font-chakra tracking-wide">
                  {strings.habits.failedConfirmTitle}
                </h4>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  {pendingHabit?.title[language]}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 mt-3 leading-relaxed">
              {strings.habits.failedConfirmText}
            </p>

            <div className="mt-5 space-y-2">
              {/* Button 1: Consume Strike Freeze */}
              <button
                id="modal-consume-freeze-btn"
                onClick={consumeStrikeFreeze}
                disabled={user.strikeFreezes <= 0}
                className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-chakra font-extrabold text-xs transition-all shadow-md ${
                  user.strikeFreezes > 0
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:brightness-110 active:scale-95'
                    : 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                }`}
              >
                <Shield className="w-4 h-4 text-cyan-200 fill-cyan-300" />
                <span>
                  {strings.habits.useFreezeBtn} ({user.strikeFreezes}{' '}
                  {language === 'ru' ? 'осталось' : 'left'})
                </span>
              </button>

              {/* Button 2: Accept Reset */}
              <button
                id="modal-accept-reset-btn"
                onClick={confirmFailureReset}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-950/60 border border-rose-600/50 hover:bg-rose-900/60 text-rose-300 font-chakra font-bold text-xs transition-all active:scale-95"
              >
                {strings.habits.acceptResetBtn}
              </button>

              {/* Button 3: Cancel */}
              <button
                id="modal-cancel-report-btn"
                onClick={cancelFailureReport}
                className="w-full py-2 px-4 rounded-xl text-slate-400 hover:text-slate-200 text-xs font-semibold"
              >
                {strings.habits.cancelBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
