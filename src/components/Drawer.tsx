import React, { useRef } from 'react';
import {
  Home,
  CloudUpload,
  CloudDownload,
  Settings,
  FileSpreadsheet,
  Lock,
  Share2,
  X,
  HardDrive,
  Heart
} from 'lucide-react';
import { AppSettings } from '../types';
import { getTranslation } from '../utils/i18n';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onNavigateTab: (tab: 'accounts' | 'categories' | 'currencies' | 'reports' | 'settings') => void;
  onExportExcel: () => void;
  onExportBackup: () => void;
  onImportBackup: (fileContent: string) => void;
  onTogglePinModal: () => void;
  onOpenGoogleDrive: () => void;
  onClearData: () => void;
  onOpenInstallModal: () => void;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  settings,
  onNavigateTab,
  onExportExcel,
  onExportBackup,
  onImportBackup,
  onTogglePinModal,
  onOpenGoogleDrive,
  onClearData,
  onOpenInstallModal,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lang = settings.language || 'ar';
  const isEn = lang === 'en';
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(lang, key);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          onImportBackup(content);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex" dir={isEn ? 'ltr' : 'rtl'}>
      {/* Dark overlay backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer content box */}
      <div className={`relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 overflow-hidden text-slate-800 ${isEn ? 'animate-slide-in-left' : 'animate-slide-in-right'}`}>
        {/* Drawer Header banner - Deep Burgundy */}
        <div className="bg-[#7A0C1E] text-white p-5 flex flex-col justify-between relative border-b border-red-950">
          <button
            onClick={onClose}
            className={`absolute top-3 ${isEn ? 'right-3' : 'left-3'} p-1 rounded-full bg-white/10 hover:bg-white/20 transition text-white`}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mt-2">
            <div className="w-14 h-14 rounded-full bg-white text-[#7A0C1E] flex items-center justify-center font-bold text-2xl shadow-inner border-2 border-white/80 overflow-hidden shrink-0">
              {settings.logoUrl ? (
                <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <span className="text-sm font-black text-[#7A0C1E]">إدارة</span>
                  <span className="text-[11px] -mt-1 font-extrabold text-amber-600">الديون</span>
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-lg font-black tracking-wide">{settings.appName || t('appName')}</h2>
                <span className="text-xs">🇾🇪</span>
              </div>
              <span className="inline-block mt-1 text-[10px] bg-white/20 px-2.5 py-0.5 rounded-full font-bold">
                {isEn ? 'Offline Secure Debt App' : 'تطبيق آمن يعمل بدون إنترنت'}
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable menu items */}
        <div className="flex-1 overflow-y-auto py-2 text-sm divide-y divide-slate-100">
          <div className="py-1">
            <button
              onClick={() => {
                onNavigateTab('accounts');
                onClose();
              }}
              className="w-full px-4 py-2.5 flex items-center gap-3 text-slate-700 hover:bg-slate-100 transition active:bg-slate-200"
            >
              <Home className="w-5 h-5 text-[#7A0C1E]" />
              <span className="font-bold">{t('accounts')}</span>
            </button>
          </div>

          {/* Google Drive Backup & Local Backup section */}
          <div className="py-1 space-y-0.5">
            <button
              onClick={() => {
                onOpenGoogleDrive();
                onClose();
              }}
              className="w-full px-4 py-2.5 flex items-center gap-3 text-red-900 bg-red-50/50 hover:bg-red-100/50 transition font-bold"
            >
              <HardDrive className="w-5 h-5 text-amber-600" />
              <span>{t('googleDriveBackup')}</span>
            </button>

            <button
              onClick={() => {
                onExportBackup();
                onClose();
              }}
              className="w-full px-4 py-2.5 flex items-center gap-3 text-slate-700 hover:bg-slate-100 transition text-xs font-semibold"
            >
              <CloudUpload className="w-4 h-4 text-indigo-600" />
              <span>{t('backupLocalJSON')}</span>
            </button>

            <button
              onClick={() => {
                fileInputRef.current?.click();
              }}
              className="w-full px-4 py-2.5 flex items-center gap-3 text-slate-700 hover:bg-slate-100 transition text-xs font-semibold"
            >
              <CloudDownload className="w-4 h-4 text-indigo-600" />
              <span>{t('restoreLocalJSON')}</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />

            <button
              onClick={() => {
                onExportExcel();
                onClose();
              }}
              className="w-full px-4 py-2.5 flex items-center gap-3 text-emerald-800 hover:bg-emerald-50 transition font-bold text-xs"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>{t('exportExcel')}</span>
            </button>
          </div>

          {/* Security section */}
          <div className="py-1">
            <button
              onClick={() => {
                onTogglePinModal();
                onClose();
              }}
              className="w-full px-4 py-2.5 flex items-center gap-3 text-slate-700 hover:bg-slate-100 transition"
            >
              <Lock className="w-5 h-5 text-amber-600" />
              <span>
                {settings.isPinRequired ? (isEn ? 'Change/Disable PIN' : 'تغيير/إلغاء الرقم السري') : t('pinLockTitle')}
              </span>
            </button>
          </div>

          {/* App Tools */}
          <div className="py-1">
            <button
              onClick={() => {
                onNavigateTab('settings');
                onClose();
              }}
              className="w-full px-4 py-2.5 flex items-center gap-3 text-slate-700 hover:bg-slate-100 transition"
            >
              <Settings className="w-5 h-5 text-slate-600" />
              <span>{t('settings')}</span>
            </button>

            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: settings.appName,
                    text: 'تطبيق إدارة الديون والحسابات باللغتين العربية والإنجليزية.',
                    url: window.location.href,
                  }).catch(() => {});
                } else {
                  alert('URL: ' + window.location.href);
                }
              }}
              className="w-full px-4 py-2.5 flex items-center gap-3 text-slate-700 hover:bg-slate-100 transition"
            >
              <Share2 className="w-5 h-5 text-blue-600" />
              <span>{isEn ? 'Share App Link' : 'مشاركة رابط التطبيق'}</span>
            </button>
          </div>
        </div>

        {/* Footer Sadaqah & Developer Notice */}
        <div className="p-3.5 bg-amber-50 border-t border-amber-200 text-center space-y-1.5 shrink-0">
          <p className="text-xs font-black text-amber-950 flex items-center justify-center gap-1">
            <Heart className="w-3.5 h-3.5 text-red-600 fill-red-600" />
            <span>{t('sadaqahNotice')}</span>
          </p>
          <div className="text-[10px] text-slate-700 font-bold leading-tight border-t border-amber-200/60 pt-1">
            {t('developerInfo')}
          </div>
        </div>
      </div>
    </div>
  );
};

