import React, { useState, useEffect } from 'react';
import { X, CloudUpload, CloudDownload, HardDrive, CheckCircle2, RefreshCw, LogIn, AlertCircle } from 'lucide-react';
import { AppSettings, Account, Transaction, Category, Currency } from '../types';
import {
  signInWithGoogleDrive,
  uploadBackupToGoogleDrive,
  listDriveBackups,
  downloadAndRestoreFromDrive,
  getCachedAccessToken,
  DriveBackupFile,
  auth,
} from '../utils/googleDrive';

interface GoogleDriveBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  currencies: Currency[];
  onRestoreSuccess: () => void;
}

export const GoogleDriveBackupModal: React.FC<GoogleDriveBackupModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onRestoreSuccess,
}) => {
  const [userEmail, setUserEmail] = useState<string>(
    auth.currentUser?.email || settings.googleDriveEmail || ''
  );
  const [token, setToken] = useState<string | null>(getCachedAccessToken());
  const [isConnecting, setIsConnecting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [driveBackups, setDriveBackups] = useState<DriveBackupFile[]>([]);

  useEffect(() => {
    if (auth.currentUser?.email) {
      setUserEmail(auth.currentUser.email);
    }
  }, [auth.currentUser]);

  // Load backups list if token exists on open
  useEffect(() => {
    if (isOpen && token) {
      refreshBackupsList(token);
    }
  }, [isOpen, token]);

  if (!isOpen) return null;

  const refreshBackupsList = async (authToken: string) => {
    setIsLoadingList(true);
    try {
      const files = await listDriveBackups(authToken);
      setDriveBackups(files);
    } catch {
      // ignore
    } finally {
      setIsLoadingList(false);
    }
  };

  const handleConnectAccount = async () => {
    setIsConnecting(true);
    setStatusMessage('جاري فتح نافذة جوجل لمنح الصلاحيات والاتصال بـ Google Drive...');

    try {
      const { user, accessToken } = await signInWithGoogleDrive();
      setToken(accessToken);
      setUserEmail(user.email || 'حساب جوجل');

      onSaveSettings({
        ...settings,
        googleDriveEmail: user.email || '',
      });

      setStatusMessage(`✅ تم الاتصال بنجاح وتوثيق الحساب مع Google Drive (${user.email})`);
      refreshBackupsList(accessToken);
    } catch (err: any) {
      console.error(err);
      setStatusMessage(`❌ فشل الاتصال: ${err.message || 'تعذر الربط مع حساب جوجل'}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleBackupToDrive = async () => {
    let currentToken = token;

    if (!currentToken) {
      try {
        setIsConnecting(true);
        setStatusMessage('يرجى تسجيل الدخول أولاً ومنح الصلاحيات لجوجل درايف...');
        const { user, accessToken } = await signInWithGoogleDrive();
        currentToken = accessToken;
        setToken(accessToken);
        setUserEmail(user.email || '');
      } catch (err: any) {
        setStatusMessage(`❌ يرجى منح الصلاحيات للاتصال بجوجل درايف أولاً`);
        setIsConnecting(false);
        return;
      } finally {
        setIsConnecting(false);
      }
    }

    setIsUploading(true);
    setStatusMessage('جاري إنشاء مجلد "إدارة الديون - النسخ الاحتياطية" ورفع الملف على Google Drive...');

    try {
      const newBackup = await uploadBackupToGoogleDrive(currentToken);
      setStatusMessage(`✅ تم إنشاء المجلد "إدارة الديون - النسخ الاحتياطية" ورفع النسخة الاحتياطية بنجاح على Google Drive (${userEmail})`);
      refreshBackupsList(currentToken);
    } catch (err: any) {
      console.error(err);
      setStatusMessage(`❌ حدث خطأ أثناء الرفع إلى Google Drive: ${err.message || 'تعذر رفع الملف'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRestoreFromDrive = async (file: DriveBackupFile) => {
    if (!token) {
      alert('الرجاء تسجيل الدخول لحساب جوجل أولاً');
      return;
    }

    if (!confirm(`هل أنت تأكد من استرجاع النسخة الاحتياطية "${file.name}" المؤرخة بـ ${file.date}؟\nسيتم استبدال البيانات الحالية بها.`)) {
      return;
    }

    setIsRestoring(true);
    setStatusMessage('جاري تحميل واسترجاع الملف من جوجل درايف...');

    try {
      const success = await downloadAndRestoreFromDrive(token, file.id);
      if (success) {
        setStatusMessage('✅ تم استرجاع النسخة الاحتياطية بنجاح من Google Drive!');
        setTimeout(() => {
          onRestoreSuccess();
          onClose();
        }, 1000);
      } else {
        setStatusMessage('❌ تعذر استرجاع النسخة الاحتياطية (تنسيق الملف غير صالح)');
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage(`❌ خطأ في الاسترجاع: ${err.message || 'تعذر تحميل الملف'}`);
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in" dir="rtl">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-[#7A0C1E] text-white p-4 flex items-center justify-between border-b border-red-950">
          <div className="flex items-center gap-2">
            <HardDrive className="w-6 h-6 text-amber-300" />
            <h2 className="font-bold text-lg">النسخ الاحتياطي على جوجل درايف</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 transition text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 text-slate-800 text-sm">
          {/* Account Selection Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
            <label className="text-xs font-bold text-slate-600 block">ربط وتوثيق حساب جوجل (Google Drive Permission)</label>
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-lg px-3 py-2.5 truncate dir-ltr text-right">
                {userEmail || 'غير متصل بأي حساب'}
              </div>
              <button
                onClick={handleConnectAccount}
                disabled={isConnecting}
                className="bg-[#7A0C1E] text-white px-3.5 py-2.5 rounded-lg text-xs font-bold hover:bg-red-900 transition flex items-center gap-1.5 shrink-0 shadow-2xs"
              >
                {isConnecting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                <span>{userEmail ? 'تغيير الحساب' : 'تسجيل الدخول بمنح الصلاحية'}</span>
              </button>
            </div>
            {token && userEmail && (
              <p className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 p-1.5 rounded-md border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>تم منح الصلاحية والمتصل حالياً بالحساب: {userEmail}</span>
              </p>
            )}
          </div>

          {/* Create Backup Action */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 space-y-2">
            <h3 className="font-bold text-amber-950 text-sm">إنشاء مجلد وحفظ نسخة جديدة</h3>
            <p className="text-xs text-amber-800 leading-relaxed font-medium">
              عند الضغط، سيقوم التطبيق تلقائياً بإنشاء مجلد باسم <span className="font-extrabold text-amber-950 bg-amber-100/80 px-1 py-0.5 rounded">"إدارة الديون - النسخ الاحتياطية"</span> داخل حسابك في Google Drive ورفع نسخة مشفرة وآمنة من بياناتك.
            </p>
            <button
              onClick={handleBackupToDrive}
              disabled={isUploading || isConnecting}
              className="w-full bg-emerald-600 text-white font-bold py-2.5 rounded-xl shadow hover:bg-emerald-700 transition flex items-center justify-center gap-2 text-xs mt-2"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جاري الرفع والحفظ على Google Drive...</span>
                </>
              ) : (
                <>
                  <CloudUpload className="w-4 h-4" />
                  <span>حفظ نسخة احتياطية الآن على Google Drive</span>
                </>
              )}
            </button>
          </div>

          {/* Status Message Alert */}
          {statusMessage && (
            <div className={`p-3 rounded-xl text-xs font-bold flex items-start gap-2 animate-fade-in ${
              statusMessage.startsWith('❌')
                ? 'bg-red-50 border border-red-200 text-red-900'
                : 'bg-blue-50 border border-blue-200 text-blue-900'
            }`}>
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Restore Backups List */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-xs">
                النسخ الاحتياطية الموجودة في مجلد Google Drive ({driveBackups.length})
              </h3>
              {token && (
                <button
                  onClick={() => refreshBackupsList(token)}
                  disabled={isLoadingList}
                  className="text-[11px] text-blue-700 font-bold hover:underline flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoadingList ? 'animate-spin' : ''}`} />
                  <span>تحديث</span>
                </button>
              )}
            </div>

            {driveBackups.length === 0 ? (
              <div className="text-center p-5 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-xs text-slate-500 font-medium">
                {token ? 'لا توجد نسخ احتياطية داخل مجلد Google Drive حتى الآن.' : 'قم بتسجيل الدخول بأعلاه لعرض النسخ الاحتياطية المخزنة على Google Drive.'}
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {driveBackups.map((file) => (
                  <div
                    key={file.id}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between hover:bg-slate-100 transition"
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="font-bold text-slate-800 text-xs truncate dir-ltr text-right">{file.name}</p>
                      <p className="text-[10px] text-slate-500 font-semibold">{file.date} ({file.size})</p>
                    </div>

                    <button
                      onClick={() => handleRestoreFromDrive(file)}
                      disabled={isRestoring}
                      className="px-3 py-1.5 bg-[#7A0C1E] text-white text-xs font-bold rounded-lg hover:bg-red-900 transition flex items-center gap-1 shrink-0 shadow-2xs"
                    >
                      <CloudDownload className="w-3.5 h-3.5" />
                      <span>استرجاع</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-300 text-slate-800 font-bold rounded-xl text-xs hover:bg-slate-400 transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
