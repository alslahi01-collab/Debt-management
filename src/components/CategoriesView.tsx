import React, { useState } from 'react';
import { ArrowRight, Pencil, Plus, Trash2, FolderKanban } from 'lucide-react';
import { Category } from '../types';

interface CategoriesViewProps {
  categories: Category[];
  onSaveCategories: (categories: Category[]) => void;
  onBack: () => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories,
  onSaveCategories,
  onBack,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [catName, setCatName] = useState('');
  const [editingCat, setEditingCat] = useState<Category | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    if (editingCat) {
      const updated = categories.map((c) =>
        c.id === editingCat.id ? { ...c, name: catName.trim() } : c
      );
      onSaveCategories(updated);
    } else {
      const newCat: Category = {
        id: 'cat-' + Date.now(),
        name: catName.trim(),
      };
      onSaveCategories([...categories, newCat]);
    }

    setCatName('');
    setEditingCat(null);
    setShowAddModal(false);
  };

  const handleDelete = (id: string) => {
    if (categories.length <= 1) {
      alert('يجب الإبقاء على قسم واحد على الأقل');
      return;
    }
    onSaveCategories(categories.filter((c) => c.id !== id));
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 text-slate-800 pb-20 select-none" dir="rtl">
      {/* Header */}
      <div className="bg-[#7A0C1E] text-white px-3 py-3 shadow-md flex items-center justify-between sticky top-0 z-30 border-b border-red-950">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="p-1 rounded-full hover:bg-white/10 text-white">
            <ArrowRight className="w-6 h-6" />
          </button>
          <h1 className="font-bold text-lg">الأقسام</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 max-w-md mx-auto w-full">
        <div className="bg-[#7A0C1E] text-white font-bold text-sm py-2 text-center rounded-xl shadow-xs">
          إدارة الأقسام والفئات
        </div>

        <div className="space-y-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <FolderKanban className="w-5 h-5 text-[#7A0C1E]" />
                <span className="font-bold text-slate-900 text-sm">{cat.name}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingCat(cat);
                    setCatName(cat.name);
                    setShowAddModal(true);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-800"
                  title="تعديل"
                >
                  <Pencil className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDelete(cat.id)}
                  className="p-1 text-red-400 hover:text-red-600"
                  title="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Action (+) button */}
      <button
        onClick={() => {
          setEditingCat(null);
          setCatName('');
          setShowAddModal(true);
        }}
        className="fixed bottom-20 left-6 w-14 h-14 rounded-full bg-[#7A0C1E] text-white shadow-xl flex items-center justify-center hover:bg-red-900 active:scale-90 transition z-30 border-2 border-white"
        title="إضافة قسم جديد"
      >
        <Plus className="w-8 h-8" />
      </button>

      {/* Add / Edit Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <form
            onSubmit={handleSave}
            className="bg-white w-full max-w-xs rounded-2xl p-4 shadow-2xl space-y-3"
          >
            <h3 className="font-bold text-slate-900 text-base text-center">
              {editingCat ? 'تعديل قسم' : 'إضافة قسم جديد'}
            </h3>

            <div>
              <label className="text-xs font-bold text-slate-500">اسم القسم (مثال: ديون, عملاء)</label>
              <input
                type="text"
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                placeholder="اسم القسم..."
                className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-sm outline-none mt-1"
                required
                autoFocus
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
