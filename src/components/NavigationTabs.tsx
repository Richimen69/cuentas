import React from 'react';
import { LayoutDashboard, ReceiptText, CalendarCheck, PieChart } from 'lucide-react';
import { ActiveTab } from '../types';

interface NavigationTabsProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  pendingFixedCount: number;
  alertCount: number;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onTabChange,
  pendingFixedCount,
  alertCount,
}) => {
  const tabs = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'RESUMEN',
      icon: LayoutDashboard,
      badge: null,
      accentColor: '#2E6F4E',
    },
    {
      id: 'movements' as ActiveTab,
      label: 'MOVIMIENTOS',
      icon: ReceiptText,
      badge: null,
      accentColor: '#2E6F4E',
    },
    {
      id: 'fixed_payments' as ActiveTab,
      label: 'FIJOS',
      icon: CalendarCheck,
      badge: pendingFixedCount > 0 ? { count: pendingFixedCount, type: 'warning' } : null,
      accentColor: '#B8863A',
    },
    {
      id: 'budget' as ActiveTab,
      label: 'PRESUPUESTO',
      icon: PieChart,
      badge: alertCount > 0 ? { count: alertCount, type: 'danger' } : null,
      accentColor: '#A33B2E',
    },
  ];

  return (
    <>
      {/* Desktop Vertical Spine Tabs (md and above) */}
      <aside className="hidden md:flex w-16 border-r border-[#E4DAC0] flex-col pt-8 z-20 bg-[#FAF6EC] flex-shrink-0 select-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              title={tab.label}
              className={`h-28 w-full border-b border-[#E4DAC0] flex flex-col items-center justify-center cursor-pointer transition-all relative ${
                isActive
                  ? 'border-r-4 border-r-[#2E6F4E] bg-white text-[#1F2A22] font-bold shadow-xs'
                  : 'hover:bg-[#f1eee4] text-[#8a8370]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 mb-2 ${isActive ? 'text-[#2E6F4E]' : 'text-[#8a8370]'}`} />
              <div
                className="vertical-text transform -rotate-180 text-[10px] font-bold tracking-widest uppercase font-serif"
                style={{ writingMode: 'vertical-rl' }}
              >
                {tab.label}
              </div>

              {/* Notification Badges */}
              {tab.badge && (
                <span
                  className={`absolute top-2 right-2 w-2 h-2 rounded-full ${
                    tab.badge.type === 'danger' ? 'bg-[#A33B2E] animate-pulse' : 'bg-[#B8863A]'
                  }`}
                  title={`${tab.badge.count} alertas`}
                />
              )}
            </button>
          );
        })}
      </aside>

      {/* Mobile Horizontal Tabs (below md) */}
      <div className="flex md:hidden border-b border-[#E4DAC0] bg-[#FAF6EC] px-2 pt-2 gap-1 overflow-x-auto select-none z-20">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 min-w-[75px] py-2 px-1 flex flex-col items-center justify-center text-[10px] font-bold uppercase tracking-wider transition-all relative ${
                isActive
                  ? 'border-b-2 border-b-[#2E6F4E] bg-white text-[#1F2A22] rounded-t-sm shadow-xs'
                  : 'text-[#8a8370] hover:bg-[#f1eee4] rounded-t-sm'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 mb-1 ${isActive ? 'text-[#2E6F4E]' : 'text-[#8a8370]'}`} />
              <span className="font-serif truncate max-w-full">{tab.label}</span>

              {tab.badge && (
                <span
                  className={`absolute top-1 right-2 w-2 h-2 rounded-full ${
                    tab.badge.type === 'danger' ? 'bg-[#A33B2E]' : 'bg-[#B8863A]'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
    </>
  );
};

