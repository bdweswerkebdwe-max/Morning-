import React, { useState } from 'react';
import { Layers, Sparkles, CheckCircle2, Play, RefreshCw, FolderKanban } from 'lucide-react';
import { User, WorkflowVariant } from '../types';

interface WorkflowStudioProps {
  user: User | null;
  onSaveProject: (title: string, type: any, content: any, platform: string) => void;
}

export const WorkflowStudio: React.FC<WorkflowStudioProps> = ({ user, onSaveProject }) => {
  const [productName, setProductName] = useState('');
  const [variantCount, setVariantCount] = useState<number>(4);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedVariants, setGeneratedVariants] = useState<WorkflowVariant[]>([]);

  const handleStartWorkflow = async () => {
    if (!productName.trim()) {
      alert('يرجى إدخال اسم المنتج لبدء توليد النسخ المتعددة');
      return;
    }
    setIsProcessing(true);

    try {
      await new Promise(r => setTimeout(r, 3000));

      const mockVariants: WorkflowVariant[] = [
        {
          id: 'var_1',
          hook: 'الخطاف 1: زاوية توفير الوقت وحل المشكلة',
          actorId: 'فيصل العتيبي (لهجة سعودية)',
          language: 'العربية',
          aspectRatio: '9:16 (TikTok)',
          status: 'completed',
          resultUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        },
        {
          id: 'var_2',
          hook: 'الخطاف 2: زاوية الخصم الفوري والعرض المحدود',
          actorId: 'كريم السيد (لهجة مصرية)',
          language: 'العربية',
          aspectRatio: '9:16 (Snapchat)',
          status: 'completed',
          resultUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        },
        {
          id: 'var_3',
          hook: 'الخطاف 3: زاوية مقارنة قبل وبعد الاستخدام',
          actorId: 'نوف الزهراني (لهجة سعودية)',
          language: 'العربية',
          aspectRatio: '1:1 (Instagram)',
          status: 'completed',
          resultUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        },
        {
          id: 'var_4',
          hook: 'الخطاف 4: النسخة المترجمة العالمية',
          actorId: 'Sophia Vance (English)',
          language: 'English',
          aspectRatio: '16:9 (YouTube)',
          status: 'completed',
          resultUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        },
      ];

      setGeneratedVariants(mockVariants);

      onSaveProject(
        `حزمة أتمتة إعلانية: ${productName}`,
        'workflow',
        { productName, variants: mockVariants },
        'Multi-Format'
      );
    } catch (e: any) {
      alert('حدث خطأ أثناء تنفيذ الأتمتة');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 px-3 py-1 rounded-full text-xs font-bold">
            <Layers className="w-4 h-4" />
            <span>محرك أتمتة الإعلانات وتكثير النسخ (Workflow Batch)</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            استوديو أتمتة وإنتاج النسخ الإعلانية المتعددة
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            أدخل منتجك مرة واحدة، وسيساعدك النظام على إنتاج 4-8 نسخ إعلانية مختلفة تلقائياً بتغيير الخطافات، الممثلين، اللهجات، والمقاسات لاختبار (A/B Testing).
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-7">
            <label className="text-xs font-bold text-slate-300 block mb-1.5">اسم المنتج المراد إنتاج نسخ إعلانية له:</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="مثال: حقيبة أعمال فاخرة ضد السرقة..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="md:col-span-3">
            <label className="text-xs font-bold text-slate-300 block mb-1.5">عدد النسخ المطلوبة:</label>
            <select
              value={variantCount}
              onChange={(e) => setVariantCount(Number(e.target.value))}
              className="w-full bg-slate-950 text-slate-200 text-xs border border-slate-800 rounded-xl px-4 py-3 font-semibold focus:outline-none focus:border-indigo-500"
            >
              <option value={4}>4 نسخ متوافقة مع A/B Test</option>
              <option value={6}>6 نسخ شاملة بجميع اللهجات</option>
              <option value={8}>8 نسخ متقدمة لجميع المنصات</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <button
              onClick={handleStartWorkflow}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-1.5 text-xs whitespace-nowrap"
            >
              {isProcessing ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>جاري الأتمتة...</span>
                </>
              ) : (
                <>
                  <Layers className="w-4 h-4" />
                  <span>بدء الأتمتة 🚀</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Generated Workflow Variants */}
      {generatedVariants.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>حزمة النسخ الإعلانية المولدة ({generatedVariants.length} نسخ)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {generatedVariants.map((variant) => (
              <div key={variant.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-4 space-y-3 shadow-xl">
                <div className="aspect-[9/16] max-h-[220px] mx-auto bg-black rounded-xl overflow-hidden relative">
                  <video src={variant.resultUrl} controls className="w-full h-full object-cover" />
                </div>
                <div>
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-bold">
                    {variant.aspectRatio}
                  </span>
                  <h4 className="text-xs font-bold text-white mt-1.5">{variant.hook}</h4>
                  <p className="text-[10px] text-slate-400 mt-1">الممثل: {variant.actorId}</p>
                </div>
                <a
                  href={variant.resultUrl}
                  download="ad-variant.mp4"
                  className="w-full block text-center bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 rounded-xl text-[10px] transition"
                >
                  تحميل هذه النسخة 📥
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
