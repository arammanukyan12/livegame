import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Flame,
  Dumbbell,
  Timer,
  AlertOctagon,
  ChevronRight,
  Trophy,
  Volume2,
} from 'lucide-react';
import { WorkoutProgram, Exercise } from '../../types';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../i18n/translations';
import { sound } from '../../utils/sound';
import { triggerHaptic, triggerNotificationHaptic } from '../../utils/telegram';

interface WorkoutRunnerProps {
  program: WorkoutProgram;
  onClose: () => void;
}

export const WorkoutRunner: React.FC<WorkoutRunnerProps> = ({ program, onClose }) => {
  const { language, finishActiveWorkout } = useApp();
  const strings = getTranslation(language);

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [restSecondsLeft, setRestSecondsLeft] = useState(0);

  // Isometric hold timer
  const [holdSecondsLeft, setHoldSecondsLeft] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Total session tracking
  const [sessionStartTime] = useState(Date.now());
  const [totalRepsAccumulated, setTotalRepsAccumulated] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFailureConfirm, setShowFailureConfirm] = useState(false);

  const currentExercise: Exercise = program.exercises[currentExerciseIndex];
  const isIsometric = currentExercise.type === 'isometric';
  const isFailure = currentExercise.type === 'failure' || currentExercise.isToFailure;

  // Init timer when switching to an isometric exercise
  useEffect(() => {
    if (isIsometric) {
      setHoldSecondsLeft(currentExercise.target);
      setIsTimerRunning(false);
    } else {
      setHoldSecondsLeft(null);
      setIsTimerRunning(false);
    }
  }, [currentExerciseIndex, currentSet]);

  // Isometric timer countdown loop
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && holdSecondsLeft !== null && holdSecondsLeft > 0) {
      interval = setInterval(() => {
        setHoldSecondsLeft((prev) => {
          if (prev === null) return 0;
          if (prev <= 1) {
            sound.playGong();
            triggerNotificationHaptic('success');
            return 0;
          }
          if (prev <= 4) {
            sound.playTick();
            triggerHaptic('medium');
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, holdSecondsLeft]);

  // Rest timer countdown loop
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isResting && restSecondsLeft > 0) {
      interval = setInterval(() => {
        setRestSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsResting(false);
            sound.playGong();
            triggerNotificationHaptic('success');
            return 0;
          }
          if (prev <= 3) {
            sound.playTick();
            triggerHaptic('light');
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isResting, restSecondsLeft]);

  const advanceSetOrExercise = (repsToAdd: number) => {
    triggerHaptic('heavy');
    sound.playBeep(1200, 0.1);

    setTotalRepsAccumulated((prev) => prev + repsToAdd);

    // If there are more sets in this exercise
    if (currentSet < currentExercise.sets) {
      setCurrentSet((s) => s + 1);
      // Start rest period
      setIsResting(true);
      setRestSecondsLeft(currentExercise.restSeconds);
    } else {
      // Completed all sets of this exercise!
      if (currentExerciseIndex < program.exercises.length - 1) {
        setCurrentExerciseIndex((e) => e + 1);
        setCurrentSet(1);
        setIsResting(true);
        setRestSecondsLeft(currentExercise.restSeconds);
      } else {
        // Workout Finished!
        setIsCompleted(true);
        triggerNotificationHaptic('success');
        sound.playSuccess();
      }
    }
  };

  const handleFinishSet = () => {
    if (isFailure) {
      setShowFailureConfirm(true);
      return;
    }

    const reps = isIsometric ? 1 : currentExercise.target;
    advanceSetOrExercise(reps);
  };

  const handleConfirmFailure = () => {
    setShowFailureConfirm(false);
    advanceSetOrExercise(currentExercise.target);
  };

  const handleClaimVictory = () => {
    const elapsedMinutes = Math.max(1, Math.round((Date.now() - sessionStartTime) / 60000));
    const volume = Math.max(totalRepsAccumulated, program.estimatedCalories / 2);
    finishActiveWorkout(volume, elapsedMinutes, program.estimatedCalories, program.muscle);
  };

  return (
    <div
      id="workout-runner-modal"
      className="fixed inset-0 z-50 bg-slate-950 flex flex-col justify-between overflow-y-auto"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-purple-950/80 text-purple-400 border border-purple-500/30">
            <Dumbbell className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-xs font-black font-chakra text-slate-100 uppercase tracking-wide">
              {program.codeName[language]}
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              {strings.workouts.runner.exerciseOf} {currentExerciseIndex + 1} {strings.workouts.runner.of} {program.exercises.length}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          aria-label="Abort Workout"
          className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content Area */}
      {!isCompleted ? (
        <div className="p-4 flex-1 flex flex-col justify-center max-w-md mx-auto w-full space-y-6">
          {/* Rest Overlay or Active Exercise */}
          {isResting ? (
            <div className="text-center py-8 space-y-4 animate-in fade-in">
              <span className="text-xs font-black tracking-widest text-cyan-400 uppercase font-chakra">
                {strings.workouts.runner.rest}
              </span>

              {/* Large Circular Rest Timer */}
              <div className="relative w-40 h-40 mx-auto flex items-center justify-center rounded-full border-4 border-cyan-500/30 bg-cyan-950/20 shadow-xl shadow-cyan-950/40">
                <span className="text-5xl font-black font-chakra text-cyan-300">
                  {restSecondsLeft}
                  <span className="text-xl text-cyan-500 font-normal">s</span>
                </span>
              </div>

              <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto">
                {language === 'ru'
                  ? 'Глубокий вдох носом, выдох ртом. Готовься к следующему подходу.'
                  : 'Deep nasal inhale, full exhale. Prepare mentally for the next set.'}
              </p>

              <button
                onClick={() => {
                  setIsResting(false);
                  sound.playGong();
                }}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold font-chakra border border-slate-700 active:scale-95 transition-all"
              >
                {language === 'ru' ? 'Пропустить отдых' : 'Skip Rest'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Exercise Card */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-purple-500/30 shadow-lg shadow-purple-950/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-500/40 uppercase font-chakra tracking-wider">
                    {strings.workouts.runner.setOf} {currentSet} / {currentExercise.sets}
                  </span>

                  {isFailure ? (
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-rose-950/80 text-rose-400 border border-rose-500/50 flex items-center gap-1 font-mono">
                      <AlertOctagon className="w-3 h-3" />
                      {strings.workouts.failureSet}
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-slate-400 font-mono">
                      {isIsometric
                        ? `${currentExercise.target}s ${strings.workouts.isometricHold}`
                        : `${currentExercise.target} ${strings.workouts.repsTarget}`}
                    </span>
                  )}
                </div>

                <h2 className="text-xl font-extrabold font-chakra text-slate-100 mt-2">
                  {currentExercise.name[language]}
                </h2>

                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  {currentExercise.description[language]}
                </p>

                {currentExercise.techniqueTip && (
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-emerald-400 font-medium flex items-start gap-2">
                    <span className="font-bold shrink-0">💡 TIP:</span>
                    <span>{currentExercise.techniqueTip[language]}</span>
                  </div>
                )}
              </div>

              {/* Dynamic Action: Isometric Countdown OR Reps Counter */}
              {isIsometric ? (
                <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 text-center space-y-4">
                  <div className="text-4xl font-black font-chakra text-amber-400">
                    {holdSecondsLeft}
                    <span className="text-lg text-slate-500 font-normal">s</span>
                  </div>

                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => {
                        setIsTimerRunning((r) => !r);
                        triggerHaptic('medium');
                        sound.playBeep(1000, 0.05);
                      }}
                      className="px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-chakra font-extrabold text-xs flex items-center gap-1.5 active:scale-95 shadow-md shadow-amber-500/20"
                    >
                      {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      {isTimerRunning ? 'PAUSE' : 'START HOLD TIMER'}
                    </button>

                    <button
                      onClick={() => {
                        setHoldSecondsLeft(currentExercise.target);
                        setIsTimerRunning(false);
                      }}
                      className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-slate-200"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Progress Dots across sets */}
              <div className="flex items-center justify-center gap-2 pt-2">
                {Array.from({ length: currentExercise.sets }).map((_, idx) => (
                  <span
                    key={idx}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx + 1 < currentSet
                        ? 'w-6 bg-emerald-500'
                        : idx + 1 === currentSet
                        ? 'w-8 bg-purple-500 animate-pulse'
                        : 'w-2.5 bg-slate-800'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Victory Completion Screen */
        <div className="p-6 flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto w-full space-y-5 animate-in zoom-in-95 duration-300">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-600 to-emerald-400 flex items-center justify-center shadow-2xl shadow-purple-600/50 animate-glow-purple">
              <Trophy className="w-10 h-10 text-white fill-white" />
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-black font-chakra text-slate-100 tracking-wide">
              {strings.workouts.runner.congratsTitle}
            </h2>
            <p className="text-xs text-slate-300 mt-1.5 max-w-xs leading-relaxed">
              {strings.workouts.runner.congratsSub}
            </p>
          </div>

          {/* Stats summary */}
          <div className="w-full grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-chakra">
                {strings.workouts.runner.burnedEst}
              </span>
              <div className="text-lg font-black font-chakra text-amber-400 mt-0.5">
                ~{program.estimatedCalories} kcal
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-chakra">
                {strings.workouts.runner.totalVolume}
              </span>
              <div className="text-lg font-black font-chakra text-emerald-400 mt-0.5">
                {totalRepsAccumulated > 0 ? totalRepsAccumulated : program.estimatedCalories / 2} reps
              </div>
            </div>
          </div>

          {/* Big Claim Victory Button */}
          <button
            id="claim-workout-victory-btn"
            onClick={handleClaimVictory}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-500 hover:brightness-110 text-white font-chakra font-black text-sm tracking-wide shadow-xl shadow-purple-950/50 active:scale-98 transition-all"
          >
            {strings.workouts.runner.claimXp}
          </button>
        </div>
      )}

      {/* Bottom Finish Set Controls */}
      {!isCompleted && !isResting && (
        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <button
            id="finish-set-btn"
            onClick={handleFinishSet}
            className={`w-full py-3 px-4 rounded-xl font-chakra font-black text-sm uppercase tracking-wide transition-all shadow-lg active:scale-98 ${
              isFailure
                ? 'bg-gradient-to-r from-rose-600 to-orange-600 text-white shadow-rose-950/60'
                : 'bg-gradient-to-r from-purple-600 to-emerald-500 text-white shadow-purple-950/50'
            }`}
          >
            {isFailure
              ? strings.workouts.runner.confirmFailure
              : strings.workouts.runner.finishSet}
          </button>
        </div>
      )}

      {/* Failure Confirmation Dialog */}
      {showFailureConfirm && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-rose-500 p-5 shadow-2xl shadow-rose-950/60 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-600/20 text-rose-400 border border-rose-500/40">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-black font-chakra text-rose-400 uppercase">
                {language === 'ru' ? 'ПОДТВЕРЖДЕНИЕ ОТКАЗА' : 'CONFIRM MECHANICAL FAILURE'}
              </h4>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {language === 'ru'
                ? 'Вы подтверждаете, что выполнили упражнение до абсолютного отказа мышц, и следующее повторение было физически невозможно?'
                : 'Do you confirm you pushed until mechanical failure where another strict rep was physically impossible?'}
            </p>

            <div className="flex gap-2">
              <button
                onClick={handleConfirmFailure}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-chakra font-bold text-xs active:scale-95"
              >
                {language === 'ru' ? 'Да, это был отказ!' : 'Yes, true failure!'}
              </button>
              <button
                onClick={() => setShowFailureConfirm(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-chakra font-bold text-xs"
              >
                {language === 'ru' ? 'Отмена' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
