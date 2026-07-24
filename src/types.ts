export type DebtType = 'debit' | 'credit'; // debit = عليه (owed by account), credit = له (owed to account)

export interface Account {
  id: string;
  name: string;
  phone: string;
  category: string; // e.g. "ديون", "عملاء", "موردين", "عام"
  currency: string; // e.g. "ريال", "دولار", "سعودي"
  notes?: string;
  createdAt: string; // YYYY-MM-DD
  enableWhatsApp: boolean;
  whatsappType: 'whatsapp' | 'sms';
}

export interface Transaction {
  id: string;
  accountId: string;
  type: DebtType; // debit (عليه) or credit (له)
  amount: number;
  details: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm:ss
  currency?: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Currency {
  id: string;
  code: string;
  symbol: string;
  isDefault: boolean;
}

export type AccountSortOption = 
  | 'default' 
  | 'asc' 
  | 'desc' 
  | 'dateAsc' 
  | 'dateDesc' 
  | 'name';

export type TransactionSortOption = 
  | 'default' 
  | 'asc' 
  | 'desc' 
  | 'dateAsc' 
  | 'dateDesc' 
  | 'details';

export interface AppSettings {
  appName: string;
  phone: string;
  logoUrl: string;
  debitLabel: string; // Default: "عليه"
  creditLabel: string; // Default: "له"
  defaultCurrency: string; // Default: "ريال"
  accountCode: string;
  accountSort: AccountSortOption;
  transactionSort: TransactionSortOption;
  subscriptionActive: boolean;
  pinCode?: string;
  isPinRequired: boolean;
  language?: 'ar' | 'en';
  googleDriveEmail?: string;
  googleDriveAccessToken?: string;
}

export type ActiveTab = 'accounts' | 'categories' | 'currencies' | 'reports' | 'settings';
