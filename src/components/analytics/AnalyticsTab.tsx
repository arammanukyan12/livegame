import React, { useState } from 'react';
import {
  Flame,
  Calendar,
  Shield,
  AlertTriangle,
  Zap,
  Clock,
  TrendingUp,
  Award,
  Crown,
  Info,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../i18n/translations';
import { DayActivityLog, MuscleGroup } from '../../types';
import { triggerSelectionHaptic } from '../../utils/telegram';

export const AnalyticsTab: React.FC = () => {
  const { language, activityLogs, muscleStats, habits, user, upgradeToPro } = useApp();
  const strings = getTranslation(language);

  const [heatmapRange, setHeatmapRange] = useState<30 | 90>(30);
  const [selectedDay, setSelectedDay] = useState<DayActivityLog | null>(null);

  // Filter logs for selected range
  const visibleLogs = activityLogs.slice(activityLogs.length - heatmapRange);

  // Muscle Volume calculation
  const muscleValues = [
    muscleStats.chest,
    muscleStats.back,
    muscleStats.legs,
    muscleStats.core,
    muscleStats.arms,
  ];
  const totalVolume = muscleValues.reduce((a, b) => a + b, 0);

  // Radar Chart Calculations for 5 muscles: Chest, Back, Legs, Core, Arms
  const muscles: { id: MuscleGroup; labelEn: string; labelRu: string }[] = [
    { id: 'chest', labelEn: 'Chest', labelRu: 'Грудь' },
    { id: 'back', labelEn: 'Back', labelRu: 'Спина' },
    { id: 'legs', labelEn: 'Legs', labelRu: 'Ноги' },
    { id: 'core', labelEn: 'Core', labelRu: 'Кор' },
    { id: 'arms', labelEn: 'Arms', labelRu: 'Руки' },
  ];

  // Find max muscle volume to normalize radar (0 to 100%)
  const maxMuscleVal = Math.max(...muscleValues, 100);
  const minMuscleVal = Math.min(...muscleValues);
  const laggingMuscleKey = (Object.keys(muscleStats) as MuscleGroup[]).find(
    (k) => muscleStats[k] === minMuscleVal
  ) || 'arms';

  // Radar polygon points (center at 100,100, radius 70)
  const centerX = 100;
  const centerY = 100;
  const radius = 68;

  const getCoordinates = (index: number, total: number, ratio: number) => {
    // Angle in radians (start from top: -PI/2)
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    const x = centerX + radius * ratio * Math.cos(angle);
    const y = centerY + radius * ratio * Math.sin(angle);
    return { x, y };
  };

  // Background grid polygons (25%, 50%, 75%, 100%)
  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  // Data polygon points
  const dataPoints = muscles.map((m, idx) => {
    const val = muscleStats[m.id] || 0;
    const ratio = Math.max(0.2, Math.min(1.0, val / maxMuscleVal));
    return getCoordinates(idx, muscles.length, ratio);
  });

  const polygonPath = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  // Totals
  const totalBurnedCalories = visibleLogs.reduce((acc, log) => acc + log.calories, 0);
  const totalWorkoutMinutes = visibleLogs.reduce((acc, log) => acc + log.workoutMinutes, 0);
  const workoutHours = (totalWorkoutMinutes / 60).toFixed(1);

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Analytics Hero */}
      <section
        id="analytics-hero"
        className="rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-950 border border-indigo-500/30 p-4 shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-indigo-400 font-chakra">
              {strings.analytics.title}
            </span>
            <p className="text-xs text-slate-300 mt-1">
              {strings.analytics.subtitle}
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Top 3 Core Combat Metrics */}
        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-indigo-900/40 text-center">
          <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 font-chakra block truncate">
              {strings.analytics.totalVolumeReps}
            </span>
            <span className="text-base font-black font-chakra text-purple-400 mt-0.5 block">
              {totalVolume.toLocaleString()}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 font-chakra block truncate">
              {strings.analytics.totalCalories}
            </span>
            <span className="text-base font-black font-chakra text-amber-400 mt-0.5 block">
              {totalBurnedCalories.toLocaleString()}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 font-chakra block truncate">
              {strings.analytics.totalWorkoutHours}
            </span>
            <span className="text-base font-black font-chakra text-emerald-400 mt-0.5 block">
              {workoutHours}h
            </span>
          </div>
        </div>
      </section>

      {/* GitHub-style Consistency Heatmap Matrix */}
      <section
        id="consistency-heatmap-section"
        className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-black uppercase text-slate-100 font-chakra tracking-wider">
              {strings.analytics.heatmapTitle}
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              {language === 'ru' ? 'Зеленый = Выполнено, Красный = Срыв, Голубой = Заморозка' : 'Green = Complete, Red = Failed, Blue = Frozen'}
            </span>
          </div>

          {/* Range Selector: 30 Days vs 90 Days (PRO) */}
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-950 border border-slate-800">
            <button
              onClick={() => {
                triggerSelectionHaptic();
                setHeatmapRange(30);
              }}
              className={`px-2 py-1 rounded text-[11px] font-chakra font-bold transition-all ${
                heatmapRange === 30
                  ? 'bg-purple-900 text-purple-200 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {strings.analytics.days30}
            </button>

            <button
              onClick={() => {
                triggerSelectionHaptic();
                if (!user.isPro) {
                  upgradeToPro();
                } else {
                  setHeatmapRange(90);
                }
              }}
              className={`px-2 py-1 rounded text-[11px] font-chakra font-bold transition-all flex items-center gap-1 ${
                heatmapRange === 90
                  ? 'bg-purple-900 text-purple-200 shadow-sm'
                  : 'text-slate-400 hover:text-purple-300'
              }`}
            >
              {!user.isPro && <Crown className="w-3 h-3 text-amber-400" />}
              {strings.analytics.days90}
            </button>
          </div>
        </div>

        {/* Matrix Grid */}
        <div className="overflow-x-auto pb-1">
          <div
            className="grid gap-1.5 p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 justify-center"
            style={{
              gridTemplateColumns: `repeat(${heatmapRange === 30 ? 10 : 15}, minmax(0, 1fr))`,
            }}
          >
            {visibleLogs.map((log, idx) => {
              let bg = 'bg-slate-800/60 border-slate-700/40';
              if (log.status === 'completed') {
                bg = 'bg-emerald-500 border-emerald-400 shadow-xs shadow-emerald-500/50';
              } else if (log.status === 'failed') {
                bg = 'bg-rose-500 border-rose-400 shadow-xs shadow-rose-500/50 animate-pulse';
              } else if (log.status === 'frozen') {
                bg = 'bg-cyan-400 border-cyan-300 shadow-xs shadow-cyan-400/50';
              }

              const isToday = idx === visibleLogs.length - 1;

              return (
                <button
                  key={log.date + idx}
                  onClick={() => {
                    triggerSelectionHaptic();
                    setSelectedDay(log);
                  }}
                  className={`w-5 h-5 rounded-md border transition-all hover:scale-125 ${bg} ${
                    isToday ? 'ring-2 ring-purple-400 ring-offset-1 ring-offset-slate-950' : ''
                  }`}
                  title={`${log.date}: ${log.status} (${log.completedHabits}/${log.totalHabits} habits)`}
                />
              );
            })}
          </div>
        </div>

        {/* Matrix Legend */}
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 flex-wrap gap-2">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
            <span>{strings.analytics.legendCompleted}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-cyan-400 inline-block" />
            <span>{strings.analytics.legendFrozen}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-rose-500 inline-block" />
            <span>{strings.analytics.legendFailed}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-slate-800 inline-block" />
            <span>{strings.analytics.legendEmpty}</span>
          </div>
        </div>

        {/* Day Detail Card if selected */}
        {selectedDay && (
          <div className="p-3 rounded-xl bg-slate-950 border border-purple-500/40 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-slate-200 font-chakra">
                {selectedDay.date}
              </span>
              <span className="text-slate-400 ml-2 font-mono">
                {selectedDay.completedHabits} / {selectedDay.totalHabits} {language === 'ru' ? 'привычек' : 'habits'}
              </span>
              {selectedDay.failedHabitIds.length > 0 && (
                <p className="text-rose-400 text-[11px] mt-0.5">
                  {language === 'ru' ? 'Срыв на:' : 'Failed on:'} {selectedDay.failedHabitIds.join(', ')}
                </p>
              )}
            </div>
            <button
              onClick={() => setSelectedDay(null)}
              className="text-slate-500 hover:text-slate-300 text-xs"
            >
              ✕
            </button>
          </div>
        )}
      </section>

      {/* Muscle Radar Chart & Balance Breakdown */}
      <section
        id="muscle-radar-section"
        className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-black uppercase text-slate-100 font-chakra tracking-wider">
              {strings.analytics.radarTitle}
            </h3>
            <p className="text-[11px] text-slate-400 leading-tight">
              {strings.analytics.radarDesc}
            </p>
          </div>
          <div className="p-1.5 rounded-lg bg-purple-950 text-purple-400 border border-purple-500/30">
            <Award className="w-4 h-4" />
          </div>
        </div>

        {/* SVG Radar Visualizer */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
          <div className="w-56 h-56 shrink-0 relative">
            <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
              {/* Background concentric grid levels */}
              {gridLevels.map((lvl) => {
                const pts = muscles
                  .map((_, i) => {
                    const c = getCoordinates(i, muscles.length, lvl);
                    return `${c.x},${c.y}`;
                  })
                  .join(' ');
                return (
                  <polygon
                    key={lvl}
                    points={pts}
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="1.2"
                  />
                );
              })}

              {/* Radial Axis Lines */}
              {muscles.map((_, i) => {
                const c = getCoordinates(i, muscles.length, 1.0);
                return (
                  <line
                    key={i}
                    x1={centerX}
                    y1={centerY}
                    x2={c.x}
                    y2={c.y}
                    stroke="#334155"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                  />
                );
              })}

              {/* Data Area Fill & Stroke */}
              <polygon
                points={polygonPath}
                fill="rgba(168, 85, 247, 0.25)"
                stroke="#a855f7"
                strokeWidth="2.5"
              />

              {/* Data Vertices Points */}
              {dataPoints.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r="3.5"
                  className="fill-emerald-400 stroke-slate-950"
                  strokeWidth="1.5"
                />
              ))}

              {/* Muscle Labels around edges */}
              {muscles.map((m, i) => {
                const labelCoord = getCoordinates(i, muscles.length, 1.25);
                return (
                  <text
                    key={m.id}
                    x={labelCoord.x}
                    y={labelCoord.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="text-[10px] font-chakra font-bold fill-slate-300"
                  >
                    {language === 'ru' ? m.labelRu : m.labelEn}
                  </text>
                );
              })}
            </svg>
          </div>

          {/* Muscle Breakdown Progress Bars */}
          <div className="w-full space-y-2">
            {muscles.map((m) => {
              const val = muscleStats[m.id] || 0;
              const percent = Math.round((val / maxMuscleVal) * 100);
              const isLagging = m.id === laggingMuscleKey;

              return (
                <div key={m.id} className="text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-300 font-chakra">
                      {language === 'ru' ? m.labelRu : m.labelEn}
                    </span>
                    <div className="flex items-center gap-1.5 font-mono">
                      {isLagging && (
                        <span className="text-[9px] font-black uppercase text-amber-400 px-1 rounded bg-amber-950/80 border border-amber-500/30">
                          {strings.analytics.laggingMuscleNotice}
                        </span>
                      )}
                      <span className="font-bold text-slate-200">{val} reps</span>
                    </div>
                  </div>

                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden mt-1 border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isLagging
                          ? 'bg-amber-400'
                          : 'bg-gradient-to-r from-purple-500 to-emerald-400'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Discipline Failure Analysis Breakdown */}
      <section
        id="failure-analysis-section"
        className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-black uppercase text-slate-100 font-chakra tracking-wider">
              {strings.analytics.failureAnalysisTitle}
            </h3>
            <p className="text-[11px] text-slate-400">
              {strings.analytics.failureAnalysisDesc}
            </p>
          </div>
          <div className="p-1.5 rounded-lg bg-rose-950 text-rose-400 border border-rose-500/30">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>

        <div className="space-y-2 pt-1">
          {habits.map((h) => {
            return (
              <div
                key={h.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs"
              >
                <span className="font-semibold text-slate-200 font-chakra">
                  {h.title[language]}
                </span>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                      h.failCount > 0
                        ? 'bg-rose-950/80 text-rose-400 border border-rose-600/40'
                        : 'bg-emerald-950/60 text-emerald-400 border border-emerald-600/30'
                    }`}
                  >
                    {language === 'ru'
                      ? `Срывов: ${h.failCount}`
                      : `${h.failCount} ${strings.analytics.failedTimes}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
