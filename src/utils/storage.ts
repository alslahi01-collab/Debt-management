import { Account, Transaction, Category, Currency, AppSettings } from '../types';

const ACCOUNTS_KEY = 'debt_book_accounts_v1';
const TRANSACTIONS_KEY = 'debt_book_transactions_v1';
const CATEGORIES_KEY = 'debt_book_categories_v1';
const CURRENCIES_KEY = 'debt_book_currencies_v1';
const SETTINGS_KEY = 'debt_book_settings_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  appName: 'إدارة الديون',
  phone: '',
  logoUrl: '',
  debitLabel: 'عليه',
  creditLabel: 'له',
  defaultCurrency: 'ريال',
  accountCode: '',
  accountSort: 'default',
  transactionSort: 'default',
  subscriptionActive: true,
  isPinRequired: false,
  language: 'ar',
};

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'ديون' },
  { id: 'cat-2', name: 'عملاء' },
  { id: 'cat-3', name: 'موردين' },
  { id: 'cat-4', name: 'مصاريف شخصية' },
];

export const DEFAULT_CURRENCIES: Currency[] = [
  { id: 'curr-1', code: 'ريال يمني', symbol: 'ر.ي', isDefault: true },
  { id: 'curr-2', code: 'دولار أمريكي', symbol: '$', isDefault: false },
  { id: 'curr-3', code: 'ريال سعودي', symbol: 'ر.س', isDefault: false },
];

export const INITIAL_ACCOUNTS: Account[] = [];

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export function getSettings(): AppSettings {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function getCategories(): Category[] {
  try {
    const data = localStorage.getItem(CATEGORIES_KEY);
    if (!data) {
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(DEFAULT_CATEGORIES));
      return DEFAULT_CATEGORIES;
    }
    return JSON.parse(data);
  } catch {
    return DEFAULT_CATEGORIES;
  }
}

export function saveCategories(categories: Category[]): void {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
}

export function getCurrencies(): Currency[] {
  try {
    const data = localStorage.getItem(CURRENCIES_KEY);
    if (!data) {
      localStorage.setItem(CURRENCIES_KEY, JSON.stringify(DEFAULT_CURRENCIES));
      return DEFAULT_CURRENCIES;
    }
    return JSON.parse(data);
  } catch {
    return DEFAULT_CURRENCIES;
  }
}

export function saveCurrencies(currencies: Currency[]): void {
  localStorage.setItem(CURRENCIES_KEY, JSON.stringify(currencies));
}

export function getAccounts(): Account[] {
  try {
    const data = localStorage.getItem(ACCOUNTS_KEY);
    if (!data) {
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(INITIAL_ACCOUNTS));
      return INITIAL_ACCOUNTS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_ACCOUNTS;
  }
}

export function saveAccounts(accounts: Account[]): void {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function getTransactions(): Transaction[] {
  try {
    const data = localStorage.getItem(TRANSACTIONS_KEY);
    if (!data) {
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(INITIAL_TRANSACTIONS));
      return INITIAL_TRANSACTIONS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_TRANSACTIONS;
  }
}

export function saveTransactions(transactions: Transaction[]): void {
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
}

// Balance calculations for account
export function calculateAccountTotals(accountId: string, allTransactions: Transaction[]) {
  const accountTxs = allTransactions.filter(t => t.accountId === accountId);
  let totalDebit = 0;  // عليه
  let totalCredit = 0; // له

  for (const tx of accountTxs) {
    if (tx.type === 'debit') {
      totalDebit += Number(tx.amount || 0);
    } else {
      totalCredit += Number(tx.amount || 0);
    }
  }

  const netBalance = totalCredit - totalDebit; // positive = credit (له), negative = debit (عليه)
  return {
    totalDebit,
    totalCredit,
    netBalance,
    isNetCredit: netBalance > 0,
    isNetDebit: netBalance < 0,
    netAmount: Math.abs(netBalance)
  };
}

// Calculate total balance across all accounts
export function calculateOverallTotals(accounts: Account[], transactions: Transaction[]) {
  let overallDebit = 0;  // عليه الإجمالي
  let overallCredit = 0; // له الإجمالي

  for (const acc of accounts) {
    const { totalDebit, totalCredit } = calculateAccountTotals(acc.id, transactions);
    overallDebit += totalDebit;
    overallCredit += totalCredit;
  }

  const netOverall = overallCredit - overallDebit;
  return {
    overallDebit,
    overallCredit,
    netOverall,
    isNetCredit: netOverall > 0,
    isNetDebit: netOverall < 0,
    netAmount: Math.abs(netOverall)
  };
}

// Backup & Restore helpers
export function exportBackupJSON(): string {
  const data = {
    settings: getSettings(),
    categories: getCategories(),
    currencies: getCurrencies(),
    accounts: getAccounts(),
    transactions: getTransactions(),
    exportDate: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
}

export function importBackupJSON(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (data.accounts && Array.isArray(data.accounts)) {
      saveAccounts(data.accounts);
    }
    if (data.transactions && Array.isArray(data.transactions)) {
      saveTransactions(data.transactions);
    }
    if (data.categories && Array.isArray(data.categories)) {
      saveCategories(data.categories);
    }
    if (data.currencies && Array.isArray(data.currencies)) {
      saveCurrencies(data.currencies);
    }
    if (data.settings) {
      saveSettings({ ...DEFAULT_SETTINGS, ...data.settings });
    }
    return true;
  } catch (err) {
    console.error('Import backup failed:', err);
    return false;
  }
}

export function clearAllData(): void {
  try {
    localStorage.removeItem(ACCOUNTS_KEY);
    localStorage.removeItem(TRANSACTIONS_KEY);
    localStorage.removeItem(CATEGORIES_KEY);
    localStorage.removeItem(CURRENCIES_KEY);
    localStorage.removeItem(SETTINGS_KEY);
  } catch (e) {
    console.error('Failed to clear data', e);
  }
}

