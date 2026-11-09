import React, { useState } from 'react';
import { Languages, Sparkles, Copy, CheckCircle2, Volume2, Globe, FileText } from 'lucide-react';
import { User } from '../types';

interface TranslatorStudioProps {
  user: User | null;
  token?: string | null;
  setUser?: (user: User) => void;
  onSaveProject: (title: string, type: any, content: any, platform: string) => void;
}

export const TranslatorStudio: React.FC<TranslatorStudioProps> = ({ user, token, setUser, onSaveProject }) => {
  const [sourceText, setSourceText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('الإنجليزية (US English)');
  const [sourceLanguage, setSourceLanguage] = useState('العربية (MSA / اللهجة الخليجية)');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedResult, setTranslatedResult] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const languagesList = [
    'الإنجليزية (US English)',
    'الإنجليزية (UK English)',
    'الفرنسية (French)',
    'الإسبانية (Spanish)',
    'الألمانية (German)',
    'التركية (Turkish)',
    'الإيطالية (Italian)',
    'الأوردو (Urdu)',
    'الصينية (Mandarin Chinese)',
    'اللهجة السعودية (Saudi Dialect)',
    'اللهجة المصرية (Egyptian Dialect)',
    'اللهجة الإماراتية (Emirati Dialect)',
    'الفصحى الرسمية (Modern Standard Arabic)',
  ];

  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      setError('يرجى إدخال النص الإعلاني المراد ترجمته ودبلجته');
      return;
    }
    setError(null);
    setIsTranslating(true);

    try {
      const res = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          text: sourceText,
          targetLanguage,
          sourceLanguage,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTranslatedResult(data.translatedText);
        if (data.user && setUser) {
          setUser(data.user);
        }
        onSaveProject(
          `ترجمة إعلان: ${targetLanguage}`,
          'translation',
          { originalText: sourceText, translatedText: data.translatedText, targetLanguage },
          '9:16'
        );
      } else {
        throw new Error(data.error || 'فشلت عملية الترجمة');
      }
    } catch (e: any) {
      setError(e.message || 'حدث خطأ أثناء الترجمة والدبلجة');
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-orange-950/40 border border-slate-800 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 text-orange-400 px-3 py-1 rounded-full text-xs font-bold">
            <Languages className="w-4 h-4" />
            <span>المترجم الإعلاني والدبلجة المتقنة</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            استوديو الترجمة والدبلجة الإعلانية (AI Translator)
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            ترجمة النصوص والسيناريوهات الإعلانية بدقة فائقة مع تكييف النبرة التسويقية ومزامنة الشفاه والدبلجة الصوتية لأكثر من 15 لغة ولهجة.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">اللغة الأصلية:</label>
              <select
                value={sourceLanguage}
                onChange={(e) => setSourceLanguage(e.target.value)}
                className="w-full bg-slate-950 text-slate-200 text-xs border border-slate-800 rounded-xl px-4 py-3 font-semibold focus:outline-none focus:border-orange-500"
              >
                {languagesList.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">اللغة المستهدفة للترجمة:</label>
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className="w-full bg-slate-950 text-slate-200 text-xs border border-slate-800 rounded-xl px-4 py-3 font-semibold focus:outline-none focus:border-orange-500"
              >
                {languagesList.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">النص الإعلاني الأصلي:</label>
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              rows={6}
              placeholder="ضع النص أو السيناريو الإعلاني هنا للترجمة والدبلجة..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-white focus:outline-none focus:border-orange-500 resize-none leading-relaxed"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 font-bold">
              {error}
            </div>
          )}

          <button
            onClick={handleTranslate}
            disabled={isTranslating}
            className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-orange-600/30 transition flex items-center justify-center gap-2"
          >
            {isTranslating ? (
              <>
                <Sparkles className="w-5 h-5 animate-spin" />
                <span>جاري ترجمة ودبلجة النص الإعلاني...</span>
              </>
            ) : (
              <>
                <Globe className="w-5 h-5" />
                <span>بدء الترجمة والدبلجة الذكية (نقطة واحدة)</span>
              </>
            )}
          </button>
        </div>

        {/* Translation Output */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-xl min-h-[480px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Languages className="w-4 h-4 text-orange-400" />
              <span>نتيجة الترجمة والدبلجة المعتمدة</span>
            </h3>

            {translatedResult && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(translatedResult);
                  setIsCopied(true);
                  setTimeout(() => setIsCopied(false), 2000);
                }}
                className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg transition"
              >
                {isCopied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'تم النسخ!' : 'نسخ النص'}</span>
              </button>
            )}
          </div>

          {translatedResult ? (
            <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap my-4 max-h-[380px] overflow-y-auto scrollbar-thin">
              {translatedResult}
            </div>
          ) : (
            <div className="my-auto text-center space-y-3 p-8 border border-dashed border-slate-800 rounded-2xl bg-slate-950/40">
              <Globe className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">ستظهر ترجمة النص مع توقيت الدبلجة ومزامنة الصوت هنا</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
