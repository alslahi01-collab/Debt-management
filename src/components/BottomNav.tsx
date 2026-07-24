import React from 'react';
import { Settings, BarChart2, Coins, FolderKanban, Plus } from 'lucide-react';
import { ActiveTab } from '../types';
import { Language, getTranslation } from '../utils/i18n';

interface BottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onQuickAdd: () => void;
  lang?: Language;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  onQuickAdd,
  lang = 'ar',
}) => {
  const safeLang: Language = lang === 'en' ? 'en' : 'ar';
  const isEn = safeLang === 'en';
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(safeLang, key);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-20 h-16 max-w-md mx-auto" dir={isEn ? 'ltr' : 'rtl'}>
      <div className="grid grid-cols-5 h-full items-center relative">
        {/* Tab 1: Categories */}
        <button
          onClick={() => onTabChange('categories')}
          className={`flex flex-col items-center justify-center py-1 transition ${
            activeTab === 'categories' ? 'text-[#7A0C1E] font-extrabold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FolderKanban className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] truncate">{t('categories')}</span>
        </button>

        {/* Tab 2: Currencies */}
        <button
          onClick={() => onTabChange('currencies')}
          className={`flex flex-col items-center justify-center py-1 transition ${
            activeTab === 'currencies' ? 'text-[#7A0C1E] font-extrabold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Coins className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] truncate">{t('currencies')}</span>
        </button>

        {/* Center Floating Action (+) Button */}
        <div className="flex justify-center items-center relative -top-4">
          <button
            onClick={onQuickAdd}
            className="w-14 h-14 bg-[#7A0C1E] text-white rounded-full flex items-center justify-center shadow-xl hover:bg-red-900 active:scale-90 transition border-4 border-slate-100"
            title={t('addAccount')}
          >
            <Plus className="w-8 h-8" />
          </button>
        </div>

        {/* Tab 4: Reports */}
        <button
          onClick={() => onTabChange('reports')}
          className={`flex flex-col items-center justify-center py-1 transition ${
            activeTab === 'reports' ? 'text-[#7A0C1E] font-extrabold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart2 className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] truncate">{t('reports')}</span>
        </button>

        {/* Tab 5: Settings */}
        <button
          onClick={() => onTabChange('settings')}
          className={`flex flex-col items-center justify-center py-1 transition ${
            activeTab === 'settings' ? 'text-[#7A0C1E] font-extrabold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Settings className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] truncate">{t('settings')}</span>
        </button>
      </div>
    </nav>
  );
};

