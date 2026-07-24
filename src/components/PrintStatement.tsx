import React from 'react';
import { Account, Transaction, AppSettings } from '../types';
import { calculateAccountTotals } from '../utils/storage';

interface PrintStatementProps {
  account: Account | null;
  accounts?: Account[];
  transactions: Transaction[];
  settings: AppSettings;
}

export const PrintStatement: React.FC<PrintStatementProps> = ({
  account,
  accounts = [],
  transactions,
  settings,
}) => {
  const isOverallSummary = !account && accounts.length > 0;
  if (!account && !isOverallSummary) return null;

  const accountTxs = account ? transactions.filter((t) => t.accountId === account.id) : [];
  const totals = account ? calculateAccountTotals(account.id, transactions) : { totalDebit: 0, totalCredit: 0, netAmount: 0, isNetCredit: false, isNetDebit: false };

  // Calculate overall total for all transactions
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
  const todayStr = new Date().toLocaleDateString('en-GB'); // e.g. 24/7/2026

  return (
    <div className="hidden print:block print:fixed print:inset-0 print:bg-white print:z-[9999] print:p-6 text-black font-sans leading-tight" dir="rtl">
      {/* 1. Header Box matching Screenshot 1 & 2 */}
      <div className="border border-black p-3 rounded-xs mb-3">
        <div className="grid grid-cols-3 items-center text-center">
          {/* Left info */}
          <div className="text-left font-bold text-xs space-y-0.5 dir-ltr">
            <p className="font-black text-sm">{settings.appName || 'Debt Book'}</p>
            <p className="text-slate-700">Yemen</p>
            {settings.phone && <p className="text-slate-900">{settings.phone}</p>}
          </div>

          {/* Center Logo / Photo */}
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

      {/* 2. Title badge in center matching Screenshot 1 & 2 */}
      <div className="flex justify-center my-2">
        <div className="border border-black rounded-lg px-6 py-1 bg-white shadow-2xs font-black text-sm text-center">
          {account ? `كشف حساب ${account.name}` : 'كشف حساب ديون إجمالي'}
        </div>
      </div>

      {/* 3. Table matching Screenshot 1 & 2 */}
      {account ? (
        /* Detailed Account Statement Table */
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

            {/* Totals Footer Row matching Screenshot 1 */}
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
        /* Overall Accounts List Table matching Screenshot 2 */
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

      {/* Page Footer bar matching Screenshot 1 & 2 */}
      <div className="mt-6 border-t border-slate-300 pt-3 flex items-center justify-between text-xs text-slate-600 font-bold">
        <span>Page - 1</span>
        <span className="text-blue-700 font-bold underline cursor-pointer">
          من خلال تطبيق دفتر الديون المجاني
        </span>
        <span>{todayStr}</span>
      </div>

      {/* Mandatory Developer & Sadaqah info */}
      <div className="mt-4 pt-2 border-t border-dashed border-slate-400 text-center text-[11px] text-slate-800 space-y-0.5 font-bold">
        <p className="text-red-700">هذا التطبيق مجاني لوجه الله، ويكفينا دعوة صادقة منكم ❤️</p>
        <p>إعداد / محمد يحيى الصلاحي - اليمن - محافظة إب - هاتف +967773642547</p>
      </div>
    </div>
  );
};

