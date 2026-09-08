import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Dumbbell,
  Clock,
  Sparkles,
  Crown,
  Check,
  AlertTriangle,
  Flame,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../i18n/translations';
import { MuscleGroup, Exercise, WorkoutProgram, ExerciseType } from '../../types';
import { triggerHaptic } from '../../utils/telegram';

interface CustomWorkoutBuilderProps {
  onClose: () => void;
}

export const CustomWorkoutBuilder: React.FC<CustomWorkoutBuilderProps> = ({ onClose }) => {
  const { language, user, addCustomWorkout, upgradeToPro } = useApp();
  const strings = getTranslation(language);

  // Form State
  const [workoutTitle, setWorkoutTitle] = useState('');
  const [targetMuscle, setTargetMuscle] = useState<MuscleGroup>('chest');
  const [exercises, setExercises] = useState<
    Array<{
      nameEn: string;
      nameRu: string;
      type: ExerciseType;
      target: number;
      sets: number;
      restSeconds: number;
      isToFailure: boolean;
      difficulty: 'standard' | 'extreme';
    }>
  >([
    {
      nameEn: 'Clapping Explosive Push-Ups',
      nameRu: 'Взрывные отжимания с хлопком',
      type: 'reps',
      target: 20,
      sets: 4,
      restSeconds: 15,
      isToFailure: false,
      difficulty: 'extreme',
    },
    {
      nameEn: 'Isometric Wall Sits to Failure',
      nameRu: 'Стульчик у стены до отказа',
      type: 'failure',
      target: 60,
      sets: 3,
      restSeconds: 20,
      isToFailure: true,
      difficulty: 'extreme',
    },
  ]);

  // Current new exercise inputs
  const [newExName, setNewExName] = useState('');
  const [newExType, setNewExType] = useState<ExerciseType>('reps');
  const [newExTarget, setNewExTarget] = useState(25);
  const [newExSets, setNewExSets] = useState(3);
  const [newExRest, setNewExRest] = useState(15);
  const [newExFailure, setNewExFailure] = useState(false);

  const handleAddExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExName.trim()) return;

    triggerHaptic('medium');
    setExercises((prev) => [
      ...prev,
      {
        nameEn: newExName,
        nameRu: newExName,
        type: newExFailure ? 'failure' : newExType,
        target: newExTarget,
        sets: newExSets,
        restSeconds: newExRest,
        isToFailure: newExFailure,
        difficulty: newExFailure || newExRest <= 15 ? 'extreme' : 'standard',
      },
    ]);

    setNewExName('');
    setNewExTarget(20);
    setNewExSets(3);
    setNewExRest(15);
    setNewExFailure(false);
  };

  const handleRemoveExercise = (idx: number) => {
    triggerHaptic('light');
    setExercises((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSaveRoutine = () => {
    if (!workoutTitle.trim()) {
      alert(language === 'ru' ? 'Введите название программы' : 'Enter routine title');
      return;
    }
    if (exercises.length === 0) {
      alert(language === 'ru' ? 'Добавьте хотя бы одно упражнение' : 'Add at least one exercise');
      return;
    }

    const compiledExercises: Exercise[] = exercises.map((ex, i) => ({
      id: `custom_ex_${Date.now()}_${i}`,
      name: { en: ex.nameEn, ru: ex.nameRu },
      muscle: targetMuscle,
      type: ex.type,
      target: ex.target,
      sets: ex.sets,
      restSeconds: ex.restSeconds,
      isToFailure: ex.isToFailure,
      description: {
        en: ex.isToFailure ? 'Custom brutal failure set routine.' : 'Custom intense repetitions.',
        ru: ex.isToFailure ? 'Кастомный отказной сет до упора.' : 'Кастомная интенсивная нагрузка.',
      },
      difficulty: ex.difficulty,
    }));

    const newProgram: WorkoutProgram = {
      id: `custom_prog_${Date.now()}`,
      title: { en: workoutTitle, ru: workoutTitle },
      codeName: { en: `${workoutTitle} (CUSTOM)`, ru: `${workoutTitle} (КАСТОМ)` },
      muscle: targetMuscle,
      level: 2,
      isExtreme: true,
      estimatedMinutes: Math.max(15, exercises.reduce((acc, ex) => acc + ex.sets * 2, 0)),
      estimatedCalories: Math.max(250, exercises.reduce((acc, ex) => acc + ex.sets * 35, 0)),
      exercises: compiledExercises,
      isCustom: true,
    };

    addCustomWorkout(newProgram);
    onClose();
  };

  // If user is not PRO, show PRO Gate preview
  if (!user.isPro) {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-purple-500/60 p-5 shadow-2xl shadow-purple-950/50 space-y-4">
          <div className="flex items-center justify-between">
            <span className="p-2 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/40">
              <Crown className="w-6 h-6" />
            </span>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div>
            <h3 className="text-lg font-black font-chakra text-slate-100 uppercase tracking-wide">
              {strings.workouts.builder.modalTitle}
            </h3>
            <p className="text-xs text-purple-300 font-semibold mt-1">
              {strings.workouts.builder.unlockProPrompt}
            </p>
          </div>

          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{language === 'ru' ? 'Сеты «До отказа» с подтверждением' : 'To-Failure sets with confirmation'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{language === 'ru' ? 'Отдых от 15 секунд (экстремальная лактатная нагрузка)' : 'Ultra-short rest intervals (down to 15s)'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{language === 'ru' ? 'Авто-зачет мандата дня при завершении' : 'Auto-checks key daily habit upon completion'}</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                upgradeToPro();
              }}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-500 text-white font-chakra font-black text-xs uppercase tracking-wider shadow-lg shadow-purple-950/50 active:scale-95"
            >
              {strings.workouts.builder.upgradeToPro}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col justify-between overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-purple-950 text-purple-400 border border-purple-500/40">
            <Dumbbell className="w-4 h-4" />
          </span>
          <h3 className="text-sm font-black font-chakra text-slate-100 uppercase tracking-wide">
            {strings.workouts.builder.modalTitle}
          </h3>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-slate-200"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Builder Form Body */}
      <div className="p-4 flex-1 max-w-md mx-auto w-full space-y-5">
        {/* Routine Name & Muscle */}
        <div className="space-y-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div>
            <label className="text-xs font-bold text-slate-300 font-chakra uppercase tracking-wider">
              {strings.workouts.builder.workoutName}
            </label>
            <input
              type="text"
              value={workoutTitle}
              onChange={(e) => setWorkoutTitle(e.target.value)}
              placeholder={strings.workouts.builder.workoutNamePlaceholder}
              className="w-full mt-1.5 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 font-chakra uppercase tracking-wider">
              {strings.workouts.builder.targetMuscle}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mt-1.5">
              {(['chest', 'back', 'legs', 'core', 'arms'] as MuscleGroup[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setTargetMuscle(m)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-chakra font-semibold capitalize border transition-all ${
                    targetMuscle === m
                      ? 'bg-purple-950 text-purple-300 border-purple-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  {strings.workouts.builder[m]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Existing Exercises in Routine */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase text-slate-400 font-chakra tracking-wider">
              {language === 'ru' ? 'Упражнения в Программе' : 'Routine Exercises'} ({exercises.length})
            </h4>
          </div>

          {exercises.map((ex, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-900/90 border border-slate-800"
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold font-chakra text-slate-100">
                    {language === 'ru' ? ex.nameRu : ex.nameEn}
                  </span>
                  {ex.isToFailure && (
                    <span className="text-[9px] font-black uppercase px-1 py-0.2 rounded bg-rose-950 text-rose-400 border border-rose-600/40">
                      FAILURE
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  {ex.sets} sets × {ex.target} {ex.type === 'isometric' ? 's' : 'reps'} | Rest: {ex.restSeconds}s
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleRemoveExercise(idx)}
                className="p-1.5 text-slate-500 hover:text-rose-400"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Add New Exercise Sub-form */}
        <form
          onSubmit={handleAddExercise}
          className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-purple-400 font-chakra">
              {language === 'ru' ? 'Добавить Новое Упражнение' : 'Add New Exercise'}
            </span>
          </div>

          <div>
            <input
              type="text"
              value={newExName}
              onChange={(e) => setNewExName(e.target.value)}
              placeholder={strings.workouts.builder.exerciseName}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-mono">
                {strings.workouts.builder.setsCount}
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={newExSets}
                onChange={(e) => setNewExSets(parseInt(e.target.value) || 1)}
                className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 uppercase font-mono">
                {newExType === 'isometric' ? 'Seconds' : 'Target Reps'}
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={newExTarget}
                onChange={(e) => setNewExTarget(parseInt(e.target.value) || 1)}
                className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 uppercase font-mono">
                Rest (Seconds)
              </label>
              <input
                type="number"
                min="10"
                max="180"
                step="5"
                value={newExRest}
                onChange={(e) => setNewExRest(parseInt(e.target.value) || 15)}
                className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs font-mono"
              />
            </div>
          </div>

          {newExRest <= 15 && (
            <p className="text-[10px] text-rose-400 flex items-center gap-1 font-mono">
              <Flame className="w-3 h-3" />
              {strings.workouts.builder.rest15Notice}
            </p>
          )}

          {/* Exercise Type options & To Failure toggle */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setNewExType('reps')}
                className={`px-2 py-1 rounded text-[11px] font-chakra font-bold border ${
                  newExType === 'reps'
                    ? 'bg-purple-950 text-purple-300 border-purple-500'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                Reps
              </button>
              <button
                type="button"
                onClick={() => setNewExType('isometric')}
                className={`px-2 py-1 rounded text-[11px] font-chakra font-bold border ${
                  newExType === 'isometric'
                    ? 'bg-purple-950 text-purple-300 border-purple-500'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                Isometric
              </button>
            </div>

            {/* To Failure Mode Toggle */}
            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-rose-400 font-chakra">
              <input
                type="checkbox"
                checked={newExFailure}
                onChange={(e) => setNewExFailure(e.target.checked)}
                className="rounded border-rose-500 text-rose-600 focus:ring-rose-500"
              />
              <span>To Failure</span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 font-chakra font-bold text-xs flex items-center justify-center gap-1"
          >
            <Plus className="w-4 h-4" />
            {strings.workouts.builder.addExerciseBtn}
          </button>
        </form>
      </div>

      {/* Bottom Save Button */}
      <div className="sticky bottom-0 p-4 border-t border-slate-800 bg-slate-950">
        <button
          onClick={handleSaveRoutine}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-emerald-500 hover:brightness-110 text-white font-chakra font-black text-sm uppercase tracking-wide shadow-lg active:scale-98"
        >
          {strings.workouts.builder.saveRoutineBtn}
        </button>
      </div>
    </div>
  );
};
