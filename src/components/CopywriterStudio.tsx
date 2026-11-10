import React, { useState } from 'react';
import { Type, Sparkles, Copy, CheckCircle2, Send, FileText } from 'lucide-react';
import { User } from '../types';

interface CopywriterStudioProps {
  user: User | null;
  token?: string | null;
  setUser?: (user: User) => void;
  onSaveProject: (title: string, type: any, content: any, platform: string) => void;
  onSendScriptToVideoStudio?: (scriptText: string) => void;
}

export const CopywriterStudio: React.FC<CopywriterStudioProps> = ({ user, token, setUser, onSaveProject, onSendScriptToVideoStudio }) => {
  const [product, setProduct] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [framework, setFramework] = useState('AIDA');
  const [platform, setPlatform] = useState('TikTok');
  const [tone, setTone] = useState('حماسية ومقنعة');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedScript, setGeneratedScript] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCopywrite = async () => {
    if (!product.trim()) {
      setError('يرجى إدخال اسم أو وصف المنتج');
      return;
    }
    setError(null);
    setIsGenerating(true);

    try {
      const res = await fetch('/api/ai/copywrite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          product,
          targetAudience,
          framework,
          platform,
          tone,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setGeneratedScript(data.text);
        if (data.user && setUser) {
          setUser(data.user);
        }
      } else {
        throw new Error(data.error || 'فشل توليد النص الإعلاني');
      }
    } catch (e: any) {
      setError(e.message || 'حدث خطأ أثناء الاتصال بخدمة كاتب النصوص الذكي');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyText = () => {
    if (generatedScript) {
      navigator.clipboard.writeText(generatedScript);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" dir="rtl">
      {/* Header */}
      <div className="bg-white border border-neutral-200 rounded-3xl p-8 relative overflow-hidden shadow-sm">
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-neutral-100 border border-neutral-200 text-neutral-800 px-3 py-1 rounded-full text-xs font-bold">
            <Type className="w-4 h-4 text-neutral-600" />
            <span>خبير صياغة النصوص الإعلانية (AI Copywriter)</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-neutral-900">
            كاتب السيناريو والنصوص الإعلانية عالية التحويل
          </h1>
          <p className="text-sm text-neutral-600 leading-relaxed">
            قم بصياغة سيناريوهات إعلانية مبهرة تشمل 3 خطافات إعلانية قوية (Hooks) ونصاً صوتياً تفصيلياً مع نص الدعوة لاتخاذ إجراء المخصص لـ TikTok وReels وSnapchat.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Inputs */}
        <div className="lg:col-span-6 bg-white border border-neutral-200 rounded-3xl p-6 space-y-5 shadow-sm">
          <div>
            <label className="text-xs font-bold text-neutral-700 block mb-1.5">وصف المنتج أو الخدمة الإعلانية:</label>
            <textarea
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              rows={3}
              placeholder="مثال: منصة معلن لتوليد الفيديوهات بالذكاء الاصطناعي، توفر الوقت وتزيد مبيعات المتاجر..."
              className="w-full bg-white border border-neutral-200 rounded-2xl p-4 text-xs text-neutral-900 focus:outline-none focus:border-neutral-400 resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-neutral-700 block mb-1.5">الجمهور المستهدف (Target Audience):</label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="مثال: أصحاب المتاجر الإلكترونية، المسوقون، صناع المحتوى في الخليج..."
              className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-xs text-neutral-900 focus:outline-none focus:border-neutral-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1.5">منصة الإعلان:</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full bg-white text-neutral-900 text-xs border border-neutral-200 rounded-xl px-4 py-3 font-semibold focus:outline-none focus:border-neutral-400"
              >
                <option value="TikTok">تيك توك (TikTok Ads)</option>
                <option value="Reels">إنستغرام ريلز (Reels)</option>
                <option value="Snapchat">سناب شات (Snapchat)</option>
                <option value="YouTube">يوتيوب شورتس (Shorts)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1.5">إطار صياغة الإعلان (Framework):</label>
              <select
                value={framework}
                onChange={(e) => setFramework(e.target.value)}
                className="w-full bg-white text-neutral-900 text-xs border border-neutral-200 rounded-xl px-4 py-3 font-semibold focus:outline-none focus:border-neutral-400"
              >
                <option value="AIDA">إطار AIDA (انتباه ← اهتمام ← رغبة ← عمل)</option>
                <option value="PAS">إطار PAS (المشكلة ← القلق ← الحل المباشر)</option>
                <option value="BAB">إطار BAB (قبل الاستخدام ← بعد الاستخدام ← الجسر)</option>
                <option value="UGC_Hook">أسلوب UGC المباشر الشائع</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-bold">
              {error}
            </div>
          )}

          <button
            onClick={handleCopywrite}
            disabled={isGenerating}
            className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-4 rounded-2xl shadow-sm transition flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-5 h-5 animate-spin" />
                <span>جاري صياغة السيناريو الإعلاني...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>توليد السيناريو والنص الإعلاني (نقطة واحدة)</span>
              </>
            )}
          </button>
        </div>

        {/* Generated Script Result */}
        <div className="lg:col-span-6 bg-white border border-neutral-200 rounded-3xl p-6 flex flex-col justify-between shadow-sm min-h-[480px]">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-neutral-700" />
              <span>السيناريو الإعلاني المولد</span>
            </h3>

            {generatedScript && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyText}
                  className="flex items-center gap-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs px-3 py-1.5 rounded-lg transition"
                >
                  {isCopied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'تم النسخ!' : 'نسخ'}</span>
                </button>
                {onSendScriptToVideoStudio && (
                  <button
                    onClick={() => onSendScriptToVideoStudio(generatedScript)}
                    className="flex items-center gap-1 bg-neutral-900 hover:bg-neutral-800 text-white text-xs px-3 py-1.5 rounded-lg transition font-bold shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>إرسال لاستوديو الفيديو 🎬</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {generatedScript ? (
            <div className="bg-neutral-50 border border-neutral-200 p-5 rounded-2xl text-xs text-neutral-800 leading-relaxed font-sans whitespace-pre-wrap my-4 max-h-[400px] overflow-y-auto scrollbar-thin">
              {generatedScript}
            </div>
          ) : (
            <div className="my-auto text-center space-y-3 p-8 border border-dashed border-neutral-200 rounded-2xl bg-neutral-50">
              <Type className="w-12 h-12 text-neutral-400 mx-auto" />
              <p className="text-xs text-neutral-500">أدخل معلومات المنتج واضغط على زر التوليد للحصول على السيناريو الإعلاني المكتمل</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
