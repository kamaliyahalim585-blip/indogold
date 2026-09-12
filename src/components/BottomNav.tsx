import React from 'react';
import { Home, ArrowDownToLine, ArrowUpFromLine, History, User } from 'lucide-react';

export type TabType = 'beranda' | 'beli' | 'jual' | 'riwayat' | 'akun';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => {
  const tabs = [
    { id: 'beranda' as TabType, label: 'Beranda', icon: Home },
    { id: 'beli' as TabType, label: 'Beli Emas', icon: ArrowDownToLine },
    { id: 'jual' as TabType, label: 'Jual Emas', icon: ArrowUpFromLine },
    { id: 'riwayat' as TabType, label: 'Riwayat', icon: History },
    { id: 'akun' as TabType, label: 'Akun', icon: User }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0e1117]/95 backdrop-blur-lg border-t border-[#232733] py-2 px-3">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-xl transition-all duration-150 ${
                isActive
                  ? 'text-[#ffd700] font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-colors ${
                  isActive ? 'bg-[#ffd700]/15' : 'bg-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
