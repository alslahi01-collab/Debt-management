import * as XLSX from 'xlsx';
import { Account, Transaction, AppSettings } from '../types';
import { calculateAccountTotals, calculateOverallTotals } from './storage';

export function exportAllDataToExcel(
  accounts: Account[],
  transactions: Transaction[],
  settings: AppSettings
) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Accounts Summary (كشف الحسابات الإجمالي)
  const accountsData = accounts.map((acc, index) => {
    const totals = calculateAccountTotals(acc.id, transactions);
    let status = 'متزن (0)';
    if (totals.isNetCredit) status = `${settings.creditLabel} (${totals.netAmount.toLocaleString()})`;
    if (totals.isNetDebit) status = `${settings.debitLabel} (${totals.netAmount.toLocaleString()})`;

    return {
      'م': index + 1,
      'اسم الحساب': acc.name,
      'رقم الهاتف': acc.phone || '-',
      'القسم': acc.category || 'عام',
      'العملة': acc.currency || settings.defaultCurrency,
      [`إجمالي (${settings.creditLabel})`]: totals.totalCredit,
      [`إجمالي (${settings.debitLabel})`]: totals.totalDebit,
      'الرصيد الصافي': totals.netBalance,
      'الحالة': status,
      'تاريخ الإنشاء': acc.createdAt || '-',
    };
  });

  const overall = calculateOverallTotals(accounts, transactions);
  accountsData.push({
    'م': 0,
    'اسم الحساب': '*** الإجمالي العام ***',
    'رقم الهاتف': '',
    'القسم': '',
    'العملة': settings.defaultCurrency,
    [`إجمالي (${settings.creditLabel})`]: overall.overallCredit,
    [`إجمالي (${settings.debitLabel})`]: overall.overallDebit,
    'الرصيد الصافي': overall.netOverall,
    'الحالة': overall.isNetCredit ? `صافي ${settings.creditLabel}` : `صافي ${settings.debitLabel}`,
    'تاريخ الإنشاء': new Date().toLocaleDateString('ar-YE'),
  });

  const wsAccounts = XLSX.utils.json_to_sheet(accountsData);
  XLSX.utils.book_append_sheet(wb, wsAccounts, 'الحسابات');

  // Sheet 2: All Transactions (سجل العمليات التفصيلي)
  const transactionsData = transactions.map((tx, index) => {
    const acc = accounts.find(a => a.id === tx.accountId);
    const typeLabel = tx.type === 'debit' ? settings.debitLabel : settings.creditLabel;

    return {
      'م': index + 1,
      'تاريخ العملية': tx.date,
      'الوقت': tx.time || '',
      'اسم الحساب': acc ? acc.name : 'حساب محذوف',
      'نوع الحركة': typeLabel,
      'المبلغ': tx.amount,
      'العملة': tx.currency || acc?.currency || settings.defaultCurrency,
      'التفاصيل / البيان': tx.details || '-',
    };
  });

  const wsTransactions = XLSX.utils.json_to_sheet(transactionsData);
  XLSX.utils.book_append_sheet(wb, wsTransactions, 'سجل العمليات');

  // Write and trigger download
  XLSX.writeFile(wb, `دفتر_الديون_${new Date().toISOString().split('T')[0]}.xlsx`);
}

export function exportAccountStatementToExcel(
  account: Account,
  transactions: Transaction[],
  settings: AppSettings
) {
  const wb = XLSX.utils.book_new();
  const accountTxs = transactions.filter(t => t.accountId === account.id);

  let runningBalance = 0;
  const rows = accountTxs.map((tx, index) => {
    const isDebit = tx.type === 'debit';
    const amount = Number(tx.amount || 0);

    if (isDebit) {
      runningBalance -= amount; // عليه reduces balance
    } else {
      runningBalance += amount; // له increases credit balance
    }

    return {
      'م': index + 1,
      'التاريخ والوقت': `${tx.date} ${tx.time || ''}`,
      'نوع الحركة': isDebit ? settings.debitLabel : settings.creditLabel,
      [`المبلغ (${settings.debitLabel})`]: isDebit ? amount : 0,
      [`المبلغ (${settings.creditLabel})`]: !isDebit ? amount : 0,
      'البيان والتفاصيل': tx.details || '-',
      'الرصيد التراكمي': runningBalance,
    };
  });

  const totals = calculateAccountTotals(account.id, transactions);
  rows.push({
    'م': 0,
    'التاريخ والوقت': '*** الإجمالي ***',
    'نوع الحركة': '-',
    [`المبلغ (${settings.debitLabel})`]: totals.totalDebit,
    [`المبلغ (${settings.creditLabel})`]: totals.totalCredit,
    'البيان والتفاصيل': `الرصيد النهائي: ${totals.isNetCredit ? settings.creditLabel : settings.debitLabel} ${totals.netAmount.toLocaleString()} ${account.currency}`,
    'الرصيد التراكمي': totals.netBalance,
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, `كشف_${account.name.replace(/\s+/g, '_')}`);

  XLSX.writeFile(wb, `كشف_حساب_${account.name}_${new Date().toISOString().split('T')[0]}.xlsx`);
}
