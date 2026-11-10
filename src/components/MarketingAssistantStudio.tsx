import React, { useState } from 'react';
import { Bot, Sparkles, Target, Calendar, CheckCircle2, Copy, TrendingUp, Lightbulb } from 'lucide-react';
import { User } from '../types';

interface MarketingAssistantStudioProps {
  user: User | null;
  token?: string | null;
  setUser?: (user: User) => void;
  onSaveProject: (title: string, type: any, content: any, platform: string) => void;
}

export const MarketingAssistantStudio: React.FC<MarketingAssistantStudioProps> = ({ user, token, setUser, onSaveProject }) => {
  const [product, setProduct] = useState('');
  const [goal, setGoal] = useState('زيادة المبيعات والتحويلات المباشرة (ROAS)');
  const [budget, setBudget] = useState('متوسطة (1,000$ - 5,000$)');
  const [country, setCountry] = useState('المملكة العربية السعودية ودول الخليج');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [planResult, setPlanResult] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreatePlan = async () => {
    if (!product.trim()) {
      setError('يرجى كتابة اسم المنتج أو الخدمة');
      return;
    }
    setError(null);
    setIsAnalyzing(true);

    try {
      const res = await fetch('/api/ai/marketing-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          product,
          goal,
          budget,
          country,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPlanResult(data.planText);
        if (data.user && setUser) {
          setUser(data.user);
        }
        onSaveProject(
          `خطة تسويق: ${product.slice(0, 20)}`,
          'marketing_plan',
          { planText: data.planText, product, goal, budget, country },
          'All'
        );
      } else {
        throw new Error(data.error || 'فشلت عملية إعداد الخطة التسويقية');
      }
    } catch (e: any) {
      setError(e.message || 'حدث خطأ أثناء بناء الخطة التسويقية الاستراتيجية');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" dir="rtl">
      {/* Header */}
      <div className="bg-white border border-neutral-200 rounded-3xl p-8 relative overflow-hidden shadow-sm">
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-neutral-100 border border-neutral-200 text-neutral-800 px-3 py-1 rounded-full text-xs font-bold">
            <Bot className="w-4 h-4 text-neutral-600" />
            <span>المستشار واستراتيجي التسويق الذكي</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-neutral-900">
            المساعد التسويقي وتخطيط الحملات (AI Marketing Assistant)
          </h1>
          <p className="text-sm text-neutral-600 leading-relaxed">
            احصل على استراتيجية إعلانية شاملة لمنتجك: تحليل الشريحة، الزوايا الإعلانية الأكثر تأثيراً، جدول محتوى إعلاني لمدة 7 أيام، وتوصيات التصوير.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form */}
        <div className="lg:col-span-5 bg-white border border-neutral-200 rounded-3xl p-6 space-y-5 shadow-sm">
          <div>
            <label className="text-xs font-bold text-neutral-700 block mb-1.5">اسم أو وصف المنتج التجاري:</label>
            <input
              type="text"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              placeholder="مثال: تطبيق توصيل هدايا، عطور فاخرة، دورة تدريبية..."
              className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-xs text-neutral-900 focus:outline-none focus:border-neutral-400"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-neutral-700 block mb-1.5">الهدف الرئيسي للحملة الإعلانية:</label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full bg-white text-neutral-900 text-xs border border-neutral-200 rounded-xl px-4 py-3 font-semibold focus:outline-none focus:border-neutral-400"
            >
              <option value="زيادة المبيعات والتحويلات المباشرة (ROAS)">زيادة المبيعات والتحويلات المباشرة (Sales & ROAS)</option>
              <option value="بناء الوعي والعلامة التجارية (Brand Awareness)">بناء الوعي والعلامة التجارية (Brand Awareness)</option>
              <option value="جمع بيانات العملاء المحتملين (Lead Generation)">جمع بيانات العملاء المحتملين (Lead Generation)</option>
              <option value="إعادة الاستهداف وتنشيط العملاء">إعادة الاستهداف وتنشيط العملاء (Retargeting)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-neutral-700 block mb-1.5">السوق المستهدف:</label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="مثال: المملكة العربية السعودية، الإمارات، مصر..."
              className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-xs text-neutral-900 focus:outline-none focus:border-neutral-400"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-bold">
              {error}
            </div>
          )}

          <button
            onClick={handleCreatePlan}
            disabled={isAnalyzing}
            className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-4 rounded-2xl shadow-sm transition flex items-center justify-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <Sparkles className="w-5 h-5 animate-spin" />
                <span>جاري دراسة ورسم الاستراتيجية التسويقية...</span>
              </>
            ) : (
              <>
                <TrendingUp className="w-5 h-5" />
                <span>إنشاء الخطة التسويقية الشاملة (نقطتان)</span>
              </>
            )}
          </button>
        </div>

        {/* Strategy Plan Output */}
        <div className="lg:col-span-7 bg-white border border-neutral-200 rounded-3xl p-6 flex flex-col justify-between shadow-sm min-h-[480px]">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-neutral-700" />
              <span>التقرير والاستراتيجية الموصى بها</span>
            </h3>

            {planResult && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(planResult);
                  setIsCopied(true);
                  setTimeout(() => setIsCopied(false), 2000);
                }}
                className="flex items-center gap-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs px-3 py-1.5 rounded-lg transition"
              >
                {isCopied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'تم النسخ!' : 'نسخ التقرير'}</span>
              </button>
            )}
          </div>

          {planResult ? (
            <div className="bg-neutral-50 border border-neutral-200 p-5 rounded-2xl text-xs text-neutral-800 leading-relaxed font-sans whitespace-pre-wrap my-4 max-h-[400px] overflow-y-auto scrollbar-thin">
              {planResult}
            </div>
          ) : (
            <div className="my-auto text-center space-y-3 p-8 border border-dashed border-neutral-200 rounded-2xl bg-neutral-50">
              <Bot className="w-12 h-12 text-neutral-400 mx-auto" />
              <p className="text-xs text-neutral-500">ستظهر نتائج الاستراتيجية والجدول الإعلاني المحلل بالذكاء الاصطناعي هنا</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
