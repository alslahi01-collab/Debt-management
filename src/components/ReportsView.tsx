import React, { useState, useMemo } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  FileText,
  UserCheck,
  FolderKanban
} from 'lucide-react';
import { Account, Transaction, Category, AppSettings } from '../types';
import { calculateAccountTotals } from '../utils/storage';
import { exportAccountStatementToExcel, exportAllDataToExcel } from '../utils/excel';
import { getTranslation } from '../utils/i18n';

interface ReportsViewProps {
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  settings: AppSettings;
  onBack: () => void;
  onSelectAccount: (acc: Account) => void;
  onPrintReport: (data: any) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  accounts,
  transactions,
  categories,
  settings,
  onBack,
  onSelectAccount,
}) => {
  const [activeReportMode, setActiveReportMode] = useState<
    'menu' | 'specific_account' | 'category_totals' | 'custom_detailed'
  >('menu');

  const lang = settings.language || 'ar';
  const isEn = lang === 'en';
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(lang, key);

  // Form states
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || '');
  const [selectedCategoryName, setSelectedCategoryName] = useState(categories[0]?.name || 'ديون');
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [debtTypeFilter, setDebtTypeFilter] = useState<'all' | 'debit' | 'credit'>('all');

  // Category Report Accounts
  const categoryAccounts = useMemo(() => {
    return accounts.filter((a) => a.category === selectedCategoryName);
  }, [accounts, selectedCategoryName]);

  // Custom Detailed Transactions
  const filteredTxs = useMemo(() => {
    return transactions.filter((tx) => {
      if (startDate && tx.date < startDate) return false;
      if (endDate && tx.date > endDate) return false;
      if (debtTypeFilter !== 'all' && tx.type !== debtTypeFilter) return false;
      return true;
    });
  }, [transactions, startDate, endDate, debtTypeFilter]);

  return (
    <div className="flex flex-col h-full bg-slate-100 text-slate-800 pb-20 select-none" dir={isEn ? 'ltr' : 'rtl'}>
      {/* Header */}
      <div className="bg-[#7A0C1E] text-white px-3 py-3 shadow-md flex items-center justify-between sticky top-0 z-30 border-b border-red-950">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (activeReportMode !== 'menu') setActiveReportMode('menu');
              else onBack();
            }}
            className="p-1 rounded-full hover:bg-white/10 text-white"
            title={t('back')}
          >
            {isEn ? <ArrowLeft className="w-6 h-6" /> : <ArrowRight className="w-6 h-6" />}
          </button>
          <h1 className="font-bold text-lg">{t('reportsSystem')}</h1>
        </div>
      </div>

      {/* Main Reports Menu */}
      {activeReportMode === 'menu' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3 max-w-md mx-auto w-full">
          {/* Item 1: Report - Specific Account */}
          <button
            onClick={() => setActiveReportMode('specific_account')}
            className="w-full bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition flex items-center justify-between group active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-[#7A0C1E] flex items-center justify-center font-bold">
                <UserCheck className="w-5 h-5" />
              </div>
              <span className="font-bold text-slate-800 text-sm group-hover:text-[#7A0C1E] transition">
                {t('reportSpecificAccount')}
              </span>
            </div>
            {isEn ? (
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#7A0C1E] transition" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-slate-400 group-hover:text-[#7A0C1E] transition" />
            )}
          </button>

          {/* Item 2: Report - Category Totals */}
          <button
            onClick={() => setActiveReportMode('category_totals')}
            className="w-full bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition flex items-center justify-between group active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <FolderKanban className="w-5 h-5" />
              </div>
              <span className="font-bold text-slate-800 text-sm group-hover:text-[#7A0C1E] transition">
                {t('reportCategoryTotals')}
              </span>
            </div>
            {isEn ? (
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#7A0C1E] transition" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-slate-400 group-hover:text-[#7A0C1E] transition" />
            )}
          </button>

          {/* Item 3: Report - Custom Detailed */}
          <button
            onClick={() => setActiveReportMode('custom_detailed')}
            className="w-full bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition flex items-center justify-between group active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <span className="font-bold text-slate-800 text-sm group-hover:text-[#7A0C1E] transition">
                {t('reportCustomDetailed')}
              </span>
            </div>
            {isEn ? (
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#7A0C1E] transition" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-slate-400 group-hover:text-[#7A0C1E] transition" />
            )}
          </button>
        </div>
      )}

      {/* Subview 1: Specific Account Report */}
      {activeReportMode === 'specific_account' && (
        <div className="flex-1 p-4 space-y-4 max-w-md mx-auto w-full">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <h2 className="font-bold text-slate-900 text-sm border-b pb-2">{t('selectAccountForReport')}</h2>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-sm bg-white outline-none"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.category})
                </option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => {
                  const target = accounts.find((a) => a.id === selectedAccountId);
                  if (target) onSelectAccount(target);
                }}
                className="py-2.5 bg-[#7A0C1E] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 hover:bg-red-900"
              >
                <FileText className="w-4 h-4" />
                <span>{t('viewStatement')}</span>
              </button>

              <button
                onClick={() => {
                  const target = accounts.find((a) => a.id === selectedAccountId);
                  if (target) exportAccountStatementToExcel(target, transactions, settings);
                }}
                className="py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>{t('exportExcel')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subview 2: Category Totals Report */}
      {activeReportMode === 'category_totals' && (
        <div className="flex-1 p-4 space-y-4 max-w-md mx-auto w-full">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <h2 className="font-bold text-slate-900 text-sm border-b pb-2">{t('selectCategory')}</h2>
            <select
              value={selectedCategoryName}
              onChange={(e) => setSelectedCategoryName(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-sm bg-white outline-none"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Accounts list in selected category */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
            <div className="bg-slate-800 text-white p-2.5 font-bold text-xs flex justify-between">
              <span>{isEn ? `Category accounts (${selectedCategoryName})` : `حسابات قسم ${selectedCategoryName}`}</span>
              <span>{isEn ? `Count: ${categoryAccounts.length}` : `العدد: ${categoryAccounts.length}`}</span>
            </div>

            {categoryAccounts.map((acc) => {
              const totals = calculateAccountTotals(acc.id, transactions);
              return (
                <div key={acc.id} className="p-3 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">{acc.name}</span>
                  <div className="font-black">
                    {totals.isNetCredit ? (
                      <span className="text-emerald-700">{settings.creditLabel || t('credit')} {totals.netAmount.toLocaleString()}</span>
                    ) : totals.isNetDebit ? (
                      <span className="text-red-600">{settings.debitLabel || t('debit')} {totals.netAmount.toLocaleString()}</span>
                    ) : (
                      <span className="text-slate-400">0</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => exportAllDataToExcel(categoryAccounts, transactions, settings)}
            className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl shadow hover:bg-emerald-700 transition flex items-center justify-center gap-2 text-sm"
          >
            <FileSpreadsheet className="w-5 h-5" />
            <span>{t('exportExcel')}</span>
          </button>
        </div>
      )}

      {/* Subview 3: Custom Detailed Report */}
      {activeReportMode === 'custom_detailed' && (
        <div className="flex-1 p-4 space-y-4 max-w-md mx-auto w-full">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
            <h2 className="font-bold text-slate-900 text-sm border-b pb-2">{t('detailedReportFilters')}</h2>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-500 font-bold mb-1">{isEn ? 'From date' : 'من تاريخ'}</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none font-semibold"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-bold mb-1">{isEn ? 'To date' : 'الى تاريخ'}</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-500 font-bold mb-1">{t('transactionType')}</label>
              <select
                value={debtTypeFilter}
                onChange={(e) => setDebtTypeFilter(e.target.value as any)}
                className="w-full p-2 border border-slate-300 rounded-lg outline-none font-bold"
              >
                <option value="all">{t('allTypes')}</option>
                <option value="debit">{settings.debitLabel || t('debit')}</option>
                <option value="credit">{settings.creditLabel || t('credit')}</option>
              </select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center space-y-2">
            <span className="text-xs text-slate-500 font-bold block">{t('totalFilteredTx')}</span>
            <span className="text-2xl font-black text-[#7A0C1E]">{filteredTxs.length} {isEn ? 'txs' : 'عملية'}</span>

            <button
              onClick={() => exportAllDataToExcel(accounts, filteredTxs, settings)}
              className="w-full py-2.5 bg-emerald-600 text-white font-bold rounded-xl shadow hover:bg-emerald-700 transition flex items-center justify-center gap-2 text-sm mt-2"
            >
              <FileSpreadsheet className="w-5 h-5" />
              <span>{t('exportExcel')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

