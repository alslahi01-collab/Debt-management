import React, { useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Pencil,
  Lock,
  ArrowUpDown,
  Sliders,
  Globe,
  HardDrive,
  Heart,
  Coins,
  CheckCircle2
} from 'lucide-react';
import { AppSettings } from '../types';
import { getTranslation } from '../utils/i18n';

interface SettingsViewProps {
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onOpenAccountSort: () => void;
  onOpenTransactionSort: () => void;
  onTogglePinModal: () => void;
  onBack: () => void;
  onNavigateCurrencies: () => void;
  onOpenGoogleDriveModal: () => void;
  onClearAllData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  onOpenAccountSort,
  onOpenTransactionSort,
  onTogglePinModal,
  onBack,
  onNavigateCurrencies,
  onOpenGoogleDriveModal,
}) => {
  const [appName, setAppName] = useState(settings.appName || 'إدارة الديون');
  const [phone, setPhone] = useState(settings.phone || '');
  const [debitLabel, setDebitLabel] = useState(settings.debitLabel || 'عليه');
  const [creditLabel, setCreditLabel] = useState(settings.creditLabel || 'له');
  const [language, setLanguage] = useState<'ar' | 'en'>(settings.language || 'ar');

  const isEn = language === 'en';
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  const handleLanguageChange = (newLang: 'ar' | 'en') => {
    setLanguage(newLang);
    // Auto save language preference immediately so the UI responds
    onSaveSettings({
      ...settings,
      language: newLang,
    });
  };

  const handleSave = () => {
    onSaveSettings({
      ...settings,
      appName: appName.trim() || (isEn ? 'Debt Management' : 'إدارة الديون'),
      phone: phone.trim(),
      debitLabel: debitLabel.trim() || (isEn ? 'Debit' : 'عليه'),
      creditLabel: creditLabel.trim() || (isEn ? 'Credit' : 'له'),
      language,
    });
    alert(t('settingsSaved'));
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 text-slate-800 pb-20 select-none" dir={isEn ? 'ltr' : 'rtl'}>
      {/* Header */}
      <div className="bg-[#7A0C1E] text-white px-3 py-3 shadow-md flex items-center justify-between sticky top-0 z-30 border-b border-red-950">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="p-1 rounded-full hover:bg-white/10 text-white" title={t('back')}>
            {isEn ? <ArrowLeft className="w-6 h-6" /> : <ArrowRight className="w-6 h-6" />}
          </button>
          <h1 className="font-bold text-lg">{t('settings')}</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 max-w-md mx-auto w-full space-y-4">
        {/* App Profile Card */}
        <div className="flex flex-col items-center justify-center space-y-2 py-2">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-white text-[#7A0C1E] flex items-center justify-center font-bold text-3xl shadow-md border-2 border-red-200 overflow-hidden">
              {settings.logoUrl ? (
                <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center text-center">
                  <span className="text-sm font-black text-[#7A0C1E]">{isEn ? 'Debt' : 'إدارة'}</span>
                  <span className="text-xs font-black text-amber-600 -mt-1">{isEn ? 'Manager' : 'الديون'}</span>
                </div>
              )}
            </div>
          </div>
          <p className="text-xs font-black text-slate-700">{t('debtManagementApp')} 🇾🇪</p>
        </div>

        {/* Input Fields */}
        <div className="space-y-3">
          {/* App Name */}
          <div className="relative bg-white border border-slate-300 rounded-xl px-3 py-2 flex items-center justify-between shadow-2xs">
            <div className="flex-1">
              <label className="text-[10px] font-bold text-slate-400 block -mt-1">{t('appName')}</label>
              <input
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                className="w-full text-sm font-bold text-slate-800 outline-none bg-transparent"
              />
            </div>
            <Pencil className="w-4 h-4 text-slate-400" />
          </div>

          {/* Contact Phone Number */}
          <div className="relative bg-white border border-slate-300 rounded-xl px-3 py-2 flex items-center justify-between shadow-2xs">
            <div className="flex-1">
              <label className="text-[10px] font-bold text-slate-400 block -mt-1">{t('contactPhone')}</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`w-full text-sm font-bold text-slate-800 outline-none bg-transparent dir-ltr ${isEn ? 'text-left' : 'text-right'}`}
              />
            </div>
            <Pencil className="w-4 h-4 text-slate-400" />
          </div>

          {/* Language / اللغة */}
          <div className="relative bg-white border border-slate-300 rounded-xl px-3 py-2 flex items-center justify-between shadow-2xs">
            <div className="flex-1">
              <label className="text-[10px] font-bold text-slate-400 block -mt-1">{t('appLanguage')}</label>
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value as 'ar' | 'en')}
                className="w-full text-sm font-bold text-slate-800 outline-none bg-transparent cursor-pointer"
              >
                <option value="ar">العربية (Arabic 🇾🇪)</option>
                <option value="en">English (الإنجليزية 🇬🇧)</option>
              </select>
            </div>
            <Globe className="w-4 h-4 text-slate-400" />
          </div>

          {/* Debit Label */}
          <div className="relative bg-white border border-slate-300 rounded-xl px-3 py-2 flex items-center justify-between shadow-2xs">
            <div className="flex-1">
              <label className="text-[10px] font-bold text-red-500 block -mt-1">{t('debitLabel')}</label>
              <input
                type="text"
                value={debitLabel}
                onChange={(e) => setDebitLabel(e.target.value)}
                className="w-full text-sm font-bold text-red-600 outline-none bg-transparent"
              />
            </div>
            <Pencil className="w-4 h-4 text-slate-400" />
          </div>

          {/* Credit Label */}
          <div className="relative bg-white border border-slate-300 rounded-xl px-3 py-2 flex items-center justify-between shadow-2xs">
            <div className="flex-1">
              <label className="text-[10px] font-bold text-emerald-600 block -mt-1">{t('creditLabel')}</label>
              <input
                type="text"
                value={creditLabel}
                onChange={(e) => setCreditLabel(e.target.value)}
                className="w-full text-sm font-bold text-emerald-700 outline-none bg-transparent"
              />
            </div>
            <Pencil className="w-4 h-4 text-slate-400" />
          </div>

          {/* Currencies */}
          <button
            onClick={onNavigateCurrencies}
            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 flex items-center justify-between shadow-2xs hover:bg-slate-50 transition"
          >
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-[#7A0C1E]" />
              <span className="text-sm font-bold text-slate-800">{t('manageCurrencies')}</span>
            </div>
            <Pencil className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Features & Options buttons */}
        <div className="space-y-2 pt-2">
          {/* Google Drive Backup */}
          <button
            onClick={onOpenGoogleDriveModal}
            className="w-full py-3 bg-amber-600 text-white font-bold rounded-xl shadow hover:bg-amber-700 transition flex items-center justify-center gap-2 text-sm"
          >
            <HardDrive className="w-4 h-4" />
            <span>{t('backupGoogleDrive')}</span>
          </button>

          {/* PIN Lock */}
          <button
            onClick={onTogglePinModal}
            className="w-full py-3 bg-[#7A0C1E] text-white font-bold rounded-xl shadow hover:bg-red-900 transition flex items-center justify-center gap-2 text-sm"
          >
            <Lock className="w-4 h-4" />
            <span>
              {settings.isPinRequired ? t('changeRemovePin') : t('lockAppPin')}
            </span>
          </button>

          {/* Account Sort */}
          <button
            onClick={onOpenAccountSort}
            className="w-full py-3 bg-[#7A0C1E] text-white font-bold rounded-xl shadow hover:bg-red-900 transition flex items-center justify-center gap-2 text-sm"
          >
            <ArrowUpDown className="w-4 h-4" />
            <span>{t('sortAccounts')}</span>
          </button>

          {/* Transaction Sort */}
          <button
            onClick={onOpenTransactionSort}
            className="w-full py-3 bg-[#7A0C1E] text-white font-bold rounded-xl shadow hover:bg-red-900 transition flex items-center justify-center gap-2 text-sm"
          >
            <Sliders className="w-4 h-4" />
            <span>{t('sortTransactions')}</span>
          </button>

          {/* Save Settings */}
          <button
            onClick={handleSave}
            className="w-full py-3.5 bg-emerald-700 text-white font-extrabold rounded-xl shadow-lg hover:bg-emerald-800 transition flex items-center justify-center gap-2 text-sm mt-3"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>{t('saveSettings')}</span>
          </button>
        </div>

        {/* Developer Info Notice */}
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 text-center space-y-2 shadow-xs mt-4">
          <p className="text-sm font-black text-amber-950 flex items-center justify-center gap-1.5">
            <Heart className="w-4 h-4 text-red-600 fill-red-600" />
            <span>{t('freeAppNotice')}</span>
          </p>
          <div className="text-xs text-slate-800 font-bold border-t border-amber-200 pt-2 leading-relaxed">
            {t('developerName')}
            <br />
            {t('developerContact')}
          </div>
        </div>
      </div>
    </div>
  );
};

