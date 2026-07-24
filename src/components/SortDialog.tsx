import React from 'react';
import { AccountSortOption, TransactionSortOption } from '../types';

interface AccountSortDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentSort: AccountSortOption;
  onSelectSort: (sort: AccountSortOption) => void;
}

export const AccountSortDialog: React.FC<AccountSortDialogProps> = ({
  isOpen,
  onClose,
  currentSort,
  onSelectSort,
}) => {
  if (!isOpen) return null;

  const options: { id: AccountSortOption; label: string }[] = [
    { id: 'default', label: 'الترتيب الإفتراضي' },
    { id: 'asc', label: 'ترتيب تصاعدي' },
    { id: 'desc', label: 'ترتيب تنازلي' },
    { id: 'dateAsc', label: 'تصاعدي حسب التاريخ' },
    { id: 'dateDesc', label: 'تنازلي حسب التاريخ' },
    { id: 'name', label: 'ترتيب حسب الاسم' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in" dir="rtl">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden text-slate-800 animate-scale-up">
        {/* Header */}
        <div className="bg-[#1E2B6C] text-white p-4 text-center font-bold text-base shadow">
          طريقة ترتيب الحسابات
        </div>

        {/* Radio List matching Screenshot 1 */}
        <div className="p-4 space-y-3">
          {options.map((opt) => {
            const isSelected = currentSort === opt.id;
            return (
              <label
                key={opt.id}
                onClick={() => {
                  onSelectSort(opt.id);
                  onClose();
                }}
                className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition border ${
                  isSelected ? 'border-[#1E2B6C] bg-indigo-50/60 font-bold text-[#1E2B6C]' : 'border-transparent hover:bg-slate-50'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  isSelected ? 'border-[#1E2B6C] bg-white' : 'border-slate-400'
                }`}>
                  {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#1E2B6C]" />}
                </div>
                <span className="text-sm select-none">{opt.label}</span>
              </label>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-left">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};

interface TransactionSortDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentSort: TransactionSortOption;
  onSelectSort: (sort: TransactionSortOption) => void;
}

export const TransactionSortDialog: React.FC<TransactionSortDialogProps> = ({
  isOpen,
  onClose,
  currentSort,
  onSelectSort,
}) => {
  if (!isOpen) return null;

  const options: { id: TransactionSortOption; label: string }[] = [
    { id: 'default', label: 'الترتيب الإفتراضي' },
    { id: 'asc', label: 'ترتيب تصاعدي' },
    { id: 'desc', label: 'ترتيب تنازلي' },
    { id: 'dateAsc', label: 'تصاعدي حسب التاريخ' },
    { id: 'dateDesc', label: 'تنازلي حسب التاريخ' },
    { id: 'details', label: 'ترتيب حسب البيان' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in" dir="rtl">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden text-slate-800 animate-scale-up">
        {/* Header */}
        <div className="bg-[#1E2B6C] text-white p-4 text-center font-bold text-base shadow">
          طريقة ترتيب العمليات
        </div>

        {/* Radio List matching Screenshot 2 */}
        <div className="p-4 space-y-3">
          {options.map((opt) => {
            const isSelected = currentSort === opt.id;
            return (
              <label
                key={opt.id}
                onClick={() => {
                  onSelectSort(opt.id);
                  onClose();
                }}
                className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition border ${
                  isSelected ? 'border-[#1E2B6C] bg-indigo-50/60 font-bold text-[#1E2B6C]' : 'border-transparent hover:bg-slate-50'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  isSelected ? 'border-[#1E2B6C] bg-white' : 'border-slate-400'
                }`}>
                  {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#1E2B6C]" />}
                </div>
                <span className="text-sm select-none">{opt.label}</span>
              </label>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-left">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};
