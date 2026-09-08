export type Language = 'ru' | 'en';

export type TabType = 'habits' | 'workouts' | 'analytics' | 'store';

export type MuscleGroup = 'chest' | 'back' | 'legs' | 'core' | 'arms';

export interface LocalizedString {
  en: string;
  ru: string;
}

export type ExerciseType = 'reps' | 'isometric' | 'failure';

export interface Exercise {
  id: string;
  name: LocalizedString;
  muscle: MuscleGroup;
  type: ExerciseType;
  target: number; // count of reps or duration in seconds
  sets: number;
  restSeconds: number;
  isToFailure?: boolean;
  description: LocalizedString;
  techniqueTip?: LocalizedString;
  difficulty: 'standard' | 'extreme';
}

export interface WorkoutProgram {
  id: string;
  title: LocalizedString;
  codeName: LocalizedString;
  muscle: MuscleGroup;
  level: 1 | 2;
  isExtreme: boolean;
  estimatedMinutes: number;
  estimatedCalories: number;
  exercises: Exercise[];
  isCustom?: boolean;
}

export interface Habit {
  id: string;
  title: LocalizedString;
  subtitle: LocalizedString;
  category: 'discipline' | 'fitness' | 'nutrition' | 'focus';
  icon: string;
  completed: boolean;
  isKeyHabit?: boolean; // E.g., Daily Extreme Workout
  failCount: number;
}

export interface DayActivityLog {
  date: string; // YYYY-MM-DD
  status: 'completed' | 'failed' | 'frozen' | 'empty';
  completedHabits: number;
  totalHabits: number;
  workoutDone: boolean;
  workoutVolume: number;
  workoutMinutes: number;
  calories: number;
  failedHabitIds: string[];
}

export interface UserProfile {
  id: string | number;
  username: string;
  firstName: string;
  avatarUrl?: string;
  xp: number;
  level: number;
  streak: number;
  bestStreak: number;
  strikeFreezes: number;
  isPro: boolean;
  proExpiresAt?: string;
  hasActiveStake: boolean;
  stakeDaysCompleted: number;
  stakeDaysTotal: number;
  stakeAmount: number;
  badge: 'none' | 'gold_disciplined' | 'titan';
}

export interface MuscleVolumeStats {
  chest: number;
  back: number;
  legs: number;
  core: number;
  arms: number;
}

export interface LeaderboardUser {
  id: string;
  username: string;
  streak: number;
  xp: number;
  hasGoldBadge: boolean;
  isCurrentUser?: boolean;
}
