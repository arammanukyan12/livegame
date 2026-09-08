import React from 'react';
import { Trophy, Dumbbell, BarChart3, Gem } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../i18n/translations';
import { TabType } from '../types';
import { triggerHaptic } from '../utils/telegram';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, language, habits, user } = useApp();
  const strings = getTranslation(language);

  const pendingHabitsCount = habits.filter((h) => !h.completed).length;

  const tabs: { id: TabType; label: string; icon: React.ReactNode; badge?: number | string }[] = [
    {
      id: 'habits',
      label: strings.tabs.habits,
      icon: <Trophy className="w-5 h-5" />,
      badge: pendingHabitsCount > 0 ? pendingHabitsCount : undefined,
    },
    {
      id: 'workouts',
      label: strings.tabs.workouts,
      icon: <Dumbbell className="w-5 h-5" />,
      badge: undefined,
    },
    {
      id: 'analytics',
      label: strings.tabs.analytics,
      icon: <BarChart3 className="w-5 h-5" />,
      badge: undefined,
    },
    {
      id: 'store',
      label: strings.tabs.store,
      icon: <Gem className="w-5 h-5" />,
      badge: user.isPro ? 'PRO' : '$5',
    },
  ];

  const handleSelectTab = (tabId: TabType) => {
    triggerHaptic('light');
    setActiveTab(tabId);
  };

  return (
    <nav
      id="bottom-navigation-bar"
      className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 safe-area-pb"
    >
      <div className="max-w-md mx-auto grid grid-cols-4 px-2 py-1.5">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => handleSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-purple-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              {/* Active subtle glowing indicator */}
              {isActive && (
                <span className="absolute -top-1.5 w-6 h-0.5 rounded-full bg-gradient-to-r from-purple-500 to-emerald-400 shadow-sm shadow-purple-500/50" />
              )}

              <div className="relative">
                <div
                  className={`p-1 rounded-lg transition-transform ${
                    isActive ? 'scale-110 text-purple-400' : 'text-slate-400'
                  }`}
                >
                  {tab.icon}
                </div>

                {tab.badge !== undefined && (
                  <span
                    className={`absolute -top-1 -right-2 text-[10px] font-black px-1.5 py-0.2 rounded-full leading-tight font-mono ${
                      typeof tab.badge === 'string'
                        ? 'bg-gradient-to-r from-amber-500 to-purple-600 text-white'
                        : 'bg-emerald-500 text-slate-950 shadow-sm'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>

              <span className="text-[11px] tracking-tight mt-0.5 truncate max-w-[70px]">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
