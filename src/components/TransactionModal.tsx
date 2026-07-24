import React, { useState, useEffect } from 'react';
import { X, Send, Trash2 } from 'lucide-react';
import { Transaction, DebtType, AppSettings, Account } from '../types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Partial<Transaction>, shareAfterSave?: boolean) => void;
  onDeleteTransaction?: (txId: string) => void;
  editTransaction?: Transaction | null;
  account: Account;
  settings: AppSettings;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDeleteTransaction,
  editTransaction,
  account,
  settings,
}) => {
  const [type, setType] = useState<DebtType>('debit');
  const [amount, setAmount] = useState<string>('');
  const [details, setDetails] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState<string>(
    new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
  );

  useEffect(() => {
    if (editTransaction) {
      setType(editTransaction.type || 'debit');
      setAmount(String(editTransaction.amount || ''));
      setDetails(editTransaction.details || '');
      setDate(editTransaction.date || new Date().toISOString().split('T')[0]);
      setTime(editTransaction.time || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
    } else {
      setType('debit');
      setAmount('');
      setDetails('');
      setDate(new Date().toISOString().split('T')[0]);
      setTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
    }
  }, [editTransaction, isOpen]);

  if (!isOpen) return null;

  const handleFormSubmit = (share: boolean = false) => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('يرجى إدخال مبلغ صحيح أكبر من صفر');
      return;
    }

    onSave(
      {
        id: editTransaction?.id,
        accountId: account.id,
        type,
        amount: numAmount,
        details: details.trim(),
        date,
        time,
        currency: account.currency || settings.defaultCurrency,
      },
      share
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in" dir="rtl">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden text-slate-800 animate-scale-up border border-slate-200">
        {/* Header */}
        <div className="bg-[#7A0C1E] text-white p-3.5 flex items-center justify-between border-b border-red-950">
          <div>
            <h2 className="font-bold text-base">
              {editTransaction ? 'تعديل الحركة المالية' : 'إضافة حركة جديدة'}
            </h2>
            <p className="text-xs text-white/80">الحساب: <span className="font-bold text-amber-300">{account.name}</span></p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Type Switcher: عليه (Debit) vs له (Credit) */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setType('debit')}
              className={`py-2 rounded-lg font-bold text-sm transition ${
                type === 'debit'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {settings.debitLabel} (مدين)
            </button>

            <button
              type="button"
              onClick={() => setType('credit')}
              className={`py-2 rounded-lg font-bold text-sm transition ${
                type === 'credit'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {settings.creditLabel} (دائن)
            </button>
          </div>

          {/* Amount input */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              المبلغ ({account.currency || settings.defaultCurrency})
            </label>
            <input
              type="number"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              autoFocus
              className="w-full h-11 text-xl font-black px-3 border border-slate-300 rounded-xl bg-white outline-none focus:border-[#1E2B6C] transition dir-ltr text-right"
              required
            />
          </div>

          {/* Details / Notes input */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              البيان والتفاصيل
            </label>
            <textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="أدخل تفاصيل العملية..."
              className="w-full p-2.5 text-sm font-semibold border border-slate-300 rounded-xl bg-white outline-none focus:border-[#1E2B6C] transition resize-none"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">التاريخ</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-9 px-2 text-xs font-semibold border border-slate-300 rounded-lg bg-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">الوقت</label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full h-9 px-2 text-xs font-semibold border border-slate-300 rounded-lg bg-white outline-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={() => handleFormSubmit(false)}
              className="w-full py-2.5 bg-[#7A0C1E] text-white font-bold rounded-xl shadow hover:bg-red-900 active:scale-95 transition text-sm"
            >
              حفظ العملية
            </button>

            {account.enableWhatsApp && account.phone && (
              <button
                type="button"
                onClick={() => handleFormSubmit(true)}
                className="w-full py-2 bg-emerald-600 text-white font-bold rounded-xl shadow hover:bg-emerald-700 active:scale-95 transition text-xs flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>حفظ وإرسال إشعار عبر {account.whatsappType === 'whatsapp' ? 'واتساب' : 'رسالة نصية'}</span>
              </button>
            )}

            {editTransaction && onDeleteTransaction && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('تأكيد: هل أنت متأكد من رغبتك في حذف هذه العملية المالية؟ لا يمكن التراجع عن هذا الإجراء.')) {
                    onDeleteTransaction(editTransaction.id);
                    onClose();
                  }
                }}
                className="w-full py-2 bg-red-50 text-red-700 font-bold rounded-xl border border-red-200 hover:bg-red-100 transition text-xs flex items-center justify-center gap-1.5 mt-2"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
                <span>حذف هذه العملية</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
