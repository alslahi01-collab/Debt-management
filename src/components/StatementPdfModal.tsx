import React from 'react';
import { X, Printer, Share2, FileText } from 'lucide-react';
import { Account, Transaction, AppSettings } from '../types';
import { calculateAccountTotals } from '../utils/storage';

interface StatementPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: Account | null;
  accounts?: Account[];
  transactions: Transaction[];
  settings: AppSettings;
}

export const StatementPdfModal: React.FC<StatementPdfModalProps> = ({
  isOpen,
  onClose,
  account,
  accounts = [],
  transactions,
  settings,
}) => {
  if (!isOpen) return null;

  const isOverallSummary = !account && accounts.length > 0;
  if (!account && !isOverallSummary) return null;

  const accountTxs = account ? transactions.filter((t) => t.accountId === account.id) : [];
  const totals = account ? calculateAccountTotals(account.id, transactions) : { totalDebit: 0, totalCredit: 0, netAmount: 0, isNetCredit: false, isNetDebit: false };

  let totalOverallDebit = 0;
  let totalOverallCredit = 0;

  if (account) {
    accountTxs.forEach((t) => {
      if (t.type === 'debit') totalOverallDebit += Number(t.amount || 0);
      else totalOverallCredit += Number(t.amount || 0);
    });
  } else {
    transactions.forEach((t) => {
      if (t.type === 'debit') totalOverallDebit += Number(t.amount || 0);
      else totalOverallCredit += Number(t.amount || 0);
    });
  }

  let runningBalance = 0;
  const todayStr = new Date().toLocaleDateString('en-GB');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/80 backdrop-blur-xs animate-fade-in print:hidden" dir="rtl">
      {/* Top Toolbar */}
      <div className="bg-[#7A0C1E] text-white p-3 px-4 flex items-center justify-between border-b border-red-950 shadow-md shrink-0">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-amber-300" />
          <h2 className="font-bold text-sm sm:text-base">
            معاينة ملف PDF - {account ? `كشف حساب ${account.name}` : 'كشف الديون الإجمالي'}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة / حفظ PDF</span>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white transition"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Preview Container simulating A4 Document view */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6 flex justify-center bg-slate-200">
        <div className="bg-white text-black font-sans w-full max-w-3xl p-6 shadow-2xl rounded-sm border border-slate-300 self-start my-auto">
          {/* Header Box */}
          <div className="border border-black p-3 rounded-xs mb-3">
            <div className="grid grid-cols-3 items-center text-center">
              {/* Left info */}
              <div className="text-left font-bold text-xs space-y-0.5 dir-ltr">
                <p className="font-black text-sm">{settings.appName || 'Debt Book'}</p>
                <p className="text-slate-700">Yemen</p>
                {settings.phone && <p className="text-slate-900">{settings.phone}</p>}
              </div>

              {/* Center Logo */}
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-md border border-black overflow-hidden bg-slate-100 flex items-center justify-center">
                  {settings.logoUrl ? (
                    <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-[#7A0C1E] font-black text-xs">
                      <span>إدارة</span>
                      <span className="text-amber-600">الديون</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right info */}
              <div className="text-right font-bold text-xs space-y-0.5 dir-rtl">
                <p className="font-black text-sm">{settings.appName || 'دفتر الديون'}</p>
                {settings.phone && <p className="text-slate-900">{settings.phone}</p>}
              </div>
            </div>
          </div>

          {/* Title badge */}
          <div className="flex justify-center my-3">
            <div className="border border-black rounded-lg px-6 py-1 bg-white font-black text-sm text-center">
              {account ? `كشف حساب ${account.name}` : 'كشف حساب ديون إجمالي'}
            </div>
          </div>

          {/* Table */}
          {account ? (
            <table className="w-full text-right border-collapse border border-black text-xs my-2">
              <thead>
                <tr className="bg-[#fcd34d] text-black font-black text-center border-b border-black">
                  <th className="p-1.5 border border-black w-8">م</th>
                  <th className="p-1.5 border border-black w-24">التاريخ</th>
                  <th className="p-1.5 border border-black">التفاصيل</th>
                  <th className="p-1.5 border border-black text-[#16a34a] w-24">الرصيد له</th>
                  <th className="p-1.5 border border-black text-[#dc2626] w-24">الرصيد عليه</th>
                  <th className="p-1.5 border border-black w-24">الرصيد</th>
                </tr>
              </thead>
              <tbody>
                {accountTxs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-center font-bold text-slate-500">
                      لا توجد عمليات مضافة لهذا الحساب.
                    </td>
                  </tr>
                ) : (
                  accountTxs.map((tx, idx) => {
                    const isDebit = tx.type === 'debit';
                    const amount = Number(tx.amount || 0);

                    if (isDebit) runningBalance -= amount;
                    else runningBalance += amount;

                    return (
                      <tr key={tx.id} className="border-b border-black text-center font-bold text-xs">
                        <td className="p-1.5 border border-black">{idx + 1}</td>
                        <td className="p-1.5 border border-black dir-ltr text-center">{tx.date}</td>
                        <td className="p-1.5 border border-black text-right font-medium">{tx.details || '-'}</td>
                        <td className="p-1.5 border border-black text-[#16a34a] font-extrabold dir-ltr">
                          {!isDebit ? amount.toLocaleString() : ''}
                        </td>
                        <td className="p-1.5 border border-black text-[#dc2626] font-extrabold dir-ltr">
                          {isDebit ? amount.toLocaleString() : ''}
                        </td>
                        <td className="p-1.5 border border-black font-black dir-ltr">
                          {Math.abs(runningBalance).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })
                )}

                <tr className="bg-slate-100 font-black text-center border-t-2 border-black">
                  <td colSpan={3} className="p-2 border border-black text-center text-sm">
                    إجمالي أرصدة العمليات
                  </td>
                  <td className="p-2 border border-black text-[#16a34a] font-black text-sm dir-ltr">
                    {totalOverallCredit > 0 ? totalOverallCredit.toLocaleString() : ''}
                  </td>
                  <td className="p-2 border border-black text-[#dc2626] font-black text-sm dir-ltr">
                    {totalOverallDebit > 0 ? totalOverallDebit.toLocaleString() : ''}
                  </td>
                  <td className="p-2 border border-black"></td>
                </tr>
              </tbody>
            </table>
          ) : (
            <table className="w-full text-right border-collapse border border-black text-xs my-2">
              <thead>
                <tr className="bg-[#fcd34d] text-black font-black text-center border-b border-black">
                  <th className="p-1.5 border border-black w-10">الرقم</th>
                  <th className="p-1.5 border border-black">اسم العميل</th>
                  <th className="p-1.5 border border-black text-[#16a34a] w-28">الرصيد له</th>
                  <th className="p-1.5 border border-black text-[#dc2626] w-28">الرصيد عليه</th>
                  <th className="p-1.5 border border-black w-28">الرصيد</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((acc, idx) => {
                  const accTotals = calculateAccountTotals(acc.id, transactions);
                  return (
                    <tr key={acc.id} className="border-b border-black text-center font-bold text-xs">
                      <td className="p-1.5 border border-black">{idx + 1}</td>
                      <td className="p-1.5 border border-black text-right font-bold">{acc.name}</td>
                      <td className="p-1.5 border border-black text-[#16a34a] font-extrabold dir-ltr">
                        {accTotals.isNetCredit ? accTotals.netAmount.toLocaleString() : ''}
                      </td>
                      <td className="p-1.5 border border-black text-[#dc2626] font-extrabold dir-ltr">
                        {accTotals.isNetDebit ? accTotals.netAmount.toLocaleString() : ''}
                      </td>
                      <td className="p-1.5 border border-black font-black dir-ltr">
                        {accTotals.netAmount.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* Footer Bar */}
          <div className="mt-8 border-t border-slate-300 pt-3 flex items-center justify-between text-xs text-slate-600 font-bold">
            <span>Page - 1</span>
            <span className="text-blue-700 font-bold underline">
              من خلال تطبيق دفتر الديون المجاني
            </span>
            <span>{todayStr}</span>
          </div>

          <div className="mt-4 pt-2 border-t border-dashed border-slate-400 text-center text-[11px] text-slate-800 space-y-0.5 font-bold">
            <p className="text-red-700">هذا التطبيق مجاني لوجه الله، ويكفينا دعوة صادقة منكم ❤️</p>
            <p>إعداد / محمد يحيى الصلاحي - اليمن - محافظة إب - هاتف +967773642547</p>
          </div>
        </div>
      </div>
    </div>
  );
};
