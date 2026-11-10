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
      <div className="bg-white border border-neutral-200 rounded-3xl p-8 relative overflow-hidden shadow-sm">
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-neutral-100 border border-neutral-200 text-neutral-800 px-3 py-1 rounded-full text-xs font-bold">
            <Layers className="w-4 h-4 text-neutral-600" />
            <span>محرك أتمتة الإعلانات وتكثير النسخ (Workflow Batch)</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-neutral-900">
            استوديو أتمتة وإنتاج النسخ الإعلانية المتعددة
          </h1>
          <p className="text-sm text-neutral-600 leading-relaxed">
            أدخل منتجك مرة واحدة، وسيساعدك النظام على إنتاج 4-8 نسخ إعلانية مختلفة تلقائياً بتغيير الخطافات، الممثلين، اللهجات، والمقاسات لاختبار (A/B Testing).
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white border border-neutral-200 rounded-3xl p-6 space-y-5 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-7">
            <label className="text-xs font-bold text-neutral-700 block mb-1.5">اسم المنتج المراد إنتاج نسخ إعلانية له:</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="مثال: حقيبة أعمال فاخرة ضد السرقة..."
              className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-xs text-neutral-900 focus:outline-none focus:border-neutral-400"
            />
          </div>

          <div className="md:col-span-3">
            <label className="text-xs font-bold text-neutral-700 block mb-1.5">عدد النسخ المطلوبة:</label>
            <select
              value={variantCount}
              onChange={(e) => setVariantCount(Number(e.target.value))}
              className="w-full bg-white text-neutral-900 text-xs border border-neutral-200 rounded-xl px-4 py-3 font-semibold focus:outline-none focus:border-neutral-400"
            >
              <option value={4}>4 نسخ متوافقة مع A/B Test</option>
              <option value={6}>6 نسخ شاملة بجميع اللهجات</option>
              <option value={8}>8 نسخ متتقدمة لجميع المنصات</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <button
              onClick={handleStartWorkflow}
              disabled={isProcessing}
              className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-3 rounded-xl shadow-sm transition flex items-center justify-center gap-1.5 text-xs whitespace-nowrap"
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
          <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>حزمة النسخ الإعلانية المولدة ({generatedVariants.length} نسخ)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {generatedVariants.map((variant) => (
              <div key={variant.id} className="bg-white border border-neutral-200 rounded-2xl overflow-hidden p-4 space-y-3 shadow-sm">
                <div className="aspect-[9/16] max-h-[220px] mx-auto bg-black rounded-xl overflow-hidden relative">
                  <video src={variant.resultUrl} controls className="w-full h-full object-cover" />
                </div>
                <div>
                  <span className="text-[10px] bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded-full font-bold border border-neutral-200">
                    {variant.aspectRatio}
                  </span>
                  <h4 className="text-xs font-bold text-neutral-900 mt-1.5">{variant.hook}</h4>
                  <p className="text-[10px] text-neutral-500 mt-1">الممثل: {variant.actorId}</p>
                </div>
                <a
                  href={variant.resultUrl}
                  download="ad-variant.mp4"
                  className="w-full block text-center bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold py-2 rounded-xl text-[10px] transition"
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
