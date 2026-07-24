import React, { useState, useEffect } from 'react';
import {
  Account,
  Transaction,
  Category,
  Currency,
  AppSettings,
  ActiveTab,
  AccountSortOption,
  TransactionSortOption,
} from './types';
import {
  getAccounts,
  saveAccounts,
  getTransactions,
  saveTransactions,
  getCategories,
  saveCategories,
  getCurrencies,
  saveCurrencies,
  getSettings,
  saveSettings,
  exportBackupJSON,
  importBackupJSON,
} from './utils/storage';
import { exportAllDataToExcel } from './utils/excel';

import { Header } from './components/Header';
import { Drawer } from './components/Drawer';
import { BottomNav } from './components/BottomNav';
import { AccountList } from './components/AccountList';
import { AccountDetails } from './components/AccountDetails';
import { AccountModal } from './components/AccountModal';
import { TransactionModal } from './components/TransactionModal';
import { AccountSortDialog, TransactionSortDialog } from './components/SortDialog';
import { SettingsView } from './components/SettingsView';
import { CurrenciesView } from './components/CurrenciesView';
import { CategoriesView } from './components/CategoriesView';
import { ReportsView } from './components/ReportsView';
import { PinLockModal } from './components/PinLockModal';
import { PrintStatement } from './components/PrintStatement';
import { StatementPdfModal } from './components/StatementPdfModal';
import { GoogleDriveBackupModal } from './components/GoogleDriveBackupModal';
import { InstallModal } from './components/InstallModal';
import { clearAllData } from './utils/storage';

