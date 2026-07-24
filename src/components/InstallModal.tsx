import React from 'react';
import { X, Smartphone, Download, CheckCircle2, Share2, HelpCircle } from 'lucide-react';
import { AppSettings } from '../types';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
}

export const InstallModal: React.FC<InstallModalProps> = ({ isOpen, onClose, settings }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in" dir="rtl">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#7A0C1E] text-white p-4 flex items-center justify-between border-b border-red-950">
          <div className="flex items-center gap-2">
            <Smartphone className="w-6 h-6 text-amber-300" />
            <h2 className="font-bold text-lg">تثبيت التطبيق على الهاتف (APK / App)</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4 text-slate-800 text-sm flex-1">
          {/* Method 1: PWA Instant Installation */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <h3 className="font-extrabold text-emerald-950 text-sm">الطريقة الأولى: التثبيت المباشر كتطبيق (PWA)</h3>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed font-medium">
              يمكنك إضافة هذا التطبيق فوراً كرمز تطبيق على شاشة هاتفك الرئيسية دون الحاجة لمتجر متجر بلاي:
            </p>
            <ol className="list-decimal list-inside text-xs text-emerald-900 font-bold space-y-1 pr-2">
              <li>افتح القائمة الخيارات في متصفحك (النقاط الثلاث ⋯ بالأعلى).</li>
              <li>اختر <span className="text-emerald-900 bg-emerald-100 px-1.5 py-0.5 rounded">"الإضافة إلى الشاشة الرئيسية"</span> أو <span className="text-emerald-900 bg-emerald-100 px-1.5 py-0.5 rounded">"تثبيت التطبيق"</span>.</li>
              <li>سيظهر شعار التطبيق <span className="font-extrabold">"إدارة الديون"</span> على شاشة هاتفك وسيعمل بدون إنترنت 100%!</li>
            </ol>
          </div>

          {/* Method 2: Convert to APK via PWABuilder / WebsiteToAPK */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center gap-2">
              <Download className="w-5 h-5 text-indigo-600 shrink-0" />
              <h3 className="font-extrabold text-slate-900 text-sm">الطريقة الثانية: تحويل المشروع إلى ملف APK للأندرويد</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              للحصول على ملف بصيغة <span className="font-extrabold text-indigo-700">.APK</span> لتثبيته أو مشاركته عبر الواتساب:
            </p>
            <ul className="list-disc list-inside text-xs text-slate-700 space-y-1.5 pr-2 font-semibold">
              <li>
                قم بتصدير الكود المصدري للمشروع (Export to ZIP / GitHub) من قائمة الإعدادات العلوية.
              </li>
              <li>
                استخدم أداة مجانية مثل <span className="font-bold text-indigo-700">PWABuilder.com</span> أو <span className="font-bold text-indigo-700">Web2APK</span> لتحويل رابط التطبيق أو الكود إلى ملف APK أندرويد جاهز خلال دقيقة واحدة.
              </li>
            </ul>
          </div>

          {/* Share App link */}
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-center justify-between">
            <div className="text-xs font-bold text-amber-900">رابط التطبيق المباشر للمشاركة</div>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: settings.appName,
                    text: 'تطبيق إدارة الديون والحسابات آمن ويعمل بدون إنترنت.',
                    url: window.location.href,
                  }).catch(() => {});
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert('تم نسخ رابط التطبيق للحافظة بنجاح ✅');
                }
              }}
              className="px-3 py-1.5 bg-[#7A0C1E] text-white text-xs font-bold rounded-lg hover:bg-red-900 transition flex items-center gap-1 shrink-0"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>مشاركة الرابط</span>
            </button>
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
