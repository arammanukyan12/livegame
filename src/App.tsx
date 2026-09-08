import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HabitsTab } from './components/habits/HabitsTab';
import { WorkoutsTab } from './components/workouts/WorkoutsTab';
import { AnalyticsTab } from './components/analytics/AnalyticsTab';
import { StoreTab } from './components/store/StoreTab';

const AppContent: React.FC = () => {
  const { activeTab, toastMessage } = useApp();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-purple-600 selection:text-white relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 max-w-sm w-11/12 px-4 py-2.5 rounded-xl bg-slate-900/95 border border-purple-500/80 text-purple-200 text-xs font-chakra font-bold text-center shadow-xl shadow-purple-950/50 backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-200">
          {toastMessage}
        </div>
      )}

      {/* Fixed Header */}
      <Header />

      {/* Tab Main Container */}
      <main className="flex-1 max-w-md mx-auto w-full px-4 pt-4 pb-20">
        {activeTab === 'habits' && <HabitsTab />}
        {activeTab === 'workouts' && <WorkoutsTab />}
        {activeTab === 'analytics' && <AnalyticsTab />}
        {activeTab === 'store' && <StoreTab />}
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
