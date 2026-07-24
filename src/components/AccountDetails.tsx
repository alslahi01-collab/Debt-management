import React, { useState, useMemo } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Phone,
  Printer,
  Share2,
  Search,
  ArrowUpDown,
  Pencil,
  Plus,
  Trash2,
  FileSpreadsheet
} from 'lucide-react';
import { Account, Transaction, AppSettings, TransactionSortOption } from '../types';
import { calculateAccountTotals } from '../utils/storage';
import { exportAccountStatementToExcel } from '../utils/excel';
import { getTranslation } from '../utils/i18n';

interface AccountDetailsProps {
  account: Account;
  transactions: Transaction[];
  settings: AppSettings;
  onBack: () => void;
  onAddTransaction: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (txId: string) => void;
  onOpenSortDialog: () => void;
  transactionSort: TransactionSortOption;
  onPrintAccountStatement: (acc: Account) => void;
}

export const AccountDetails: React.FC<AccountDetailsProps> = ({
  account,
  transactions,
  settings,
  onBack,
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
  onOpenSortDialog,
  transactionSort,
  onPrintAccountStatement,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [startDate, setStartDate] = useState('2026-04-17');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const lang = settings.language || 'ar';
  const isEn = lang === 'en';
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(lang, key);

  // Account specific transactions
  const accountTxs = useMemo(() => {
    return transactions.filter((t) => t.accountId === account.id);
  }, [transactions, account.id]);

  // Calculate totals
  const totals = useMemo(() => {
    return calculateAccountTotals(account.id, transactions);
  }, [account.id, transactions]);

  // Filtered & sorted transactions list
  const processedTxs = useMemo(() => {
    let list = accountTxs.filter((tx) => {
      // Date filter
      if (startDate && tx.date < startDate) return false;
      if (endDate && tx.date > endDate) return false;

      // Search filter
      if (searchQuery) {
        return (
          tx.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
          String(tx.amount).includes(searchQuery)
        );
      }
      return true;
    });

    // Sort
    return [...list].sort((a, b) => {
      switch (transactionSort) {
        case 'asc':
          return a.amount - b.amount;
        case 'desc':
          return b.amount - a.amount;
        case 'dateAsc':
          return a.date.localeCompare(b.date);
        case 'dateDesc':
          return b.date.localeCompare(a.date);
        case 'details':
          return a.details.localeCompare(b.details, isEn ? 'en' : 'ar');
        case 'default':
        default:
          return b.date.localeCompare(a.date);
      }
    });
  }, [accountTxs, startDate, endDate, searchQuery, transactionSort, isEn]);

  // Compute accumulated running balance row-by-row
  const txsWithRunningBalance = useMemo(() => {
    const chronological = [...processedTxs].sort((a, b) => a.date.localeCompare(b.date));

    let balance = 0;
    const map = new Map<string, number>();

    for (const tx of chronological) {
      if (tx.type === 'debit') {
        balance -= Number(tx.amount || 0);
      } else {
        balance += Number(tx.amount || 0);
      }
      map.set(tx.id, Math.abs(balance));
    }

    return processedTxs.map((tx) => ({
      ...tx,
      runningBalance: map.get(tx.id) || 0,
    }));
  }, [processedTxs]);

  // Share statement via WhatsApp
  const handleShareStatementWhatsApp = () => {
    const text = `${t('statementFor')}: ${account.name}\n${t('totalCredit')}: ${totals.totalCredit.toLocaleString()}\n${t('totalDebit')}: ${totals.totalDebit.toLocaleString()}\n${t('balance')}: ${
      totals.isNetCredit ? `${settings.creditLabel || t('credit')} ${totals.netAmount.toLocaleString()}` : `${settings.debitLabel || t('debit')} ${totals.netAmount.toLocaleString()}`
    } ${account.currency}\n${t('date')}: ${new Date().toLocaleDateString(isEn ? 'en-US' : 'ar-YE')}`;

    const url = `https://wa.me/${account.phone ? account.phone.replace(/[^0-9]/g, '') : ''}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 text-slate-800 pb-28 select-none" dir={isEn ? 'ltr' : 'rtl'}>
      {/* Top Header */}
      <div className="bg-[#7A0C1E] text-white px-3 py-3 shadow-md flex items-center justify-between sticky top-0 z-30 border-b border-red-950">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="p-1 rounded-full hover:bg-white/10 text-white transition" title={t('back')}>
            {isEn ? <ArrowLeft className="w-6 h-6" /> : <ArrowRight className="w-6 h-6" />}
          </button>
          <h1 className="font-bold text-lg">{account.name}</h1>
        </div>

        {/* Top Header Action Icons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-1.5 rounded-full hover:bg-white/10 text-white"
            title={t('search')}
          >
            <Search className="w-5 h-5" />
          </button>

          {account.phone && (
            <a
              href={`tel:${account.phone}`}
              className="p-1.5 rounded-full hover:bg-white/10 text-white"
              title={t('phoneNumber')}
            >
              <Phone className="w-5 h-5" />
            </a>
          )}

          <button
            onClick={() => onPrintAccountStatement(account)}
            className="p-1.5 rounded-full hover:bg-white/10 text-white"
            title={t('printStatement')}
          >
            <Printer className="w-5 h-5" />
          </button>

          <button
            onClick={() => exportAccountStatementToExcel(account, transactions, settings)}
            className="p-1.5 rounded-full hover:bg-white/10 text-emerald-300"
            title={t('exportExcel')}
          >
            <FileSpreadsheet className="w-5 h-5" />
          </button>

          <button
            onClick={handleShareStatementWhatsApp}
            className="p-1.5 rounded-full hover:bg-white/10 text-white"
            title={t('shareWhatsApp')}
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search Input field toggle */}
      {showSearch && (
        <div className="p-2 bg-[#7A0C1E] border-t border-white/20 animate-fade-in">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full bg-white/20 text-white placeholder-white/70 text-xs px-3 py-1.5 rounded-lg outline-none"
            autoFocus
          />
        </div>
      )}

      {/* Filter Row */}
      <div className="bg-white border-b border-slate-200 px-2 py-1.5 flex items-center justify-between text-xs gap-1 shadow-xs overflow-x-auto">
        <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-600">
          <span>{isEn ? 'From' : 'من'}</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-slate-300 rounded-md px-1 py-0.5 text-[11px] bg-slate-50 outline-none"
          />
          <span>{isEn ? 'To' : 'الى'}</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-slate-300 rounded-md px-1 py-0.5 text-[11px] bg-slate-50 outline-none"
          />
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <span className="bg-indigo-50 text-[#1E2B6C] px-2 py-0.5 rounded-md font-bold text-[11px]">
            {account.currency || settings.defaultCurrency}
          </span>

          <button
            onClick={onOpenSortDialog}
            className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md text-slate-700 transition font-bold"
          >
            <ArrowUpDown className="w-3 h-3" />
            <span>{t('sortTransactions')}</span>
          </button>
        </div>
      </div>

      {/* Table Header */}
      <div className="bg-slate-800 text-white grid grid-cols-12 text-center text-xs font-bold py-2 px-1 shadow-inner">
        <div className="col-span-1"></div>
        <div className="col-span-3">{t('date')}</div>
        <div className="col-span-2">{t('amount')}</div>
        <div className="col-span-4">{t('details')}</div>
        <div className="col-span-2">{t('balance')}</div>
      </div>

      {/* Transactions Table Body */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-200 bg-white">
        {txsWithRunningBalance.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs font-semibold">
            {t('noTransactions')}
          </div>
        ) : (
          txsWithRunningBalance.map((tx) => {
            const isDebit = tx.type === 'debit';

            return (
              <div
                key={tx.id}
                className="grid grid-cols-12 items-center text-xs py-2 px-1 hover:bg-slate-50 transition border-b border-slate-100 text-slate-800"
              >
                {/* Actions: Edit & Delete */}
                <div className="col-span-1 flex items-center justify-center gap-0.5">
                  <button
                    onClick={() => onEditTransaction(tx)}
                    className="p-1 text-slate-400 hover:text-slate-800"
                    title={t('edit')}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(t('confirmDeleteTx'))) {
                        onDeleteTransaction(tx.id);
                      }
                    }}
                    className="p-1 text-slate-400 hover:text-red-600"
                    title={t('deleteTransaction')}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Date & Time */}
                <div className="col-span-3 text-[10px] text-slate-600 font-medium text-center leading-tight">
                  <div>{tx.date}</div>
                  <div className="text-[9px] text-slate-400">{tx.time}</div>
                </div>

                {/* Amount */}
                <div className="col-span-2 text-center font-black dir-ltr">
                  <span className={isDebit ? 'text-red-600' : 'text-emerald-600'}>
                    {tx.amount.toLocaleString()}
                  </span>
                </div>

                {/* Details / Notes */}
                <div className="col-span-4 text-xs font-medium text-slate-700 px-1 leading-snug line-clamp-2">
                  {tx.details || '-'}
                </div>

                {/* Running Balance */}
                <div className="col-span-2 text-center font-bold text-slate-900 dir-ltr text-xs">
                  {tx.runningBalance.toLocaleString()}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Statement Summary */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-300 shadow-2xl max-w-md mx-auto p-2 z-20 space-y-1.5">
        <div className="grid grid-cols-2 gap-2 text-center font-bold text-xs">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-1.5">
            <span className="text-[10px] text-emerald-600 mx-1">{settings.creditLabel || t('credit')}</span>
            <span className="text-emerald-700 font-black text-sm dir-ltr">
              {totals.totalCredit.toLocaleString()}
            </span>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-1.5">
            <span className="text-[10px] text-red-600 mx-1">{settings.debitLabel || t('debit')}</span>
            <span className="text-red-700 font-black text-sm dir-ltr">
              {totals.totalDebit.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Net Balance Banner */}
        <div className={`p-2 rounded-xl text-center border font-black text-sm shadow-xs flex items-center justify-between px-4 ${
          totals.isNetDebit
            ? 'bg-red-100/90 border-red-300 text-red-800'
            : totals.isNetCredit
            ? 'bg-emerald-100/90 border-emerald-300 text-emerald-800'
            : 'bg-slate-100 border-slate-300 text-slate-700'
        }`}>
          <div className="flex items-center gap-1">
            <span>{t('balance')}:</span>
            {totals.isNetDebit ? (
              <span className="text-red-700 underline">{settings.debitLabel || t('debit')} {totals.netAmount.toLocaleString()} ({account.currency || settings.defaultCurrency})</span>
            ) : totals.isNetCredit ? (
              <span className="text-emerald-800 underline">{settings.creditLabel || t('credit')} {totals.netAmount.toLocaleString()} ({account.currency || settings.defaultCurrency})</span>
            ) : (
              <span>{t('balanced')} (0)</span>
            )}
          </div>

          <button
            onClick={onAddTransaction}
            className="p-1 rounded-lg bg-white/80 hover:bg-white shadow-xs text-slate-800 text-xs font-bold"
          >
            {t('addTransaction')}
          </button>
        </div>

        {/* Floating (+) button */}
        <button
          onClick={onAddTransaction}
          className={`fixed bottom-24 ${isEn ? 'right-4' : 'left-4'} w-12 h-12 rounded-full bg-[#7A0C1E] text-white shadow-xl flex items-center justify-center hover:bg-red-900 active:scale-90 transition z-30 border-2 border-white`}
          title={t('addTransaction')}
        >
          <Plus className="w-7 h-7" />
        </button>
      </div>
    </div>
  );
};

