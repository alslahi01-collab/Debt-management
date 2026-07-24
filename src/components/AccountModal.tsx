import React, { useState, useEffect } from 'react';
import { User, Phone, Calendar, ListOrdered, RefreshCw, X, Trash2, AlertTriangle } from 'lucide-react';
import { Account, Category, Currency } from '../types';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (account: Partial<Account>) => void;
  onDeleteAccount?: (accountId: string) => void;
  editAccount?: Account | null;
  categories: Category[];
  currencies: Currency[];
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDeleteAccount,
  editAccount,
  categories,
  currencies,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState(categories[0]?.name || 'ديون');
  const [currency, setCurrency] = useState(currencies.find(c => c.isDefault)?.code || 'ريال');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [enableWhatsApp, setEnableWhatsApp] = useState(true);
  const [whatsappType, setWhatsappType] = useState<'whatsapp' | 'sms'>('whatsapp');

  // Confirmation state for account deletion
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [confirmFirstNameInput, setConfirmFirstNameInput] = useState('');

  const firstName = editAccount ? editAccount.name.trim().split(' ')[0] : '';

  useEffect(() => {
    setShowDeleteConfirm(false);
    setConfirmFirstNameInput('');
    if (editAccount) {
      setName(editAccount.name || '');
      setPhone(editAccount.phone || '');
      setCategory(editAccount.category || categories[0]?.name || 'ديون');
      setCurrency(editAccount.currency || 'ريال');
      setDate(editAccount.createdAt || new Date().toISOString().split('T')[0]);
      setEnableWhatsApp(editAccount.enableWhatsApp ?? true);
      setWhatsappType(editAccount.whatsappType || 'whatsapp');
    } else {
      setName('');
      setPhone('');
      setCategory(categories[0]?.name || 'ديون');
      setCurrency(currencies.find(c => c.isDefault)?.code || 'ريال');
      setDate(new Date().toISOString().split('T')[0]);
      setEnableWhatsApp(true);
      setWhatsappType('whatsapp');
    }
  }, [editAccount, isOpen, categories, currencies]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('يرجى إدخال اسم الحساب');
      return;
    }

    onSave({
      id: editAccount?.id,
      name: name.trim(),
      phone: phone.trim(),
      category,
      currency,
      createdAt: date,
      enableWhatsApp,
      whatsappType,
    });
    onClose();
  };

  const handleConfirmDeleteAccount = () => {
    if (!editAccount || !onDeleteAccount) return;
    if (confirmFirstNameInput.trim().toLowerCase() !== firstName.toLowerCase()) {
      alert('الاسم الأول غير مطابق! يرجى إدخال الاسم الأول بشكل صحيح للتأكيد.');
      return;
    }

    onDeleteAccount(editAccount.id);
    setShowDeleteConfirm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in" dir="rtl">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden text-slate-800 animate-scale-up border border-slate-200">
        {/* Header bar */}
        <div className="bg-[#7A0C1E] text-white p-3.5 flex items-center justify-between border-b border-red-950">
          <h2 className="font-bold text-base">
            {editAccount ? 'تعديل حساب' : 'إضافة حساب جديد'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Form Container */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
          {/* 1. الأقسام (Category) */}
          <div className="flex gap-2">
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-300 flex items-center justify-center shrink-0">
              <ListOrdered className="w-5 h-5 text-slate-600" />
            </div>
            <div className="flex-1 relative">
              <label className="text-[11px] font-bold text-slate-500 absolute -top-2 bg-white px-1 right-2 z-10">
                الأقسام
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 border border-slate-300 rounded-xl px-3 text-sm font-semibold bg-white outline-none focus:border-[#1E2B6C] transition"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 2. الاسم (Account Name) */}
          <div className="flex gap-2">
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-300 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-slate-600" />
            </div>
            <div className="flex-1 relative">
              <label className="text-[11px] font-bold text-slate-500 absolute -top-2 bg-white px-1 right-2 z-10">
                الاسم
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="أدخل اسم الحساب..."
                className="w-full h-10 border border-slate-300 rounded-xl px-3 text-sm font-bold bg-white outline-none focus:border-[#1E2B6C] transition"
                required
              />
            </div>
          </div>

          {/* 3. رقم الهاتف (Phone) */}
          <div className="flex gap-2">
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-300 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5 text-slate-600" />
            </div>
            <div className="flex-1 relative">
              <label className="text-[11px] font-bold text-slate-500 absolute -top-2 bg-white px-1 right-2 z-10">
                رقم الهاتف
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="77XXXXXXX"
                className="w-full h-10 border border-slate-300 rounded-xl px-3 text-sm font-semibold bg-white outline-none focus:border-[#1E2B6C] transition dir-ltr text-right"
              />
            </div>
          </div>

          {/* 4. التاريخ (Date) */}
          <div className="flex gap-2">
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-300 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-slate-600" />
            </div>
            <div className="flex-1 relative">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-10 border border-slate-300 rounded-xl px-3 text-sm font-semibold bg-white outline-none focus:border-[#1E2B6C] transition"
              />
            </div>
          </div>

          {/* 5. العملات (Currency) */}
          <div className="flex gap-2">
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-300 flex items-center justify-center shrink-0">
              <RefreshCw className="w-5 h-5 text-slate-600" />
            </div>
            <div className="flex-1 relative">
              <label className="text-[11px] font-bold text-slate-500 absolute -top-2 bg-white px-1 right-2 z-10">
                العملات
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full h-10 border border-slate-300 rounded-xl px-3 text-sm font-semibold bg-white outline-none focus:border-[#1E2B6C] transition"
              >
                {currencies.map((curr) => (
                  <option key={curr.id} value={curr.code}>
                    {curr.code} ({curr.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 6. WhatsApp & Notification checkbox */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
              <input
                type="checkbox"
                checked={enableWhatsApp}
                onChange={(e) => setEnableWhatsApp(e.target.checked)}
                className="w-4 h-4 accent-[#7A0C1E] rounded cursor-pointer"
              />
              <span>تفعيل ميزة إرسال الرسائل الفوريات</span>
            </label>

            {enableWhatsApp && (
              <div className="flex items-center gap-6 pr-6 text-xs font-medium text-slate-600">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="whatsappType"
                    checked={whatsappType === 'whatsapp'}
                    onChange={() => setWhatsappType('whatsapp')}
                    className="accent-[#7A0C1E]"
                  />
                  <span>واتساب</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="whatsappType"
                    checked={whatsappType === 'sms'}
                    onChange={() => setWhatsappType('sms')}
                    className="accent-[#7A0C1E]"
                  />
                  <span>نصية</span>
                </label>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-3">
            <button
              type="submit"
              className="py-2.5 bg-[#7A0C1E] text-white font-bold rounded-xl shadow hover:bg-red-900 active:scale-95 transition text-sm"
            >
              حفظ
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 bg-slate-200 text-slate-800 font-bold rounded-xl hover:bg-slate-300 active:scale-95 transition text-sm"
            >
              إلغاء
            </button>
          </div>

          {/* Delete Customer section */}
          {editAccount && onDeleteAccount && (
            <div className="pt-2 border-t border-slate-200">
              {!showDeleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full py-2 bg-red-50 text-red-700 border border-red-200 font-bold rounded-xl hover:bg-red-100 transition text-xs flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                  <span>حذف هذا العميل نهائياً</span>
                </button>
              ) : (
                <div className="p-3 bg-red-50 border border-red-300 rounded-xl space-y-2 text-xs">
                  <div className="flex items-start gap-1.5 text-red-900 font-bold">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                    <span>تحذير: سيتم حذف العميل ({editAccount.name}) وكافة العمليات الخاصة به!</span>
                  </div>
                  <p className="text-slate-700 text-[11px] font-semibold">
                    للتأكيد، يرجى كتابة الاسم الأول للعميل (<span className="font-extrabold text-red-800">{firstName}</span>) في الخانة أدناه:
                  </p>
                  <input
                    type="text"
                    value={confirmFirstNameInput}
                    onChange={(e) => setConfirmFirstNameInput(e.target.value)}
                    placeholder={`اكتب "${firstName}" هنا`}
                    className="w-full h-9 px-2.5 border border-red-300 rounded-lg bg-white outline-none font-bold text-center text-red-900"
                    autoFocus
                  />
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleConfirmDeleteAccount}
                      disabled={confirmFirstNameInput.trim().toLowerCase() !== firstName.toLowerCase()}
                      className="py-1.5 bg-red-600 text-white font-bold rounded-lg shadow disabled:opacity-40 disabled:cursor-not-allowed hover:bg-red-700 transition text-xs"
                    >
                      تأكيد الحذف
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="py-1.5 bg-slate-200 text-slate-800 font-bold rounded-lg hover:bg-slate-300 transition text-xs"
                    >
                      تراجع
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
