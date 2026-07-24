import React, { useState } from 'react';
import { Lock, KeyRound, Check, X } from 'lucide-react';
import { AppSettings } from '../types';

interface PinLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSavePin: (pinCode: string, isRequired: boolean) => void;
  isUnlockMode?: boolean;
  onUnlockSuccess?: () => void;
}

export const PinLockModal: React.FC<PinLockModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSavePin,
  isUnlockMode = false,
  onUnlockSuccess,
}) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === settings.pinCode) {
      setErrorMsg('');
      onUnlockSuccess?.();
    } else {
      setErrorMsg('الرقم السري غير صحيح');
    }
  };

  const handleSaveSetup = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 4) {
      setErrorMsg('يجب أن يتكون الرقم السري من 4 أرقام على الأقل');
      return;
    }
    if (pin !== confirmPin) {
      setErrorMsg('الرقم السري غير متطابق');
      return;
    }

    onSavePin(pin, true);
    alert('تم تفعيل القفل بنجاح');
    onClose();
  };

  const handleDisablePin = () => {
    onSavePin('', false);
    alert('تم إلغاء القفل بنجاح');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" dir="rtl">
      <div className="bg-white w-full max-w-xs rounded-2xl p-5 shadow-2xl space-y-4 text-slate-800">
        <div className="flex flex-col items-center justify-center space-y-2 text-center">
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-[#1E2B6C] flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="font-bold text-base">
            {isUnlockMode ? 'إدخال الرقم السري لفتح التطبيق' : 'إعداد رمز حماية التطبيق (PIN)'}
          </h2>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-bold p-2 rounded-lg text-center">
            {errorMsg}
          </div>
        )}

        {isUnlockMode ? (
          <form onSubmit={handleUnlock} className="space-y-3">
            <input
              type="password"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="****"
              className="w-full text-center text-2xl font-mono font-black p-2 border border-slate-300 rounded-xl outline-none focus:border-[#1E2B6C]"
              autoFocus
              required
            />
            <button
              type="submit"
              className="w-full py-2.5 bg-[#1E2B6C] text-white font-bold rounded-xl shadow hover:bg-blue-900 transition text-sm"
            >
              فتح التطبيق
            </button>
          </form>
        ) : (
          <form onSubmit={handleSaveSetup} className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-500">أدخل الرقم السري (4 أرقام)</label>
              <input
                type="password"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="****"
                className="w-full text-center text-xl font-mono font-bold p-2 border border-slate-300 rounded-xl outline-none mt-1"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500">تأكيد الرقم السري</label>
              <input
                type="password"
                maxLength={6}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                placeholder="****"
                className="w-full text-center text-xl font-mono font-bold p-2 border border-slate-300 rounded-xl outline-none mt-1"
                required
              />
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="submit"
                className="w-full py-2.5 bg-[#1E2B6C] text-white font-bold rounded-xl text-xs shadow"
              >
                حفظ وتفعيل القفل
              </button>

              {settings.isPinRequired && (
                <button
                  type="button"
                  onClick={handleDisablePin}
                  className="w-full py-2 bg-red-50 text-red-600 font-bold rounded-xl text-xs border border-red-200"
                >
                  إلغاء قفل التطبيق
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 bg-slate-100 text-slate-600 font-bold rounded-xl text-xs"
              >
                إلغاء
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
