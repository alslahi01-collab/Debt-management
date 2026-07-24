import React from 'react';
import { Menu, ArrowRight, ArrowLeft, Search } from 'lucide-react';
import { Language, getTranslation } from '../utils/i18n';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  onOpenDrawer?: () => void;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  showSearchInput?: boolean;
  onToggleSearch?: () => void;
  actions?: React.ReactNode;
  lang?: Language;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  onBack,
  onOpenDrawer,
  searchQuery = '',
  onSearchChange,
  showSearchInput = false,
  onToggleSearch,
  actions,
  lang = 'ar',
}) => {
  const safeLang: Language = lang === 'en' ? 'en' : 'ar';
  const isEn = safeLang === 'en';
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(safeLang, key);

  return (
    <header className="bg-[#7A0C1E] text-white shadow-md sticky top-0 z-30 transition-all border-b border-red-950">
      <div className="flex items-center justify-between px-3 py-3 h-14">
        {/* Drawer or Back button */}
        <div className="flex items-center gap-2">
          {showBack ? (
            <button
              onClick={onBack}
              className="p-1.5 rounded-full hover:bg-white/10 active:scale-95 transition"
              title={t('back')}
            >
              {isEn ? <ArrowLeft className="w-6 h-6 text-white" /> : <ArrowRight className="w-6 h-6 text-white" />}
            </button>
          ) : (
            <button
              onClick={onOpenDrawer}
              className="p-1.5 rounded-full hover:bg-white/10 active:scale-95 transition"
              title={t('mainMenu')}
            >
              <Menu className="w-6 h-6 text-white" />
            </button>
          )}

          {!showSearchInput && (
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-wide select-none truncate max-w-[180px] sm:max-w-xs">
                {title || t('appName')}
              </h1>
              {/* Yemen Flag badge */}
              <span className="inline-flex items-center overflow-hidden rounded-xs border border-white/30 shadow-2xs h-3.5 w-5 shrink-0" title={t('yemen')}>
                <span className="h-full w-1/3 bg-[#CE1126]"></span>
                <span className="h-full w-1/3 bg-white"></span>
                <span className="h-full w-1/3 bg-black"></span>
              </span>
            </div>
          )}
        </div>

        {/* Search bar when active */}
        {showSearchInput ? (
          <div className="flex-1 mx-2 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder={t('searchPlaceholder')}
              autoFocus
              className="w-full bg-white/15 text-white placeholder-white/70 text-sm px-3 py-1.5 rounded-lg outline-none border border-white/20 focus:border-white transition"
            />
          </div>
        ) : null}

        {/* Right side controls */}
        <div className="flex items-center gap-1">
          {onToggleSearch && (
            <button
              onClick={onToggleSearch}
              className={`p-1.5 rounded-full hover:bg-white/10 transition ${showSearchInput ? 'bg-white/20' : ''}`}
              title={t('search')}
            >
              <Search className="w-5 h-5 text-white" />
            </button>
          )}

          {actions}
        </div>
      </div>
    </header>
  );
};

