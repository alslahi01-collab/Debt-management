import React, { useState } from 'react';
import { ArrowRight, Pencil, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { Currency } from '../types';

interface CurrenciesViewProps {
  currencies: Currency[];
  onSaveCurrencies: (currencies: Currency[]) => void;
  onBack: () => void;
}

export const CurrenciesView: React.FC<CurrenciesViewProps> = ({
  currencies,
  onSaveCurrencies,
  onBack,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newSymbol, setNewSymbol] = useState('');
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);

  const defaultCurr = currencies.find((c) => c.isDefault) || currencies[0];

  const handleSetDefault = (currId: string) => {
    const updated = currencies.map((c) => ({
      ...c,
      isDefault: c.id === currId,
    }));
    onSaveCurrencies(updated);
  };

  const handleSaveCurrency = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;

    if (editingCurrency) {
      const updated = currencies.map((c) =>
        c.id === editingCurrency.id
          ? { ...c, code: newCode.trim(), symbol: newSymbol.trim() || newCode.trim() }
          : c
      );
      onSaveCurrencies(updated);
    } else {
      const newCurr: Currency = {
        id: 'curr-' + Date.now(),
        code: newCode.trim(),
        symbol: newSymbol.trim() || newCode.trim(),
        isDefault: false,
      };
      onSaveCurrencies([...currencies, newCurr]);
    }

    setNewCode('');
    setNewSymbol('');
    setEditingCurrency(null);
    setShowAddModal(false);
  };

  const handleDeleteCurrency = (id: string) => {
    if (currencies.length <= 1) {
      alert('يجب الإبقاء على عملة واحدة على الأقل');
      return;
    }
    const updated = currencies.filter((c) => c.id !== id);
    onSaveCurrencies(updated);
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 text-slate-800 pb-20 select-none" dir="rtl">
      {/* Header */}
      <div className="bg-[#7A0C1E] text-white px-3 py-3 shadow-md flex items-center justify-between sticky top-0 z-30 border-b border-red-950">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="p-1 rounded-full hover:bg-white/10 text-white">
            <ArrowRight className="w-6 h-6" />
          </button>
          <h1 className="font-bold text-lg">العملات</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-md mx-auto w-full">
        {/* Default Currency Box */}
        <div className="bg-white p-3 rounded-xl border border-slate-300 shadow-2xs space-y-1">
          <label className="text-[11px] font-bold text-slate-400 block text-center">
            العملة الإفتراضية
          </label>
          <select
            value={defaultCurr?.id}
            onChange={(e) => handleSetDefault(e.target.value)}
            className="w-full text-center text-base font-black text-[#7A0C1E] bg-transparent outline-none cursor-pointer"
          >
            {currencies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} ({c.symbol})
              </option>
            ))}
          </select>
        </div>

        {/* Currency Banner Tab */}
        <div className="bg-[#7A0C1E] text-white font-bold text-sm py-2 text-center rounded-xl shadow-xs">
          قائمة العملات المتاحة
        </div>

        {/* Currencies List */}
        <div className="space-y-2">
          {currencies.map((curr) => (
            <div
              key={curr.id}
              className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingCurrency(curr);
                    setNewCode(curr.code);
                    setNewSymbol(curr.symbol);
                    setShowAddModal(true);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-800"
                  title="تعديل"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <span className="font-bold text-slate-900 text-sm">{curr.code}</span>
                <span className="text-xs text-slate-400 font-semibold">({curr.symbol})</span>
              </div>

              <div className="flex items-center gap-2">
                {curr.isDefault ? (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                    الافتراضية
                  </span>
                ) : (
                  <button
                    onClick={() => handleDeleteCurrency(curr.id)}
                    className="p-1 text-red-400 hover:text-red-600"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Action Button (+) */}
      <button
        onClick={() => {
          setEditingCurrency(null);
          setNewCode('');
          setNewSymbol('');
          setShowAddModal(true);
        }}
        className="fixed bottom-20 left-6 w-14 h-14 rounded-full bg-[#7A0C1E] text-white shadow-xl flex items-center justify-center hover:bg-red-900 active:scale-90 transition z-30 border-2 border-white"
        title="إضافة عملة جديدة"
      >
        <Plus className="w-8 h-8" />
      </button>

      {/* Add / Edit Currency Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <form
            onSubmit={handleSaveCurrency}
            className="bg-white w-full max-w-xs rounded-2xl p-4 shadow-2xl space-y-3"
          >
            <h3 className="font-bold text-slate-900 text-base text-center">
              {editingCurrency ? 'تعديل عملة' : 'إضافة عملة جديدة'}
            </h3>

            <div>
              <label className="text-xs font-bold text-slate-500">اسم العملة (مثال: ريال يمني, دولار)</label>
              <input
                type="text"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="اسم العملة..."
                className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-sm outline-none mt-1"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500">رمز العملة (مثال: ر.ي, $)</label>
              <input
                type="text"
                value={newSymbol}
                onChange={(e) => setNewSymbol(e.target.value)}
                placeholder="الرمز..."
                className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-sm outline-none mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="submit"
                className="py-2 bg-[#7A0C1E] text-white font-bold rounded-xl text-xs hover:bg-red-900"
              >
                حفظ
              </button>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="py-2 bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
