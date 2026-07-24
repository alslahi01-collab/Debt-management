import React, { useState, useMemo } from 'react';
import {
  Printer,
  Share2,
  Filter,
  ArrowUpDown,
  Pencil,
  Plus,
  User,
  MessageCircle,
} from 'lucide-react';
import { Account, Transaction, AppSettings, AccountSortOption, Category, Currency } from '../types';
import { calculateAccountTotals, calculateOverallTotals } from '../utils/storage';
import { getTranslation } from '../utils/i18n';

interface AccountListProps {
  accounts: Account[];
  transactions: Transaction[];
  settings: AppSettings;
  categories: Category[];
  currencies: Currency[];
  searchQuery: string;
  onSelectAccount: (account: Account) => void;
  onEditAccount: (account: Account) => void;
  onAddTransaction: (account: Account) => void;
  onOpenSortDialog: () => void;
  onExportExcel: () => void;
  onPrintList: () => void;
  accountSort: AccountSortOption;
}

export const AccountList: React.FC<AccountListProps> = ({
  accounts,
  transactions,
  settings,
  categories,
  currencies,
  searchQuery,
  onSelectAccount,
  onEditAccount,
  onAddTransaction,
  onOpenSortDialog,
  onExportExcel,
  onPrintList,
  accountSort,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('all');

  const lang = settings.language || 'ar';
  const isEn = lang === 'en';
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(lang, key);

  // Filter & Sort accounts logic
  const filteredAndSortedAccounts = useMemo(() => {
    let list = accounts.filter((acc) => {
      // Search
      const matchesSearch =
        acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (acc.phone && acc.phone.includes(searchQuery));

      // Category
      const matchesCat = selectedCategory === 'all' || acc.category === selectedCategory;

      // Currency
      const matchesCurr = selectedCurrency === 'all' || acc.currency === selectedCurrency;

      return matchesSearch && matchesCat && matchesCurr;
    });

    // Apply sorting option
    list = [...list].sort((a, b) => {
      const totalsA = calculateAccountTotals(a.id, transactions);
      const totalsB = calculateAccountTotals(b.id, transactions);

      switch (accountSort) {
        case 'asc':
          return totalsA.netBalance - totalsB.netBalance;
        case 'desc':
          return totalsB.netBalance - totalsA.netBalance;
        case 'dateAsc':
          return (a.createdAt || '').localeCompare(b.createdAt || '');
        case 'dateDesc':
          return (b.createdAt || '').localeCompare(a.createdAt || '');
        case 'name':
          return a.name.localeCompare(b.name, isEn ? 'en' : 'ar');
        case 'default':
        default:
          return 0;
      }
    });

    return list;
  }, [accounts, transactions, searchQuery, selectedCategory, selectedCurrency, accountSort, isEn]);

  // Total balance summary across displayed accounts
  const overallTotals = useMemo(() => {
    return calculateOverallTotals(filteredAndSortedAccounts, transactions);
  }, [filteredAndSortedAccounts, transactions]);

  // Share account balance message via WhatsApp
  const handleShareWhatsApp = (acc: Account, e: React.MouseEvent) => {
    e.stopPropagation();
    const totals = calculateAccountTotals(acc.id, transactions);
    let balanceText = `${t('balanced')} (0)`;
    if (totals.isNetCredit) balanceText = `${settings.creditLabel || t('credit')} ${totals.netAmount.toLocaleString()} ${acc.currency || settings.defaultCurrency}`;
    if (totals.isNetDebit) balanceText = `${settings.debitLabel || t('debit')} ${totals.netAmount.toLocaleString()} ${acc.currency || settings.defaultCurrency}`;

    const text = `${t('statementFor')}: ${acc.name}\n${t('balance')}: ${balanceText}\n${settings.appName}`;
    const url = `https://wa.me/${acc.phone ? acc.phone.replace(/[^0-9]/g, '') : ''}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 text-slate-800 pb-20 select-none" dir={isEn ? 'ltr' : 'rtl'}>
      {/* Quick Action Toolbar */}
      <div className="bg-white border-b border-slate-200 px-2 py-1.5 flex items-center justify-between text-xs shadow-xs gap-1 overflow-x-auto">
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onPrintList}
            className="flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition"
            title={t('print')}
          >
            <Printer className="w-4 h-4 text-[#7A0C1E]" />
            <span className="hidden sm:inline">{t('print')}</span>
          </button>

          <button
            onClick={onExportExcel}
            className="flex items-center gap-1 px-2 py-1 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-emerald-800 transition font-medium"
            title={t('exportExcel')}
          >
            <Share2 className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">{t('share')}</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Category Filter */}
          <div className="relative flex items-center bg-slate-100 rounded-lg px-2 py-0.5 border border-slate-200">
            <Filter className="w-3.5 h-3.5 text-slate-500 mx-1" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-xs text-slate-700 outline-none font-medium cursor-pointer"
            >
              <option value="all">{t('allCategories')}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Currency Switcher */}
          <div className="relative flex items-center bg-slate-100 rounded-lg px-2 py-0.5 border border-slate-200">
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="bg-transparent text-xs text-slate-700 outline-none font-medium cursor-pointer"
            >
              <option value="all">{t('allCurrencies')}</option>
              {currencies.map((c) => (
                <option key={c.id} value={c.code}>
                  {c.code}
                </option>
              ))}
            </select>
          </div>

          {/* Sort trigger button */}
          <button
            onClick={onOpenSortDialog}
            className="flex items-center gap-1 px-2 py-1 bg-[#7A0C1E]/10 hover:bg-[#7A0C1E]/20 text-[#7A0C1E] rounded-lg transition font-bold"
            title={t('sortAccounts')}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>{t('sortAccounts')}</span>
          </button>
        </div>
      </div>

      {/* Account Cards Scrollable List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {filteredAndSortedAccounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-slate-400 text-center mt-10">
            <User className="w-12 h-12 mb-2 stroke-1" />
            <p className="text-sm font-semibold">{t('noAccountsFound')}</p>
            <p className="text-xs text-slate-400 mt-1">{t('addAccount')}</p>
          </div>
        ) : (
          filteredAndSortedAccounts.map((acc) => {
            const totals = calculateAccountTotals(acc.id, transactions);

            return (
              <div
                key={acc.id}
                onClick={() => onSelectAccount(acc)}
                className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-xs hover:shadow-md transition cursor-pointer flex items-center justify-between group active:scale-[0.99]"
              >
                {/* Right side: Name, Category tag, & Balance */}
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-slate-100 text-[#7A0C1E] flex items-center justify-center font-bold text-sm shrink-0 mt-0.5 border border-slate-200">
                    {acc.name.charAt(0)}
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 text-sm truncate group-hover:text-[#7A0C1E] transition">
                      {acc.name}
                    </h3>
                    <span className="inline-block text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md mt-0.5 font-medium">
                      {acc.category || t('categories')}
                    </span>
                  </div>
                </div>

                {/* Left side: Amount Balance & Quick Action Icons */}
                <div className="flex items-center gap-2">
                  <div className="text-left dir-ltr px-1">
                    {totals.isNetCredit ? (
                      <div className="text-emerald-700 font-black text-sm">
                        {totals.netAmount.toLocaleString()}
                        <span className="text-[10px] mx-1 text-emerald-600 font-bold">{settings.creditLabel || t('credit')}</span>
                      </div>
                    ) : totals.isNetDebit ? (
                      <div className="text-red-600 font-black text-sm">
                        {totals.netAmount.toLocaleString()}
                        <span className="text-[10px] mx-1 text-red-500 font-bold">{settings.debitLabel || t('debit')}</span>
                      </div>
                    ) : (
                      <div className="text-slate-400 font-bold text-sm">0</div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 border-r border-slate-200 pr-1.5 mr-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditAccount(acc);
                      }}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition"
                      title={t('edit')}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => handleShareWhatsApp(acc, e)}
                      className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600 transition"
                      title={t('shareWhatsApp')}
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddTransaction(acc);
                      }}
                      className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-[#7A0C1E] transition"
                      title={t('addTransaction')}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Summary Footer Bar */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-slate-300 shadow-xl max-w-md mx-auto p-1.5 z-10 grid grid-cols-3 gap-1 text-center font-bold text-xs">
        <div className="bg-red-100/80 border border-red-200 rounded-lg p-1.5 text-red-800">
          <div className="text-[10px] text-red-600 font-bold">{settings.debitLabel || t('debit')}</div>
          <div className="text-sm font-black dir-ltr truncate">
            {overallTotals.overallDebit.toLocaleString()}
          </div>
        </div>

        <div className="bg-slate-100 border border-slate-200 rounded-lg p-1.5 text-slate-800">
          <div className="text-[10px] text-slate-500 font-bold">{t('balance')}</div>
          <div className="text-xs font-black dir-ltr truncate text-[#7A0C1E]">
            {overallTotals.isNetCredit ? (
              <span className="text-emerald-700">{settings.creditLabel || t('credit')} {overallTotals.netAmount.toLocaleString()}</span>
            ) : overallTotals.isNetDebit ? (
              <span className="text-red-600">{settings.debitLabel || t('debit')} {overallTotals.netAmount.toLocaleString()}</span>
            ) : (
              '0'
            )}
          </div>
        </div>

        <div className="bg-emerald-100/80 border border-emerald-200 rounded-lg p-1.5 text-emerald-800">
          <div className="text-[10px] text-emerald-600 font-bold">{settings.creditLabel || t('credit')}</div>
          <div className="text-sm font-black dir-ltr truncate">
            {overallTotals.overallCredit.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

