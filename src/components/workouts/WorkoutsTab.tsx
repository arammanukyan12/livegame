import React, { useState } from 'react';
import {
  Dumbbell,
  Flame,
  Clock,
  Zap,
  Plus,
  Crown,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  Layers,
  AlertOctagon,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../i18n/translations';
import { MuscleGroup, WorkoutProgram } from '../../types';
import { CustomWorkoutBuilder } from './CustomWorkoutBuilder';
import { WorkoutRunner } from './WorkoutRunner';
import { triggerHaptic } from '../../utils/telegram';

export const WorkoutsTab: React.FC = () => {
  const { language, workoutPrograms, activeWorkout, startWorkout, cancelWorkout, user } = useApp();
  const strings = getTranslation(language);

  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | 'all'>('all');
  const [selectedLevel, setSelectedLevel] = useState<1 | 2 | 'all'>('all');
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);

  // Filter programs
  const filteredPrograms = workoutPrograms.filter((prog) => {
    const matchMuscle = selectedMuscle === 'all' || prog.muscle === selectedMuscle;
    const matchLevel = selectedLevel === 'all' || prog.level === selectedLevel;
    return matchMuscle && matchLevel;
  });

  const muscleFilters: { id: MuscleGroup | 'all'; labelEn: string; labelRu: string }[] = [
    { id: 'all', labelEn: 'All Disciplines', labelRu: 'Все мышцы' },
    { id: 'chest', labelEn: 'Chest & Triceps', labelRu: 'Грудь и Трицепс' },
    { id: 'back', labelEn: 'Back & Biceps', labelRu: 'Спина и Бицепс' },
    { id: 'legs', labelEn: 'Legs & Glutes', labelRu: 'Ноги и Ягодицы' },
    { id: 'core', labelEn: 'Abs & Core', labelRu: 'Пресс и Кор' },
  ];

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Active Workout Runner Fullscreen if open */}
      {activeWorkout && (
        <WorkoutRunner program={activeWorkout} onClose={cancelWorkout} />
      )}

      {/* Custom Workout Builder Modal if open */}
      {isBuilderOpen && (
        <CustomWorkoutBuilder onClose={() => setIsBuilderOpen(false)} />
      )}

      {/* Hardcore Hero Header */}
      <section
        id="workouts-hero"
        className="rounded-2xl bg-gradient-to-br from-slate-900 via-purple-950/40 to-slate-950 border border-purple-500/40 p-4 shadow-lg shadow-purple-950/20 relative overflow-hidden"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-purple-400 font-chakra">
                {strings.workouts.title}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-500/30 font-mono">
                EXTREME
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {strings.workouts.subtitle}
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/40 shrink-0">
            <Dumbbell className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        {/* Builder Trigger Button */}
        <div className="mt-3 pt-3 border-t border-purple-900/40 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <Crown className="w-4 h-4 text-amber-400" />
            <span className="font-chakra font-bold">
              {language === 'ru' ? 'Свой брутальный комплекс:' : 'Custom torture routine:'}
            </span>
          </div>

          <button
            id="open-custom-builder-btn"
            onClick={() => {
              triggerHaptic('medium');
              setIsBuilderOpen(true);
            }}
            className="flex items-center gap-1 py-1.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white font-chakra font-extrabold text-xs shadow-md shadow-purple-950/50 active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            {strings.workouts.buildCustomBtn}
          </button>
        </div>
      </section>

      {/* Filters: Muscle & Level */}
      <section id="workout-filters" className="space-y-2">
        {/* Muscle Selector horizontal chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {muscleFilters.map((m) => {
            const isSelected = selectedMuscle === m.id;
            return (
              <button
                key={m.id}
                id={`filter-muscle-${m.id}`}
                onClick={() => {
                  triggerHaptic('light');
                  setSelectedMuscle(m.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-chakra font-bold whitespace-nowrap transition-all border shrink-0 ${
                  isSelected
                    ? 'bg-purple-950 text-purple-300 border-purple-500 shadow-sm'
                    : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {language === 'ru' ? m.labelRu : m.labelEn}
              </button>
            );
          })}
        </div>

        {/* Level Toggle: Volume (Lvl 1) vs Extreme (Lvl 2) */}
        <div className="flex items-center justify-between gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            id="filter-level-all"
            onClick={() => setSelectedLevel('all')}
            className={`flex-1 py-1 px-2 rounded-lg text-xs font-chakra font-bold transition-all ${
              selectedLevel === 'all'
                ? 'bg-slate-800 text-slate-100 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {language === 'ru' ? 'Все уровни' : 'All Levels'}
          </button>

          <button
            id="filter-level-1"
            onClick={() => setSelectedLevel(1)}
            className={`flex-1 py-1 px-2 rounded-lg text-xs font-chakra font-bold transition-all ${
              selectedLevel === 1
                ? 'bg-purple-950 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {strings.workouts.level1}
          </button>

          <button
            id="filter-level-2"
            onClick={() => setSelectedLevel(2)}
            className={`flex-1 py-1 px-2 rounded-lg text-xs font-chakra font-bold transition-all ${
              selectedLevel === 2
                ? 'bg-rose-950 text-rose-300 border border-rose-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {strings.workouts.level2} 🔥
          </button>
        </div>
      </section>

      {/* Programs List */}
      <section id="programs-list" className="space-y-3.5">
        {filteredPrograms.map((program) => {
          return (
            <div
              key={program.id}
              id={`program-card-${program.id}`}
              className={`rounded-2xl border p-4 transition-all duration-200 ${
                program.isExtreme
                  ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-rose-500/40 shadow-md shadow-rose-950/20'
                  : 'bg-slate-900/90 border-slate-800 hover:border-purple-500/30'
              }`}
            >
              {/* Program Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full font-mono ${
                        program.isExtreme
                          ? 'bg-rose-950 text-rose-400 border border-rose-500/50'
                          : 'bg-purple-950 text-purple-300 border border-purple-500/40'
                      }`}
                    >
                      {program.isExtreme
                        ? strings.workouts.extremeBadge
                        : strings.workouts.standardBadge}
                    </span>

                    {program.isCustom && (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-500/40 font-mono">
                        CUSTOM PRO
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-black font-chakra text-slate-100 mt-1.5">
                    {program.title[language]}
                  </h3>
                </div>

                {/* Duration & Calories */}
                <div className="text-right shrink-0">
                  <div className="flex items-center justify-end gap-1 text-xs font-mono font-bold text-amber-400">
                    <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-400" />
                    <span>~{program.estimatedCalories} {strings.workouts.estimatedCal}</span>
                  </div>
                  <div className="flex items-center justify-end gap-1 text-[11px] font-mono text-slate-400 mt-0.5">
                    <Clock className="w-3 h-3" />
                    <span>{program.estimatedMinutes} {strings.workouts.estimatedTime}</span>
                  </div>
                </div>
              </div>

              {/* Exercises Breakdown List */}
              <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2">
                <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 font-chakra flex items-center justify-between">
                  <span>{language === 'ru' ? 'Состав Программы' : 'Routine Breakdown'}</span>
                  <span>{program.exercises.length} {strings.workouts.exercisesCount}</span>
                </div>

                <div className="space-y-1.5">
                  {program.exercises.map((ex, exIdx) => {
                    const isFail = ex.type === 'failure' || ex.isToFailure;
                    return (
                      <div
                        key={ex.id || exIdx}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-5 h-5 rounded-md bg-slate-800 text-slate-300 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                            {exIdx + 1}
                          </span>
                          <span className="font-semibold text-slate-200 truncate">
                            {ex.name[language]}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isFail ? (
                            <span className="text-[10px] font-black text-rose-400 uppercase font-mono px-1.5 py-0.2 rounded bg-rose-950/60 border border-rose-600/40">
                              FAILURE
                            </span>
                          ) : (
                            <span className="text-[11px] font-mono font-bold text-slate-300">
                              {ex.sets > 1 ? `${ex.sets}×` : ''}
                              {ex.type === 'isometric' ? `${ex.target}s hold` : `${ex.target} reps`}
                            </span>
                          )}

                          <span className="text-[10px] font-mono text-slate-400">
                            (Rest {ex.restSeconds}s)
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Start Workout Button */}
              <div className="mt-4">
                <button
                  id={`start-workout-${program.id}`}
                  onClick={() => startWorkout(program)}
                  className={`w-full py-2.5 px-4 rounded-xl font-chakra font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-98 ${
                    program.isExtreme
                      ? 'bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 text-white shadow-rose-950/50 hover:brightness-110'
                      : 'bg-gradient-to-r from-purple-600 to-emerald-500 text-white shadow-purple-950/50 hover:brightness-110'
                  }`}
                >
                  <Zap className="w-4 h-4 fill-current" />
                  {strings.workouts.startWorkout}
                </button>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
};