export default function App() {
  // App data state
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [settings, setSettings] = useState<AppSettings>(getSettings());

  // Navigation & view states
  const [activeTab, setActiveTab] = useState<ActiveTab>('accounts');
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  // UI Modals & Drawers
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);

  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editAccount, setEditAccount] = useState<Account | null>(null);

  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);
  const [accountForTransaction, setAccountForTransaction] = useState<Account | null>(null);

  const [isAccountSortOpen, setIsAccountSortOpen] = useState(false);
  const [isTransactionSortOpen, setIsTransactionSortOpen] = useState(false);

  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const [isGoogleDriveModalOpen, setIsGoogleDriveModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  const [printableAccount, setPrintableAccount] = useState<Account | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfModalAccount, setPdfModalAccount] = useState<Account | null>(null);

  // Initial load
  useEffect(() => {
    const loadedAccounts = getAccounts();
    const loadedTxs = getTransactions();
    const loadedCats = getCategories();
    const loadedCurrs = getCurrencies();
    const loadedSettings = getSettings();

    setAccounts(loadedAccounts);
    setTransactions(loadedTxs);
    setCategories(loadedCats);
    setCurrencies(loadedCurrs);
    setSettings(loadedSettings);

    if (loadedSettings.isPinRequired && loadedSettings.pinCode) {
      setIsLocked(true);
    }
  }, []);

  // Sync state changes to storage
  const handleSaveAccountsState = (newAccounts: Account[]) => {
    setAccounts(newAccounts);
    saveAccounts(newAccounts);
  };

  const handleSaveTransactionsState = (newTxs: Transaction[]) => {
    setTransactions(newTxs);
    saveTransactions(newTxs);
  };

  const handleSaveCategoriesState = (newCats: Category[]) => {
    setCategories(newCats);
    saveCategories(newCats);
  };

  const handleSaveCurrenciesState = (newCurrs: Currency[]) => {
    setCurrencies(newCurrs);
    saveCurrencies(newCurrs);
  };

  const handleSaveSettingsState = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  // Account Operations
  const handleSaveAccount = (accountData: Partial<Account>) => {
    if (accountData.id) {
      // Edit
      const updated = accounts.map((acc) =>
        acc.id === accountData.id ? ({ ...acc, ...accountData } as Account) : acc
      );
      handleSaveAccountsState(updated);
      if (selectedAccount?.id === accountData.id) {
        setSelectedAccount(updated.find((a) => a.id === accountData.id) || null);
      }
    } else {
      // Create new
      const newAcc: Account = {
        id: 'acc-' + Date.now(),
        name: accountData.name || 'حساب جديد',
        phone: accountData.phone || '',
        category: accountData.category || categories[0]?.name || 'ديون',
        currency: accountData.currency || settings.defaultCurrency,
        createdAt: accountData.createdAt || new Date().toISOString().split('T')[0],
        enableWhatsApp: accountData.enableWhatsApp ?? true,
        whatsappType: accountData.whatsappType || 'whatsapp',
      };
      handleSaveAccountsState([...accounts, newAcc]);
    }
  };

  // Transaction Operations
  const handleSaveTransaction = (
    txData: Partial<Transaction>,
    shareAfterSave: boolean = false
  ) => {
    if (txData.id) {
      // Edit
      const updated = transactions.map((t) =>
        t.id === txData.id ? ({ ...t, ...txData } as Transaction) : t
      );
      handleSaveTransactionsState(updated);
    } else {
      // Create new
      const newTx: Transaction = {
        id: 'tx-' + Date.now(),
        accountId: txData.accountId!,
        type: txData.type || 'debit',
        amount: Number(txData.amount || 0),
        details: txData.details || '',
        date: txData.date || new Date().toISOString().split('T')[0],
        time:
          txData.time ||
          new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
          }),
        currency: txData.currency || settings.defaultCurrency,
      };
      handleSaveTransactionsState([...transactions, newTx]);

      // Trigger WhatsApp share if requested
      if (shareAfterSave) {
        const targetAcc = accounts.find((a) => a.id === txData.accountId);
        if (targetAcc && targetAcc.phone) {
          const typeLabel = newTx.type === 'debit' ? settings.debitLabel : settings.creditLabel;
          const text = `تنبيه حركة مالية:\nالحساب: ${targetAcc.name}\nالمبلغ: ${newTx.amount.toLocaleString()} ${newTx.currency} (${typeLabel})\nالبيان: ${newTx.details}\nالتاريخ: ${newTx.date}\n${settings.appName}`;
          const url = `https://wa.me/${targetAcc.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`;
          window.open(url, '_blank');
        }
      }
    }
  };

  const handleDeleteAccount = (accountId: string) => {
    handleSaveAccountsState(accounts.filter((a) => a.id !== accountId));
    handleSaveTransactionsState(transactions.filter((t) => t.accountId !== accountId));
    if (selectedAccount?.id === accountId) {
      setSelectedAccount(null);
    }
  };

  const handleDeleteTransaction = (txId: string) => {
    handleSaveTransactionsState(transactions.filter((t) => t.id !== txId));
  };

  // Backup & Restore
  const handleExportBackup = () => {
    const jsonStr = exportBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `نسخة_احتياطية_دفتر_الديون_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (fileContent: string) => {
    if (confirm('هل تريد استبدال جميع البيانات الحالية بالنسخة الاحتياطية؟')) {
      const success = importBackupJSON(fileContent);
      if (success) {
        alert('تم استعادة النسخة الاحتياطية بنجاح ✅');
        window.location.reload();
      } else {
        alert('ملف النسخة الاحتياطية غير صالحة');
      }
    }
  };

  const handleClearAllData = () => {
    if (confirm('تحذير شديد: هل تريد حقاً مسح كافة البيانات والتصنيفات من التطبيق؟ لا يمكن التراجع عن هذه الخطوة!')) {
      clearAllData();
      alert('تم مسح جميع البيانات بنجاح ✅');
      window.location.reload();
    }
  };

  // Direct PDF Statement View
  const handlePrintAccountStatement = (acc: Account | null) => {
    setPdfModalAccount(acc);
    setPrintableAccount(acc);
    setIsPdfModalOpen(true);
  };

  // Locked app barrier
  if (isLocked) {
    return (
      <PinLockModal
        isOpen={true}
        onClose={() => {}}
        settings={settings}
        onSavePin={() => {}}
        isUnlockMode={true}
        onUnlockSuccess={() => setIsLocked(false)}
      />
    );
  }

  return (
    <div className="flex justify-center bg-slate-900 min-h-screen">
      {/* Mobile container wrapper */}
      <div className="w-full max-w-md bg-slate-100 min-h-screen flex flex-col shadow-2xl relative overflow-hidden">
        {/* Top Header (only when not in Account Details or subview with custom header) */}
        {!selectedAccount && activeTab === 'accounts' && (
          <Header
            title={settings.appName || 'دفتر الديون'}
            onOpenDrawer={() => setIsDrawerOpen(true)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            showSearchInput={showSearchInput}
            onToggleSearch={() => setShowSearchInput(!showSearchInput)}
          />
        )}

        {/* Navigation Side Drawer */}
        <Drawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          settings={settings}
          onNavigateTab={(tab) => {
            setSelectedAccount(null);
            setActiveTab(tab);
          }}
          onExportExcel={() => exportAllDataToExcel(accounts, transactions, settings)}
          onExportBackup={handleExportBackup}
          onImportBackup={handleImportBackup}
          onTogglePinModal={() => setIsPinModalOpen(true)}
          onOpenGoogleDrive={() => setIsGoogleDriveModalOpen(true)}
          onClearData={handleClearAllData}
          onOpenInstallModal={() => setIsInstallModalOpen(true)}
        />

        {/* View Router */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {selectedAccount ? (
            /* Subview: Account Details Statement */
            <AccountDetails
              account={selectedAccount}
              transactions={transactions}
              settings={settings}
              onBack={() => setSelectedAccount(null)}
              onAddTransaction={() => {
                setAccountForTransaction(selectedAccount);
                setEditTransaction(null);
                setIsTransactionModalOpen(true);
              }}
              onEditTransaction={(tx) => {
                setAccountForTransaction(selectedAccount);
                setEditTransaction(tx);
                setIsTransactionModalOpen(true);
              }}
              onDeleteTransaction={handleDeleteTransaction}
              onOpenSortDialog={() => setIsTransactionSortOpen(true)}
              transactionSort={settings.transactionSort}
              onPrintAccountStatement={handlePrintAccountStatement}
            />
          ) : (
            /* Main Tabs */
            <>
              {activeTab === 'accounts' && (
                <AccountList
                  accounts={accounts}
                  transactions={transactions}
                  settings={settings}
                  categories={categories}
                  currencies={currencies}
                  searchQuery={searchQuery}
                  onSelectAccount={(acc) => setSelectedAccount(acc)}
                  onEditAccount={(acc) => {
                    setEditAccount(acc);
                    setIsAccountModalOpen(true);
                  }}
                  onAddTransaction={(acc) => {
                    setAccountForTransaction(acc);
                    setEditTransaction(null);
                    setIsTransactionModalOpen(true);
                  }}
                  onOpenSortDialog={() => setIsAccountSortOpen(true)}
                  onExportExcel={() => exportAllDataToExcel(accounts, transactions, settings)}
                  onPrintList={() => {
                    handlePrintAccountStatement(null);
                  }}
                  accountSort={settings.accountSort}
                />
              )}

              {activeTab === 'categories' && (
                <CategoriesView
                  categories={categories}
                  onSaveCategories={handleSaveCategoriesState}
                  onBack={() => setActiveTab('accounts')}
                />
              )}

              {activeTab === 'currencies' && (
                <CurrenciesView
                  currencies={currencies}
                  onSaveCurrencies={handleSaveCurrenciesState}
                  onBack={() => setActiveTab('accounts')}
                />
              )}

              {activeTab === 'reports' && (
                <ReportsView
                  accounts={accounts}
                  transactions={transactions}
                  categories={categories}
                  settings={settings}
                  onBack={() => setActiveTab('accounts')}
                  onSelectAccount={(acc) => setSelectedAccount(acc)}
                  onPrintReport={() => handlePrintAccountStatement(null)}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsView
                  settings={settings}
                  onSaveSettings={handleSaveSettingsState}
                  onOpenAccountSort={() => setIsAccountSortOpen(true)}
                  onOpenTransactionSort={() => setIsTransactionSortOpen(true)}
                  onTogglePinModal={() => setIsPinModalOpen(true)}
                  onBack={() => setActiveTab('accounts')}
                  onNavigateCurrencies={() => setActiveTab('currencies')}
                  onOpenGoogleDriveModal={() => setIsGoogleDriveModalOpen(true)}
                  onClearAllData={handleClearAllData}
                />
              )}
            </>
          )}
        </main>

        {/* Bottom Navigation Bar */}
        {!selectedAccount && (
          <BottomNav
            activeTab={activeTab}
            onTabChange={(tab) => {
              setSelectedAccount(null);
              setActiveTab(tab);
            }}
            onQuickAdd={() => {
              setEditAccount(null);
              setIsAccountModalOpen(true);
            }}
            lang={settings.language || 'ar'}
          />
        )}

        {/* Dialog Modals */}
        <AccountModal
          isOpen={isAccountModalOpen}
          onClose={() => setIsAccountModalOpen(false)}
          onSave={handleSaveAccount}
          onDeleteAccount={handleDeleteAccount}
          editAccount={editAccount}
          categories={categories}
          currencies={currencies}
        />

        {accountForTransaction && (
          <TransactionModal
            isOpen={isTransactionModalOpen}
            onClose={() => setIsTransactionModalOpen(false)}
            onSave={handleSaveTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            editTransaction={editTransaction}
            account={accountForTransaction}
            settings={settings}
          />
        )}

        <AccountSortDialog
          isOpen={isAccountSortOpen}
          onClose={() => setIsAccountSortOpen(false)}
          currentSort={settings.accountSort}
          onSelectSort={(sortOption) => {
            handleSaveSettingsState({ ...settings, accountSort: sortOption });
          }}
        />

        <TransactionSortDialog
          isOpen={isTransactionSortOpen}
          onClose={() => setIsTransactionSortOpen(false)}
          currentSort={settings.transactionSort}
          onSelectSort={(sortOption) => {
            handleSaveSettingsState({ ...settings, transactionSort: sortOption });
          }}
        />

        <PinLockModal
          isOpen={isPinModalOpen}
          onClose={() => setIsPinModalOpen(false)}
          settings={settings}
          onSavePin={(pinCode, isRequired) => {
            handleSaveSettingsState({
              ...settings,
              pinCode,
              isPinRequired: isRequired,
            });
          }}
        />

        <GoogleDriveBackupModal
          isOpen={isGoogleDriveModalOpen}
          onClose={() => setIsGoogleDriveModalOpen(false)}
          settings={settings}
          onSaveSettings={handleSaveSettingsState}
          accounts={accounts}
          transactions={transactions}
          categories={categories}
          currencies={currencies}
          onRestoreSuccess={() => {
            setAccounts(getAccounts());
            setTransactions(getTransactions());
          }}
        />

        <InstallModal
          isOpen={isInstallModalOpen}
          onClose={() => setIsInstallModalOpen(false)}
          settings={settings}
        />

        {/* Direct PDF View Modal */}
        <StatementPdfModal
          isOpen={isPdfModalOpen}
          onClose={() => setIsPdfModalOpen(false)}
          account={pdfModalAccount}
          accounts={accounts}
          transactions={transactions}
          settings={settings}
        />

        {/* Hidden Printable Container */}
        <PrintStatement
          account={printableAccount}
          transactions={transactions}
          settings={settings}
        />
      </div>
    </div>
  );
}
