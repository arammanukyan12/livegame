import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Language,
  TabType,
  UserProfile,
  Habit,
  WorkoutProgram,
  DayActivityLog,
  MuscleVolumeStats,
  LeaderboardUser,
  MuscleGroup,
} from '../types';
import { DEFAULT_WORKOUT_PROGRAMS } from '../data/workouts';
import { getTranslation } from '../i18n/translations';
import {
  initTelegramApp,
  getTelegramUser,
  triggerHaptic,
  triggerNotificationHaptic,
  triggerSelectionHaptic,
} from '../utils/telegram';
import { sound } from '../utils/sound';

interface AppContextType {
  language: Language;
  toggleLanguage: () => void;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  user: UserProfile;
  habits: Habit[];
  toggleHabit: (id: string) => void;
  reportHabitFailure: (habitId: string) => void;
  pendingFailureHabitId: string | null;
  cancelFailureReport: () => void;
  confirmFailureReset: () => void;
  consumeStrikeFreeze: () => boolean;
  workoutPrograms: WorkoutProgram[];
  activeWorkout: WorkoutProgram | null;
  startWorkout: (program: WorkoutProgram) => void;
  finishActiveWorkout: (volume: number, durationMinutes: number, calories: number, muscle: MuscleGroup) => void;
  cancelWorkout: () => void;
  addCustomWorkout: (program: WorkoutProgram) => void;
  deleteCustomWorkout: (id: string) => void;
  activityLogs: DayActivityLog[];
  muscleStats: MuscleVolumeStats;
  upgradeToPro: () => void;
  buyStrikeFreeze: (qty?: number) => void;
  joinStakingChallenge: () => void;
  leaderboard: LeaderboardUser[];
  soundEnabled: boolean;
  toggleSound: () => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_HABITS: Habit[] = [
  {
    id: 'early_rise',
    title: { en: '05:00 Early Rise', ru: 'Подъём до 05:30' },
    subtitle: { en: 'Conquer the morning before the world wakes', ru: 'Покори утро до пробуждения мира' },
    category: 'discipline',
    icon: 'Sun',
    completed: true,
    failCount: 4,
  },
  {
    id: 'extreme_workout',
    title: { en: 'Daily Extreme Workout', ru: 'Экстремальная Тренировка' },
    subtitle: { en: 'Complete brutal HIIT, isometric, or failure set routine', ru: 'Пройди брутальный комплекс упражнений' },
    category: 'fitness',
    icon: 'Dumbbell',
    completed: false,
    isKeyHabit: true,
    failCount: 2,
  },
  {
    id: 'cold_shower',
    title: { en: 'Cold Ice Shower', ru: 'Ледяной Контрастный Душ' },
    subtitle: { en: '3 minutes of pure unyielding icy water shock', ru: '3 минуты ледяного шока и закалки воли' },
    category: 'discipline',
    icon: 'Droplets',
    completed: true,
    failCount: 3,
  },
  {
    id: 'clean_water',
    title: { en: '3 Liters of Clean Water', ru: '3 Литра Чистой Воды' },
    subtitle: { en: 'Total cellular hydration, no sugary drinks', ru: 'Полная гидратация без сахара и химии' },
    category: 'nutrition',
    icon: 'CupSoda',
    completed: true,
    failCount: 1,
  },
  {
    id: 'zero_sugar',
    title: { en: '0 Sugar & 0 Fast-Food', ru: '0 Сахара и Фастфуда' },
    subtitle: { en: 'Zero junk, zero processed spikes, pure warrior fuel', ru: 'Никакого пищевого мусора, чистое топливо' },
    category: 'nutrition',
    icon: 'ShieldBan',
    completed: false,
    failCount: 5,
  },
  {
    id: 'deep_work',
    title: { en: '2 Hours Monastic Deep Work', ru: '2 Часа Глубокого Фокуса' },
    subtitle: { en: 'Zero phone, zero social dopamine, raw execution', ru: 'Без соцсетей и отвлечений, чистое дело' },
    category: 'focus',
    icon: 'Brain',
    completed: true,
    failCount: 2,
  },
];

// Seed realistic 90-day log history
const generateInitialLogs = (): DayActivityLog[] => {
  const logs: DayActivityLog[] = [];
  const now = new Date(2026, 8, 7); // Sep 7, 2026

  for (let i = 89; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    // Status distribution: mostly completed, occasional freeze, rare failure
    let status: 'completed' | 'failed' | 'frozen' | 'empty' = 'completed';
    let workoutDone = true;
    let completedCount = 6;
    let failedIds: string[] = [];

    if (i === 0) {
      // today
      status = 'empty';
      workoutDone = false;
      completedCount = 4;
    } else if (i === 18 || i === 47) {
      status = 'frozen';
      completedCount = 3;
    } else if (i === 62) {
      status = 'failed';
      completedCount = 2;
      failedIds = ['zero_sugar', 'early_rise'];
    } else if (i % 7 === 0) {
      workoutDone = false;
      completedCount = 5;
    }

    logs.push({
      date: dateStr,
      status,
      completedHabits: completedCount,
      totalHabits: 6,
      workoutDone,
      workoutVolume: workoutDone ? Math.floor(140 + (i % 5) * 25) : 0,
      workoutMinutes: workoutDone ? Math.floor(22 + (i % 4) * 4) : 0,
      calories: workoutDone ? Math.floor(280 + (i % 5) * 40) : 0,
      failedHabitIds: failedIds,
    });
  }
  return logs;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('livegame_lang') as Language) || 'ru';
  });

  const [activeTab, setActiveTab] = useState<TabType>('habits');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Telegram User Init
  const [user, setUser] = useState<UserProfile>(() => {
    const tgUser = getTelegramUser();
    const saved = localStorage.getItem('livegame_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {
      id: tgUser.id,
      username: tgUser.username || 'iron_spartan',
      firstName: tgUser.first_name || 'Warrior',
      avatarUrl: tgUser.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      xp: 2840,
      level: 14,
      streak: 18,
      bestStreak: 42,
      strikeFreezes: 2,
      isPro: false,
      hasActiveStake: false,
      stakeDaysCompleted: 0,
      stakeDaysTotal: 14,
      stakeAmount: 0,
      badge: 'none',
    };
  });

  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('livegame_habits');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_HABITS;
  });

  const [pendingFailureHabitId, setPendingFailureHabitId] = useState<string | null>(null);

  const [workoutPrograms, setWorkoutPrograms] = useState<WorkoutProgram[]>(() => {
    const saved = localStorage.getItem('livegame_custom_workouts');
    if (saved) {
      try {
        const customs = JSON.parse(saved);
        return [...DEFAULT_WORKOUT_PROGRAMS, ...customs];
      } catch {}
    }
    return DEFAULT_WORKOUT_PROGRAMS;
  });

  const [activeWorkout, setActiveWorkout] = useState<WorkoutProgram | null>(null);

  const [activityLogs, setActivityLogs] = useState<DayActivityLog[]>(() => {
    const saved = localStorage.getItem('livegame_activity_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return generateInitialLogs();
  });

  const [muscleStats, setMuscleStats] = useState<MuscleVolumeStats>(() => {
    const saved = localStorage.getItem('livegame_muscle_stats');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {
      chest: 2450,
      back: 1890,
      legs: 3200,
      core: 2100,
      arms: 1450, // slightly lagging
    };
  });

  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([
    { id: '1', username: 'Alex_Titan', streak: 74, xp: 9800, hasGoldBadge: true },
    { id: '2', username: 'Iron_Valkyrie', streak: 56, xp: 7400, hasGoldBadge: true },
    { id: '3', username: 'Sergey_Sparta', streak: 43, xp: 6200, hasGoldBadge: true },
    { id: 'curr', username: user.username, streak: user.streak, xp: user.xp, hasGoldBadge: user.badge === 'gold_disciplined', isCurrentUser: true },
    { id: '4', username: 'CyberGrit', streak: 12, xp: 2100, hasGoldBadge: false },
    { id: '5', username: 'Max_Beast', streak: 9, xp: 1750, hasGoldBadge: false },
  ]);

  // Sync state to local storage
  useEffect(() => {
    initTelegramApp();
  }, []);

  useEffect(() => {
    localStorage.setItem('livegame_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('livegame_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('livegame_habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('livegame_muscle_stats', JSON.stringify(muscleStats));
  }, [muscleStats]);

  useEffect(() => {
    localStorage.setItem('livegame_activity_logs', JSON.stringify(activityLogs));
  }, [activityLogs]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const toggleLanguage = () => {
    triggerSelectionHaptic();
    sound.playBeep(900, 0.05);
    setLanguage((prev) => (prev === 'ru' ? 'en' : 'ru'));
  };

  const toggleSound = () => {
    const state = sound.toggleMute();
    setSoundEnabled(state);
    triggerSelectionHaptic();
  };

  const toggleHabit = (id: string) => {
    triggerHaptic('medium');
    sound.playBeep(1100, 0.08);

    setHabits((prev) => {
      const updated = prev.map((h) => (h.id === id ? { ...h, completed: !h.completed } : h));
      const allDone = updated.every((h) => h.completed);

      if (allDone) {
        sound.playSuccess();
        triggerNotificationHaptic('success');
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#a855f7', '#10b981', '#38bdf8', '#f59e0b'],
        });

        setUser((u) => {
          const newXp = u.xp + 100;
          const newLevel = Math.floor(newXp / 250) + 1;
          const newStreak = u.streak + 1;
          const best = Math.max(newStreak, u.bestStreak);
          const stakeCompleted = u.hasActiveStake ? Math.min(u.stakeDaysTotal, u.stakeDaysCompleted + 1) : u.stakeDaysCompleted;
          let earnedBadge = u.badge;
          if (u.hasActiveStake && stakeCompleted >= u.stakeDaysTotal) {
            earnedBadge = 'gold_disciplined';
          }
          return {
            ...u,
            xp: newXp,
            level: newLevel,
            streak: newStreak,
            bestStreak: best,
            stakeDaysCompleted: stakeCompleted,
            badge: earnedBadge,
          };
        });

        // Update today's activity log to completed
        setActivityLogs((logs) => {
          const clone = [...logs];
          if (clone.length > 0) {
            clone[clone.length - 1] = {
              ...clone[clone.length - 1],
              status: 'completed',
              completedHabits: 6,
            };
          }
          return clone;
        });

        const strings = getTranslation(language);
        showToast(strings.habits.allComplete);
      }

      return updated;
    });
  };

  const reportHabitFailure = (habitId: string) => {
    triggerNotificationHaptic('warning');
    sound.playStrikeAlert();
    setPendingFailureHabitId(habitId);
  };

  const cancelFailureReport = () => {
    triggerSelectionHaptic();
    setPendingFailureHabitId(null);
  };

  const consumeStrikeFreeze = (): boolean => {
    if (user.strikeFreezes <= 0) {
      triggerNotificationHaptic('error');
      showToast(getTranslation(language).habits.noFreezesLeft);
      return false;
    }

    triggerNotificationHaptic('success');
    sound.playBeep(1400, 0.2);

    setUser((u) => ({
      ...u,
      strikeFreezes: Math.max(0, u.strikeFreezes - 1),
    }));

    setActivityLogs((logs) => {
      const clone = [...logs];
      if (clone.length > 0) {
        clone[clone.length - 1] = {
          ...clone[clone.length - 1],
          status: 'frozen',
        };
      }
      return clone;
    });

    setPendingFailureHabitId(null);
    showToast(getTranslation(language).habits.streakSavedMsg);
    return true;
  };

  const confirmFailureReset = () => {
    if (!pendingFailureHabitId) return;

    triggerNotificationHaptic('error');
    sound.playStrikeAlert();

    const habitId = pendingFailureHabitId;

    setHabits((prev) =>
      prev.map((h) =>
        h.id === habitId
          ? { ...h, failCount: h.failCount + 1, completed: false }
          : h
      )
    );

    setUser((u) => ({
      ...u,
      streak: 0, // Zero tolerance wipe!
      hasActiveStake: false, // Forfeit stake!
      stakeDaysCompleted: 0,
    }));

    setActivityLogs((logs) => {
      const clone = [...logs];
      if (clone.length > 0) {
        clone[clone.length - 1] = {
          ...clone[clone.length - 1],
          status: 'failed',
          failedHabitIds: [...clone[clone.length - 1].failedHabitIds, habitId],
        };
      }
      return clone;
    });

    setPendingFailureHabitId(null);
    showToast(language === 'ru' ? 'Стрик сброшен до 0. Нулевая толерантность.' : 'Streak wiped to 0. Zero tolerance rule applied.');
  };

  const startWorkout = (program: WorkoutProgram) => {
    triggerHaptic('heavy');
    sound.playGong();
    setActiveWorkout(program);
  };

  const cancelWorkout = () => {
    triggerSelectionHaptic();
    setActiveWorkout(null);
  };

  const finishActiveWorkout = (volume: number, durationMinutes: number, calories: number, muscle: MuscleGroup) => {
    triggerNotificationHaptic('success');
    sound.playSuccess();

    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#a855f7', '#10b981', '#f59e0b', '#ec4899'],
    });

    // Auto-check Daily Extreme Workout habit!
    setHabits((prev) =>
      prev.map((h) => (h.id === 'extreme_workout' ? { ...h, completed: true } : h))
    );

    // Update volume stats
    setMuscleStats((prev) => ({
      ...prev,
      [muscle]: (prev[muscle] || 0) + volume,
    }));

    // Update user stats
    setUser((u) => {
      const newXp = u.xp + 150;
      const newLevel = Math.floor(newXp / 250) + 1;
      return {
        ...u,
        xp: newXp,
        level: newLevel,
      };
    });

    // Update today's activity log
    setActivityLogs((logs) => {
      const clone = [...logs];
      if (clone.length > 0) {
        const last = clone[clone.length - 1];
        clone[clone.length - 1] = {
          ...last,
          workoutDone: true,
          workoutVolume: last.workoutVolume + volume,
          workoutMinutes: last.workoutMinutes + durationMinutes,
          calories: last.calories + calories,
        };
      }
      return clone;
    });

    setActiveWorkout(null);
    showToast(language === 'ru' ? '+150 XP! Тренировка засчитана в привычки.' : '+150 XP! Workout auto-checked in Habits.');
  };

  const addCustomWorkout = (program: WorkoutProgram) => {
    triggerNotificationHaptic('success');
    sound.playSuccess();

    setWorkoutPrograms((prev) => {
      const next = [program, ...prev];
      const customs = next.filter((p) => p.isCustom);
      localStorage.setItem('livegame_custom_workouts', JSON.stringify(customs));
      return next;
    });

    showToast(language === 'ru' ? 'Кастомная программа добавлена!' : 'Custom brutal routine saved!');
  };

  const deleteCustomWorkout = (id: string) => {
    triggerHaptic('medium');
    setWorkoutPrograms((prev) => {
      const next = prev.filter((p) => p.id !== id);
      const customs = next.filter((p) => p.isCustom);
      localStorage.setItem('livegame_custom_workouts', JSON.stringify(customs));
      return next;
    });
  };

  const upgradeToPro = () => {
    triggerNotificationHaptic('success');
    sound.playSuccess();
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.4 },
      colors: ['#ffd700', '#a855f7', '#10b981'],
    });

    setUser((u) => ({
      ...u,
      isPro: true,
      proExpiresAt: '2027-09-07',
      strikeFreezes: u.strikeFreezes + 2, // Bonus 2 Freezes
    }));

    showToast(getTranslation(language).store.paymentSuccess);
  };

  const buyStrikeFreeze = (qty = 1) => {
    triggerNotificationHaptic('success');
    sound.playBeep(1300, 0.15);

    setUser((u) => ({
      ...u,
      strikeFreezes: u.strikeFreezes + qty,
    }));

    showToast(getTranslation(language).store.freezePurchased);
  };

  const joinStakingChallenge = () => {
    triggerNotificationHaptic('success');
    sound.playGong();

    setUser((u) => ({
      ...u,
      hasActiveStake: true,
      stakeDaysCompleted: 0,
      stakeDaysTotal: 14,
      stakeAmount: 5,
    }));

    showToast(getTranslation(language).store.stakeStarted);
  };

  return (
    <AppContext.Provider
      value={{
        language,
        toggleLanguage,
        activeTab,
        setActiveTab,
        user,
        habits,
        toggleHabit,
        reportHabitFailure,
        pendingFailureHabitId,
        cancelFailureReport,
        confirmFailureReset,
        consumeStrikeFreeze,
        workoutPrograms,
        activeWorkout,
        startWorkout,
        finishActiveWorkout,
        cancelWorkout,
        addCustomWorkout,
        deleteCustomWorkout,
        activityLogs,
        muscleStats,
        upgradeToPro,
        buyStrikeFreeze,
        joinStakingChallenge,
        leaderboard,
        soundEnabled,
        toggleSound,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
