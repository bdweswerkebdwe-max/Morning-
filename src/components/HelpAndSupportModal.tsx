import React, { useState } from 'react';
import { HelpCircle, FileText, MessageSquare, ShieldCheck, X, CheckCircle2, Send } from 'lucide-react';

interface HelpAndSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpAndSupportModal: React.FC<HelpAndSupportModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'faq' | 'support' | 'legal'>('faq');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSent, setSupportSent] = useState(false);

  if (!isOpen) return null;

  const faqs = [
    { q: 'كيف أستفيد من منصة MOLAN AI في إنشاء فيديوهات إعلانية؟', a: 'يمكنك إدخال اسم منتجك أو صورتك في استوديو الفيديو، وسيساعدك نموذج الذكاء الاصطناعي على توليد إعلان تجاري حقيقي بالصوت والصورة بمدة 5 أو 10 ثوانٍ.' },
    { q: 'هل حقوق استخدام الممثلين الافتراضيين مرخصة تجارياً؟', a: 'نعم، جميع شخصيات AI Avatars في المنصة مرخصة ومطابقة للحقوق التجارية وحقوق الاستخدام على المنصات الإعلانية.' },
    { q: 'ما هي سياسة استرجاع النقاط عند فشل التوليد؟', a: 'المنصة تفحص الحصة والرصيد أولاً، وفي حال حدوث أي خطأ في الاتصال لا يتم خصم أي نقطة، وفي حال خُصمت يُعاد الرصيد فوراً.' },
  ];

  const handleSendSupport = () => {
    if (!supportMessage.trim()) return;
    setSupportSent(true);
    setTimeout(() => {
      setSupportSent(false);
      setSupportMessage('');
      alert('تم إرسال رسالتك لفريق الدعم الفني، وسنتواصل معك خلال 24 ساعة!');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4" dir="rtl">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">مركز الدعم والأسئلة والسياسات (Help & Legal)</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 bg-slate-950 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('faq')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${activeTab === 'faq' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            الأسئلة الشائعة (FAQs)
          </button>
          <button
            onClick={() => setActiveTab('support')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${activeTab === 'support' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            الدعم الفني المباشر
          </button>
          <button
            onClick={() => setActiveTab('legal')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${activeTab === 'legal' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            السياسات والشروط
          </button>
        </div>

        {activeTab === 'faq' && (
          <div className="space-y-4">
            {faqs.map((f, i) => (
              <div key={i} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                <h3 className="text-xs font-bold text-amber-400">س: {f.q}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">ج: {f.a}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'support' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">اكتب استفسارك أو مشكلتك الفنية:</label>
              <textarea
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                rows={4}
                placeholder="صف استفسارك أو مشكلتك بالتفصيل..."
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>
            <button
              onClick={handleSendSupport}
              className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-xl text-xs transition flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>إرسال طلب الدعم الفني</span>
            </button>
          </div>
        )}

        {activeTab === 'legal' && (
          <div className="space-y-4 text-xs text-slate-300 leading-relaxed bg-slate-950 p-5 rounded-2xl border border-slate-800 max-h-[300px] overflow-y-auto">
            <h4 className="font-bold text-amber-400 text-sm">سياسة الخصوصية وحقوق المحتوى (Privacy & Licensing):</h4>
            <p>1. يحصل المستخدم على كامل حقوق الاستخدام التجاري لجميع الفيديوهات والنصوص والصور المولدة عبر حسابه.</p>
            <p>2. تلتزم منصة MOLAN AI بحماية بيانات المستخدمين وعدم مشاركتها مع أي طرف ثالث.</p>
            <p>3. يلتزم المستخدم بمراعاة الأنظمة المحلية وعدم استخدام المنصة لإنتاج محتوى مخالف أو مضلل.</p>
            <h4 className="font-bold text-amber-400 text-sm mt-3">سياسة الاسترداد (Refund Policy):</h4>
            <p>يتم إرجاع النقاط تلقائياً في حال فشل أي عملية توليد بسبب انقطاع الاتصال أو خطأ الخادم.</p>
          </div>
        )}
      </div>
    </div>
  );
};
