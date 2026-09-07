import React from 'react';
import { AppTab } from '../types';
import { Gauge, BookOpen, Sliders, Activity } from 'lucide-react';

interface IosTabBarProps {
  currentTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  isLicenseLoss?: boolean;
}

export const IosTabBar: React.FC<IosTabBarProps> = ({
  currentTab,
  onSelectTab,
  isLicenseLoss = false,
}) => {
  const tabs: { id: AppTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'speedometer',
      label: 'PRĘDKOŚĆ',
      icon: <Gauge className="w-4 h-4" />,
    },
    {
      id: 'database',
      label: 'TARYFIKATOR',
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      id: 'simulator',
      label: 'SYMULATOR',
      icon: <Sliders className="w-4 h-4" />,
    },
    {
      id: 'stats',
      label: 'TRASA',
      icon: <Activity className="w-4 h-4" />,
    },
  ];

  return (
    <nav
      id="ios-bottom-navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur border-t border-[#141414] pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-1 select-none"
    >
      <div className="max-w-md mx-auto flex items-center justify-around px-2">
        {tabs.map((t) => {
          const isActive = currentTab === t.id;
          return (
            <button
              key={t.id}
              id={`tab-btn-${t.id}`}
              onClick={() => onSelectTab(t.id)}
              className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl transition font-mono ${
                isActive
                  ? 'text-[#FF4F00]'
                  : 'text-zinc-600 hover:text-zinc-300'
              }`}
            >
              <div
                className={`relative p-1 transition-transform ${
                  isActive ? 'scale-110' : ''
                }`}
              >
                {t.icon}
                {isLicenseLoss && t.id === 'speedometer' && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#FF4F00] rounded-full animate-ping" />
                )}
              </div>
              <span className="text-[9px] tracking-[0.1em] font-semibold mt-0.5">
                {t.label}
              </span>
              {/* Minimalist dot indicator */}
              <span
                className={`w-1 h-1 rounded-full mt-0.5 transition-opacity ${
                  isActive ? 'bg-[#FF4F00] opacity-100' : 'opacity-0'
                }`}
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
};
